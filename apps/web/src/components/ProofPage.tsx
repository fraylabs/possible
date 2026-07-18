import { useEffect, useState } from "react";
import {
  assessSearchResults,
  getPage,
  loadWiki,
  searchPages,
  type SearchAssessment,
  type WikiCorpus,
  type WikiPage,
} from "@possible/knowledge";

const PROOF_QUERIES = [
  "I want to make a digital photo frame",
  "I want to make a robotic arm",
] as const;

const AGENT_PROMPT = `Use Possible before planning or building either request below.

1. Read https://possible.sh/llms.txt and follow its static agent protocol.
2. Search the published corpus locally using the documented normalization, all-term matching, and outcome-first ranking.
3. Read the matched outcome page and its related-page JSON. Treat route status as authoritative: partial is not verified, and related knowledge is not proof of a complete route.
4. Cite the maintained sources you rely on and list every missing piece of evidence before proposing work.

Queries:
- I want to make a digital photo frame
- I want to make a robotic arm`;

type LoadState =
  | { status: "loading" }
  | { status: "ready"; corpus: WikiCorpus }
  | { status: "error"; message: string };

interface QueryProof {
  query: string;
  assessment: SearchAssessment;
  outcome: WikiPage | undefined;
  supportingPages: WikiPage[];
  evidenceGaps: string[];
}

const stripMarkdown = (value: string): string =>
  value
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sectionParagraphs = (body: string, headingPattern: RegExp): string[] => {
  const lines = body.split("\n");
  const paragraphs: string[] = [];
  let inSection = false;
  let paragraph: string[] = [];

  const flush = () => {
    const text = stripMarkdown(paragraph.join(" "));
    if (text) paragraphs.push(text);
    paragraph = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (inSection) flush();
      inSection = headingPattern.test(heading[1] ?? "");
      continue;
    }
    if (!inSection) continue;
    if (line.trim()) paragraph.push(line.trim());
    else flush();
  }
  if (inSection) flush();

  return paragraphs;
};

const extractEvidenceGaps = (body: string): string[] => {
  const dedicatedSection = sectionParagraphs(
    body,
    /(?:coverage\s+and\s+gaps|missing\s+evidence|evidence\s+gaps|known\s+gaps)/i,
  );
  if (dedicatedSection.length > 0) return dedicatedSection;

  return body
    .split(/\n\s*\n/)
    .filter((paragraph) => !paragraph.trim().startsWith("##"))
    .filter((paragraph) =>
      /(?:does not contain|does not establish|required missing evidence|missing [a-z-]+ evidence|evidence gaps)/i
        .test(paragraph),
    )
    .map(stripMarkdown)
    .filter(Boolean);
};

const buildQueryProof = (corpus: WikiCorpus, query: string): QueryProof => {
  const results = searchPages(corpus, query);
  const assessment = assessSearchResults(results);
  const outcomeSlug = assessment.verifiedRoutes[0] ?? assessment.partialRoutes[0];
  const outcome = outcomeSlug ? getPage(corpus, outcomeSlug) : undefined;
  const supportingPages = outcome
    ? outcome.links
      .map((slug) => getPage(corpus, slug))
      .filter((page): page is WikiPage => page !== undefined)
    : [];

  return {
    query,
    assessment,
    outcome,
    supportingPages,
    evidenceGaps: outcome ? extractEvidenceGaps(outcome.body) : [],
  };
};

const routeStatusLabel = (status: SearchAssessment["status"]): string => {
  if (status === "no-maintained-route") return "No maintained route";
  return status === "verified" ? "Verified" : "Partial";
};

const safeSourceHref = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

