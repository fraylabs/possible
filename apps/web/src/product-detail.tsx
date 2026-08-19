"use client";

import { OutcomeCard } from "./outcome-card";
import { getProductOutcomes, getPublishedProduct } from "./public-content";
import { SiteShell } from "./shared";

export function ProductDetailPage({ id }: { id: string }) {
  const product = getPublishedProduct(id);
  if (!product) return null;
  const outcomes = getProductOutcomes(product.id);

  return (
    <SiteShell className="product-detail-page">
      <article className="product-profile">
        <a className="product-back-link" href="/products"><span aria-hidden="true">←</span> All products</a>

        <header className="product-profile-header">
          <div className="product-profile-identity">
            <img src={product.logoUrl} alt={`${product.name} logo`} />
            <div>
              <p>BY <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name} ↗</a></p>
              <h1>{product.name}</h1>
            </div>
          </div>
          <div className="product-profile-information">
            <p>{product.summary}</p>
            <a className="product-summary-source" href={product.summarySourceUrl} target="_blank" rel="noreferrer">Source <span>↗</span></a>
            <nav className="product-profile-links" aria-label={`${product.name} links`}>
              <a href={product.website} target="_blank" rel="noreferrer">Website <span>↗</span></a>
              {product.docsUrl !== product.website ? <a href={product.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a> : null}
            </nav>
            <div className="product-access-note" aria-label="Product access">
              <span>{product.category}</span>
            </div>
          </div>
        </header>

        <section className="product-outcomes" id="outcomes" aria-labelledby="product-outcomes-heading">
          <header>
            <h2 id="product-outcomes-heading">COMMUNITY</h2>
          </header>
          <div className="product-community-grid">
            {outcomes.map((entry, index) => <OutcomeCard entry={entry} priority={index < 2} key={entry.slug} />)}
            {outcomes.length === 0 ? <p className="product-outcomes-empty">No published Outcomes use this product yet.</p> : null}
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
