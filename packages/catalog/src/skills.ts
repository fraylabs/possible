import type { SkillRecord } from "./types.js";

type SkillDefinition = Pick<SkillRecord, "name" | "repository" | "directory">;

const definitions: SkillDefinition[] = [
  { name: "Humanizer", repository: "andreaskonopka/humanizer", directory: "skills/humanizer" },
  { name: "Robotics Design Patterns", repository: "arpitg1304/robotics-agent-skills", directory: "skills/robotics-design-patterns" },
  { name: "Robotics Testing", repository: "arpitg1304/robotics-agent-skills", directory: "skills/robotics-testing" },
  { name: "Copywriting", repository: "coreyhaines31/marketingskills", directory: "skills/copywriting" },
  { name: "CAD", repository: "earthtojake/text-to-cad", directory: "skills/cad" },
  { name: "CAD Viewer", repository: "earthtojake/text-to-cad", directory: "skills/cad-viewer" },
  { name: "STEP Parts", repository: "earthtojake/text-to-cad", directory: "skills/step-parts" },
  { name: "Create Technical Spike", repository: "github/awesome-copilot", directory: "skills/create-technical-spike" },
  { name: "HyperFrames", repository: "heygen-com/hyperframes", directory: "skills/hyperframes" },
  { name: "PPTX Generator", repository: "MiniMax-AI/skills", directory: "skills/pptx-generator" },
  { name: "Strudel Arrangement", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-arrangement" },
  { name: "Strudel Compose", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-compose" },
  { name: "Strudel Emotion", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-emotion" },
  { name: "Strudel Melody", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-melody" },
  { name: "Strudel Mixing", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-mixing" },
  { name: "Strudel Sound Design", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-sound-design" },
  { name: "Strudel Test", repository: "vanities/toaster-strudel", directory: "skills/skills/strudel-test" },
];

function record(definition: SkillDefinition): SkillRecord {
  const id = `${definition.repository}/${definition.directory}`;
  return {
    ...definition,
    id,
    slug: id.replaceAll("/", "--"),
    name: definition.name,
    sourceUrl: `https://skills.sh/${definition.repository}/${definition.directory.split("/").filter(Boolean).at(-1)}`,
  };
}

export const skillCatalog: SkillRecord[] = definitions.map(record).sort((left, right) => left.name.localeCompare(right.name));

const skillById = new Map(skillCatalog.flatMap((skill) => [[skill.id, skill], [skill.slug, skill]]));

export function getSkill(idOrSlug: string): SkillRecord | undefined {
  return skillById.get(idOrSlug);
}
