export { wikiCorpusData } from "./data.js";
export {
  getBacklinks,
  getPage,
  getRelatedPages,
  loadWiki,
  assessSearchResults,
  searchPages,
} from "./runtime.js";
export type {
  SearchAssessment,
  SearchRouteStatus,
} from "./runtime.js";
export type {
  PageSearchOptions,
  PageSearchResult,
  PageSource,
  WikiPageKind,
  WikiPageRouteStatus,
  WikiCorpus,
  WikiPage,
} from "./types.js";
