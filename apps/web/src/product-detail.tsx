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
      <article className="product-detail-document">
        <nav className="product-breadcrumb" aria-label="Breadcrumb"><a href="/products">Products</a><span>/</span><span>{product.name}</span></nav>

        <header className="product-header">
          <img src={product.logoUrl} alt={`${product.name} logo`} />
          <div className="product-header-copy">
            <p>BY <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name.toUpperCase()} ↗</a></p>
            <h1>{product.name}</h1>
            <div className="product-detail-summary">{product.summary}</div>
          </div>
          <a className="product-primary-link" href={product.website} target="_blank" rel="noreferrer">Visit {product.name} <span>↗</span></a>
        </header>

        <section className="product-outcomes" id="outcomes" aria-labelledby="product-outcomes-heading">
          <header><div><span>OUTCOME PACKS</span><h2 id="product-outcomes-heading">What agents can make</h2></div><p>Complete outcomes that use {product.name}.</p></header>
          <div className="product-outcome-list">
            {outcomes.map((entry, index) => <a href={packHref(entry)} key={entry.id}>
              <small>{String(index + 1).padStart(2, "0")} / OUTCOME PACK</small>
              <h3>{entry.pack.name}</h3>
              <p>{entry.pack.promise}</p>
              <strong>View Outcome Pack <span>↗</span></strong>
            </a>)}
          </div>
        </section>

        <section className="product-source" aria-labelledby="product-source-heading">
          <div><span>PRODUCT LINKS</span><h2 id="product-source-heading">About {product.name}</h2></div>
          <nav aria-label={`${product.name} links`}>
            <a href={product.website} target="_blank" rel="noreferrer">Website <span>↗</span></a>
            <a href={product.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a>
            {product.commerce.pricingUrl ? <a href={product.commerce.pricingUrl} target="_blank" rel="noreferrer">Pricing <span>↗</span></a> : null}
          </nav>
          <div className="product-access-note">
            <span>{commerceLabel(product.commerce.availability)}</span>
            <span>{checkoutLabel(product.commerce.agentCheckout)}</span>
            {product.commerce.methods.map((method) => <span key={method}>{method}</span>)}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
