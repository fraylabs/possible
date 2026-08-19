"use client";

import { getProductOutcomes, getPublishedProduct, packHref } from "./public-content";
import { SiteFooter, SiteNav } from "./shared";

const commerceLabel = (availability: string) => ({
  free: "Free to use",
  paid: "Paid",
  "contact-sales": "Contact sales",
  unavailable: "Unavailable",
  unknown: "Pricing unknown",
}[availability] ?? availability);

const checkoutLabel = (checkout: string) => ({
  "not-required": "No checkout",
  supported: "Agent checkout",
  "manual-only": "Manual checkout",
  "not-supported": "No agent checkout",
  unknown: "Checkout unknown",
}[checkout] ?? checkout);

export function ProductDetailPage({ id }: { id: string }) {
  const product = getPublishedProduct(id);
  if (!product) return null;
  const outcomes = getProductOutcomes(product.id);

  return (
    <main className="product-detail-page">
      <SiteNav />
      <article className="product-profile">
        <a className="product-back-link" href="/products"><span aria-hidden="true">←</span> All products</a>

        <header className="product-profile-header">
          <img src={product.logoUrl} alt={`${product.name} logo`} />
          <div>
            <p>BY <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name} ↗</a></p>
            <h1>{product.name}</h1>
          </div>
        </header>

        <div className="product-official-description">
          <p>{product.summary}</p>
          <a href={product.summarySourceUrl} target="_blank" rel="noreferrer">Official description <span>↗</span></a>
        </div>

        <nav className="product-profile-links" aria-label={`${product.name} links`}>
          <a href={product.website} target="_blank" rel="noreferrer">Website <span>↗</span></a>
          <a href={product.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a>
          {product.commerce.pricingUrl ? <a href={product.commerce.pricingUrl} target="_blank" rel="noreferrer">Pricing <span>↗</span></a> : null}
        </nav>

        <div className="product-access-note" aria-label="Product access">
          <span>{commerceLabel(product.commerce.availability)}</span>
          <span>{checkoutLabel(product.commerce.agentCheckout)}</span>
          {product.commerce.methods.map((method) => <span key={method}>{method}</span>)}
        </div>

        <section className="product-outcomes" id="outcomes" aria-labelledby="product-outcomes-heading">
          <header>
            <div><span>OUTCOMES</span><h2 id="product-outcomes-heading">Made with {product.name}</h2></div>
            <strong>{outcomes.length}</strong>
          </header>
          <div className="product-outcome-list">
            {outcomes.map((entry, index) => <a href={packHref(entry)} key={entry.id}>
              <div>
                <small>{String(index + 1).padStart(2, "0")} / OUTCOME</small>
                <h3>{entry.pack.name}</h3>
                <p>{entry.pack.promise}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </a>)}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
