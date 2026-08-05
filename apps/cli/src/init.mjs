import { constants } from "node:fs";
import { copyFile, lstat, mkdir, readFile, readdir } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SOURCE = fileURLToPath(new URL("../assets/possible", import.meta.url));
const INSTALL_SEGMENTS = [".agents", "skills", "possible"];

export class InstallConflictError extends Error {
  constructor(conflicts) {
    super(
      `Possible was not installed because existing files conflict:\n${conflicts
        .map((path) => `  - ${path}`)
        .join("\n")}\nMove or remove the conflicting path, then run the command again.`,
    );
    this.name = "InstallConflictError";
    this.conflicts = conflicts;
  }
}

const pathExists = async (path) => {
  try {
    return await lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
};

const listTree = async (root, current = "") => {
  const directory = join(root, current);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  const directories = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = join(current, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`The packaged Possible skill contains an unsupported symbolic link: ${child}`);
    }
    if (entry.isDirectory()) {
      directories.push(child);
      const nested = await listTree(root, child);
      directories.push(...nested.directories);
      files.push(...nested.files);
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`The packaged Possible skill contains an unsupported entry: ${child}`);
    }
    files.push(child);
  }

  return { directories, files };
};

const sameFile = async (left, right) => {
  const [leftContent, rightContent] = await Promise.all([readFile(left), readFile(right)]);
  return leftContent.equals(rightContent);
};

const displayPath = (projectRoot, path) => relative(projectRoot, path) || ".";

const assertInsideProject = (projectRoot, path) => {
  const rel = relative(projectRoot, path);
  if (rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) return;
  throw new Error(`Refusing to write outside the target project: ${path}`);
};

const ensureDirectory = async (projectRoot, path) => {
  assertInsideProject(projectRoot, path);
  try {
    await mkdir(path);
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }
  const stats = await lstat(path);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new InstallConflictError([displayPath(projectRoot, path)]);
  }
};

export async function installPossibleSkill({ projectDirectory = process.cwd(), sourceDirectory = DEFAULT_SOURCE } = {}) {
  const projectRoot = resolve(projectDirectory);
  const projectStats = await pathExists(projectRoot);
  if (!projectStats?.isDirectory()) {
    throw new Error(`Target project is not a directory: ${projectRoot}`);
  }

  const sourceRoot = resolve(sourceDirectory);
  const sourceStats = await pathExists(sourceRoot);
  if (!sourceStats?.isDirectory()) {
    throw new Error(`Packaged Possible skill is missing: ${sourceRoot}`);
  }

  const tree = await listTree(sourceRoot);
  const installRoot = join(projectRoot, ...INSTALL_SEGMENTS);
  const directoryPaths = [
    join(projectRoot, INSTALL_SEGMENTS[0]),
    join(projectRoot, ...INSTALL_SEGMENTS.slice(0, 2)),
    installRoot,
    ...tree.directories.map((path) => join(installRoot, path)),
  ];
  const conflicts = [];

  for (const path of directoryPaths) {
    assertInsideProject(projectRoot, path);
    const stats = await pathExists(path);
    if (stats && (!stats.isDirectory() || stats.isSymbolicLink())) {
      conflicts.push(displayPath(projectRoot, path));
    }
  }

  const missingFiles = [];
  for (const sourceRelativePath of tree.files) {
    const sourcePath = join(sourceRoot, sourceRelativePath);
    const destinationPath = join(installRoot, sourceRelativePath);
    assertInsideProject(projectRoot, destinationPath);
    const stats = await pathExists(destinationPath);
    if (!stats) {
      missingFiles.push({ sourcePath, destinationPath });
    } else if (!stats.isFile() || stats.isSymbolicLink() || !(await sameFile(sourcePath, destinationPath))) {
      conflicts.push(displayPath(projectRoot, destinationPath));
    }
  }

  if (conflicts.length > 0) {
    throw new InstallConflictError([...new Set(conflicts)].sort());
  }

  for (const path of directoryPaths) {
    await ensureDirectory(projectRoot, path);
  }
  for (const { sourcePath, destinationPath } of missingFiles) {
    try {
      await copyFile(sourcePath, destinationPath, constants.COPYFILE_EXCL);
    } catch (error) {
      if (error?.code === "EEXIST") {
        throw new InstallConflictError([displayPath(projectRoot, destinationPath)]);
      }
      throw error;
    }
  }

  return {
    changed: missingFiles.length > 0,
    filesWritten: missingFiles.length,
    installPath: displayPath(projectRoot, installRoot),
  };
}
