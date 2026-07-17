export type KnowledgeDomain = "web" | "manufacturing";
export type KnowledgeNodeType = "topic" | "practice" | "tool" | "provider" | "action";
export type RelationshipType =
  | "hierarchy"
  | "relevance"
  | "compatibility"
  | "alternatives"
  | "support"
  | "invocation";
export type ActionAccess = "informational" | "read-only" | "external-approval";
export type CapabilityStatus = "supported" | "unknown";

export interface KnowledgeSource {
  title: string;
  url: string;
  publisher: string;
  kind:
    | "official-documentation"
    | "official-project-docs"
    | "official-capability"
    | "official-standard"
    | "government-reference";
  accessedAt: string;
}

export interface Contributor {
  id: string;
  name: string;
  url?: string;
}

export interface RecommendationAlternative {
  nodeId: string;
  reason: string;
}

export interface Recommendation {
  statement: string;
  applicability: string[];
  counterconditions: string[];
  alternatives: RecommendationAlternative[];
  sources: KnowledgeSource[];
  contributors: Contributor[];
  reviewedAt: string;
  confidence: "low" | "medium" | "high";
  reviewIntervalDays: number;
}

export interface KnowledgeRelationship {
  type: RelationshipType;
  target: string;
  description: string;
}

export interface ProviderCapability {
  key: string;
  label: string;
  category: string;
  description: string;
  status: CapabilityStatus;
  accepts?: string[];
  outputs?: string[];
  source?: KnowledgeSource;
}

export interface ProviderUnknown {
  field: string;
  statement: string;
}

export interface ProviderConstraint {
  statement: string;
  source: KnowledgeSource;
}

export interface ProviderHandoff {
  channel: "website" | "cli" | "git-integration" | "api";
  purpose: string;
  authRequired: boolean;
  externalEffect: boolean;
  approvalRequired: boolean;
  source: KnowledgeSource;
}

export interface ProviderDetails {
  officialUrl: string;
  checkedAt: string;
  liveCheckRequired: true;
  capabilities: ProviderCapability[];
  knownConstraints: ProviderConstraint[];
  handoffs: ProviderHandoff[];
  unknowns: ProviderUnknown[];
}

export interface ToolDetails {
  officialUrl: string;
  categories: string[];
}

export interface PracticeDetails {
  outputs: string[];
  checks: string[];
}

export interface ActionDetails {
  access: ActionAccess;
  providerId?: string;
  requiresApproval: boolean;
  approvalReason?: string;
  steps: string[];
  produces: string[];
}

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  domain: KnowledgeDomain;
  title: string;
  summary: string;
  tags: string[];
  recommendations: Recommendation[];
  relationships: KnowledgeRelationship[];
  provider?: ProviderDetails;
  tool?: ToolDetails;
  practice?: PracticeDetails;
  action?: ActionDetails;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  description: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface SearchOptions {
  limit?: number;
  domains?: KnowledgeDomain[];
  types?: KnowledgeNodeType[];
}

export interface SearchResult {
  node: KnowledgeNode;
  score: number;
  matchedTerms: string[];
}

export interface ExpandOptions {
  depth?: number;
  direction?: "incoming" | "outgoing" | "both";
  relationshipTypes?: RelationshipType[];
  limit?: number;
}

export interface GraphSlice {
  centerId: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface CapabilityRequirements {
  domain?: KnowledgeDomain;
  capabilities?: string[];
  accepts?: string[];
  outputs?: string[];
  query?: string;
  providerIds?: string[];
}

export interface CapabilityMatch {
  provider: KnowledgeNode;
  capabilities: ProviderCapability[];
  actions: KnowledgeNode[];
  score: number;
  matchedRequirements: string[];
  unknowns: ProviderUnknown[];
}