function QueryProofArticle({ proof, index }: { proof: QueryProof; index: number }) {
  const titleId = `proof-query-${index}-title`;
  const outcome = proof.outcome;

  return (
    <article className="proof-query" aria-labelledby={titleId}>
      <header className="proof-query-header">
        <p className="proof-query-label">Query {index + 1}</p>
        <h2 id={titleId} className="proof-query-text">“{proof.query}”</h2>
      </header>

      <section className="proof-section">
        <h3 id={`${titleId}-outcome`} className="proof-section-title">Outcome page</h3>
        {outcome ? (
          <div className="proof-outcome">
            <a className="proof-outcome-link" href={`/wiki/${outcome.slug}`}>
              {outcome.title}
            </a>
            <p className="proof-summary">{outcome.summary}</p>
            <p className="proof-reviewed">Reviewed {outcome.reviewedAt}</p>
          </div>
        ) : (
          <p className="proof-empty">No maintained outcome page matched every query term.</p>
        )}
      </section>

      <section className="proof-section">
        <h3 id={`${titleId}-route`} className="proof-section-title">Route status</h3>
        <dl className="proof-route">
          <div className="proof-route-row">
            <dt className="proof-route-term">Assessment</dt>
            <dd className={`proof-route-value proof-route-value--${proof.assessment.status}`}>
              {routeStatusLabel(proof.assessment.status)}
            </dd>
          </div>
          <div className="proof-route-row">
            <dt className="proof-route-term">Why</dt>
            <dd className="proof-route-value">{proof.assessment.reason}</dd>
          </div>
        </dl>
      </section>

      <section className="proof-section">
        <h3 id={`${titleId}-coverage`} className="proof-section-title">Coverage</h3>
        {outcome && (outcome.coverage ?? []).length > 0 ? (
          <ul className="proof-tags" aria-label={`${outcome.title} coverage`}>
            {(outcome.coverage ?? []).map((scope) => (
              <li className="proof-tag" key={scope}>{scope}</li>
            ))}
          </ul>
        ) : (
          <p className="proof-empty">No explicit coverage is authored for this route.</p>
        )}
      </section>

      <section className="proof-section">
        <h3 id={`${titleId}-supporting`} className="proof-section-title">Supporting pages</h3>
        {proof.supportingPages.length > 0 ? (
          <ol className="proof-page-list">
            {proof.supportingPages.map((page) => (
              <li className="proof-page-item" key={page.slug}>
                <a className="proof-page-link" href={`/wiki/${page.slug}`}>{page.title}</a>
                <span className="proof-page-summary">{page.summary}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="proof-empty">No supporting pages are linked from the outcome page.</p>
        )}
      </section>

      <section className="proof-section">
        <h3 id={`${titleId}-sources`} className="proof-section-title">Sources</h3>
        {outcome && outcome.sources.length > 0 ? (
          <ol className="proof-source-list">
            {outcome.sources.map((source) => {
              const href = safeSourceHref(source.url);
              return (
                <li className="proof-source-item" key={source.url}>
                  {href ? (
                    <a className="proof-source-link" href={href} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    <span className="proof-source-title">{source.title}</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="proof-empty">No sources are published for this outcome page.</p>
        )}
      </section>

      <section className="proof-section proof-section--gaps">
        <h3 id={`${titleId}-gaps`} className="proof-section-title">Missing evidence</h3>
        {proof.evidenceGaps.length > 0 ? (
          <ul className="proof-gap-list">
            {proof.evidenceGaps.map((gap) => (
              <li className="proof-gap-item" key={gap}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p className="proof-empty">
            The outcome page does not publish a dedicated evidence-gap statement. Do not infer
            verification from related pages.
          </p>
        )}
      </section>

      {outcome && (
        <nav className="proof-json" aria-label={`Raw JSON for ${outcome.title}`}>
          <h3 className="proof-section-title">Raw agent JSON</h3>
          <ul className="proof-json-list">
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/agent/read/${outcome.slug}.json`}>Agent read JSON</a>
            </li>
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/agent/related/${outcome.slug}.json`}>Related pages JSON</a>
            </li>
            <li className="proof-json-item">
              <a className="proof-json-link" href={`/wiki/${outcome.slug}.json`}>Wiki page JSON</a>
            </li>
          </ul>
        </nav>
      )}
    </article>
  );
}

export function ProofPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    let active = true;
    loadWiki()
      .then((corpus) => {
        if (active) setLoadState({ status: "ready", corpus });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          status: "error",
          message: error instanceof Error ? error.message : "The Possible corpus could not be loaded.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const proofs = loadState.status === "ready"
    ? PROOF_QUERIES.map((query) => buildQueryProof(loadState.corpus, query))
    : [];

  return (
    <main className="proof-page">
      <header className="proof-header">
        <nav className="proof-nav" aria-label="Proof page navigation">
          <a className="proof-brand" href="/">possible.sh</a>
          <a className="proof-back" href="/">Back to atlas</a>
        </nav>
        <p className="proof-kicker">Runtime corpus proof</p>
        <h1 className="proof-title">Two outcomes, with the gaps left visible.</h1>
        <p className="proof-intro">
          This page runs both queries through the same <code className="proof-code">@possible/knowledge</code>
          {" "}corpus used by the site. A partial route is evidence of maintained starting knowledge,
          not a claim that the outcome has already been verified end to end.
        </p>
      </header>

      <section className="proof-agent" aria-labelledby="proof-agent-title">
        <div className="proof-agent-header">
          <div className="proof-agent-copy">
            <p className="proof-kicker">Codex / Claude handoff</p>
            <h2 id="proof-agent-title" className="proof-agent-title">Give an agent the same evidence boundary.</h2>
          </div>
          <button className="proof-copy-button" type="button" onClick={copyPrompt}>
            {copyStatus === "copied" ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <label className="proof-prompt-label" htmlFor="proof-agent-prompt">Agent prompt</label>
        <textarea
          id="proof-agent-prompt"
          className="proof-prompt"
          value={AGENT_PROMPT}
          readOnly
          rows={12}
          onFocus={(event) => event.currentTarget.select()}
        />
        <p className="proof-copy-status" role="status" aria-live="polite">
          {copyStatus === "copied" && "Prompt copied to the clipboard."}
          {copyStatus === "error" && "Copy failed. Select the prompt and copy it manually."}
        </p>
        <p className="proof-agent-links">
          <a className="proof-agent-link" href="https://possible.sh/llms.txt">Open llms.txt</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/agent/protocol.json">Agent protocol JSON</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/agent/search.json">Search index JSON</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/proof/receipts/digital-photo-frame.md">Digital-frame clean-room receipt</a>
          <span className="proof-agent-separator" aria-hidden="true">·</span>
          <a className="proof-agent-link" href="/proof/receipts/robotic-arm.md">Robotic-arm clean-room receipt</a>
        </p>
      </section>

      {loadState.status === "loading" && (
        <section className="proof-state" aria-live="polite" aria-busy="true">
          <h2 className="proof-state-title">Loading the Possible corpus</h2>
          <p className="proof-state-message">The proof will appear after the runtime corpus is ready.</p>
        </section>
      )}

      {loadState.status === "error" && (
        <section className="proof-state proof-state--error" role="alert">
          <h2 className="proof-state-title">The corpus could not be loaded</h2>
          <p className="proof-state-message">{loadState.message}</p>
        </section>
      )}

      {loadState.status === "ready" && (
        <section className="proof-results" aria-label="Outcome routing results">
          {proofs.map((proof, index) => (
            <QueryProofArticle key={proof.query} proof={proof} index={index} />
          ))}
        </section>
      )}
    </main>
  );
}
