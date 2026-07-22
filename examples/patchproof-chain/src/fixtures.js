import passing from "../fixtures/01-passing-evidence.json";
import hiddenNonzero from "../fixtures/02-hidden-nonzero-exit.json";
import skipped from "../fixtures/03-skipped-checks.json";
import noCommand from "../fixtures/04-tests-without-command.json";
import absentFile from "../fixtures/05-claimed-file-absent.json";
import noVisual from "../fixtures/06-ui-without-visual-evidence.json";
import staleLog from "../fixtures/07-stale-log.json";
import unrelated from "../fixtures/08-unrelated-changes.json";
import binary from "../fixtures/09-binary-files.json";
import emptyDiff from "../fixtures/10-empty-diff.json";
import malformed from "../fixtures/11-malformed-import.json";
import limitations from "../fixtures/12-explicit-limitations.json";

export const FIXTURES = Object.freeze([
  passing,
  hiddenNonzero,
  skipped,
  noCommand,
  absentFile,
  noVisual,
  staleLog,
  unrelated,
  binary,
  emptyDiff,
  malformed,
  limitations,
]);

export function getFixture(id) {
  return FIXTURES.find((fixture) => fixture.id === id);
}
