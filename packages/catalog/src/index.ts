export type {
  OutcomeAuthor,
  OutcomeFiles,
  OutcomeManifest,
  OutcomeRecipe,
  OutcomeModel,
  OutcomeModelRole,
  OutcomeFile,
  OutcomeFileType,
  OutcomePreview,
  OutcomePreviewAudio,
  OutcomePreviewCad,
  OutcomePreviewCadDownload,
  OutcomePreviewImage,
  OutcomePreviewVideo,
  ProductId,
  SkillReference,
} from "./types.js";

export function skillPageUrl(skill: import("./types.js").SkillReference): string {
  const repository = skill.repository.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
  return `https://skills.sh/${repository}/${skill.directory.split("/").filter(Boolean).at(-1)}`;
}
