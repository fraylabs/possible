import type { WikiPage } from "@possible/knowledge";
import { ExternalLink, X } from "lucide-react";
import { MarkdownRenderer } from "../markdown";
import { formatReviewedAt, wikiPath } from "../wiki";

interface ArticleSheetProps {
  page: WikiPage | undefined;
  routeSlug: string | undefined;
  outgoingPages: WikiPage[];
  backlinkPages: WikiPage[];
  relatedCount: number;
  fallbackPage: WikiPage | undefined;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
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

export function ArticleSheet({
  page,
  routeSlug,
  outgoingPages,
  backlinkPages,
  relatedCount,
  fallbackPage,
  isMobile,
  isOpen,
  onClose,
  onSelectPage,
}: ArticleSheetProps) {
  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          className="article-backdrop"
          aria-label="Dismiss article overlay"
          onClick={onClose}
        />
      )}
      <section
        id="wiki-article"
        className={`article-shell${isMobile ? " is-mobile" : ""}${isOpen ? " is-open" : ""}`}
        role={isMobile && isOpen ? "dialog" : undefined}
        aria-modal={isMobile && isOpen ? "true" : undefined}
        aria-labelledby="wiki-article-title"
        hidden={isMobile && !isOpen}
      >
        <div className="article-frame">
          <div className="article-main">
            <header className="article-header">
              <div>
                <p className="section-kicker">Possible wiki</p>
                <h1 id="wiki-article-title">{page?.title ?? "Page not found"}</h1>
                <p className="article-summary">
                  {page?.summary ?? `The page "${routeSlug ?? "unknown"}" is not present in this build.`}
                </p>
              </div>
              <button
                type="button"
                className="article-close"
                onClick={onClose}
                aria-label="Close article"
              >
                <X size={18} />
              </button>
            </header>

            {page ? (
              <article className="article-body">
                <MarkdownRenderer markdown={page.body} onSelectPage={onSelectPage} />
              </article>
            ) : (
              <article className="article-body article-body--missing">
                <p>Search for another page or return to a page that exists in the current corpus.</p>
                {fallbackPage && (
                  <p>
                    <button type="button" className="inline-link-button" onClick={() => onSelectPage(fallbackPage.slug)}>
                      Open {fallbackPage.title}
                    </button>
                  </p>
                )}
              </article>
            )}
          </div>

          <aside className="article-sidebar" aria-label="Page details">
            {page && (
              <>
                <section className="sidebar-card">
                  <h2>Page facts</h2>
                  <dl className="fact-list">
                    <div>
                      <dt>Route</dt>
                      <dd>{wikiPath(page.slug)}</dd>
                    </div>
                    <div>
                      <dt>Agent JSON</dt>
                      <dd><a href={`${wikiPath(page.slug)}.json`}>Open page data</a></dd>
                    </div>
                    <div>
                      <dt>Reviewed</dt>
                      <dd>{formatReviewedAt(page.reviewedAt)}</dd>
                    </div>
                    <div>
                      <dt>Direct relations</dt>
                      <dd>{relatedCount}</dd>
                    </div>
                  </dl>
                  {page.tags.length > 0 && (
                    <ul className="tag-list" aria-label="Tags">
                      {page.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  )}
                </section>

                <section className="sidebar-card">
                  <h2>Links from this page</h2>
                  {outgoingPages.length > 0 ? (
                    <ul className="page-list">
                      {outgoingPages.map((linkedPage) => (
                        <li key={linkedPage.slug}>
                          <button type="button" onClick={() => onSelectPage(linkedPage.slug)}>
                            {linkedPage.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="card-empty">No direct wiki links.</p>
                  )}
                </section>

                <section className="sidebar-card">
                  <h2>Backlinks</h2>
                  {backlinkPages.length > 0 ? (
                    <ul className="page-list">
                      {backlinkPages.map((backlinkPage) => (
                        <li key={backlinkPage.slug}>
                          <button type="button" onClick={() => onSelectPage(backlinkPage.slug)}>
                            {backlinkPage.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="card-empty">No other page links here yet.</p>
                  )}
                </section>

                <section className="sidebar-card">
                  <h2>Sources</h2>
                  <ol className="source-list">
                    {page.sources.map((source) => {
                      const href = safeSourceHref(source.url);
                      return (
                        <li key={source.url}>
                          {href ? (
                            <a href={href} target="_blank" rel="noreferrer">
                              <span>{source.title}</span>
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span>{source.title}</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
