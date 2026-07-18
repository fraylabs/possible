import type { RefObject } from "react";
import type { WikiPage } from "@possible/knowledge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "../markdown";
import { formatReviewedAt } from "../wiki";

interface ArticleViewProps {
  page: WikiPage | undefined;
  routeSlug: string | undefined;
  fallbackPage: WikiPage | undefined;
  titleRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onHome: () => void;
  onSelectPage: (slug: string) => void;
}

const safeSourceHref = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export function ArticleView({
  page,
  routeSlug,
  fallbackPage,
  titleRef,
  onBack,
  onHome,
  onSelectPage,
}: ArticleViewProps) {
  return (
    <div className="read-view">
      <header className="read-nav">
        <button type="button" className="brand-reset" onClick={onHome} aria-label="Return to the Possible field guide atlas">
          <span className="brand-wordmark">possible<span>.sh</span></span>
        </button>
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={17} aria-hidden="true" />
          Back to map
        </button>
      </header>

      <article className="read-article" aria-labelledby="read-title">
        <header className="read-header">
          <p className="section-kicker">Possible field guide</p>
          <h1 id="read-title" ref={titleRef} tabIndex={-1}>
            {page?.title ?? "Page not found"}
          </h1>
          <p className="article-summary">
            {page?.summary
              ?? `The page "${routeSlug ?? "unknown"}" is not present in this build.`}
          </p>
          {page && (
            <>
              <p className="review-note">Reviewed {formatReviewedAt(page.reviewedAt)}</p>
              <p className="guide-boundary">
                This guide provides source-backed context, not a project-specific plan or validation.
              </p>
            </>
          )}
        </header>

        {page ? (
          <>
            <div className="article-body">
              <MarkdownRenderer markdown={page.body} onSelectPage={onSelectPage} />
            </div>

            <footer className="article-footer">
              <h2>Sources for this guide</h2>
              <ol className="source-list">
                {page.sources.map((source) => {
                  const href = safeSourceHref(source.url);
                  return (
                    <li key={source.url}>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          <span>{source.title}</span>
                          <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </footer>
          </>
        ) : (
          <div className="article-body article-body--missing">
            <p>Search for another guide or return to the current field guide atlas.</p>
            {fallbackPage && (
              <button
                type="button"
                className="inline-link-button"
                onClick={() => onSelectPage(fallbackPage.slug)}
              >
                Open {fallbackPage.title}
              </button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
