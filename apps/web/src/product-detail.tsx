"use client";

import { getProductOutcomes, getPublishedProduct, packHref } from "./public-content";
import { SiteFooter, SiteNav } from "./shared";

const commerceLabel = (availability: string) => ({
  free: "Free",
  paid: "Paid",
  "contact-sales": "Contact sales",
  unavailable: "Unavailable",
  unknown: "Pricing unknown",
}[availability] ?? availability);

const checkoutLabel = (checkout: string) => ({
  "not-required": "No checkout required",
  supported: "Agent checkout supported",
  "manual-only": "Manual checkout",
  "not-supported": "Agent checkout unavailable",
  unknown: "Agent checkout unknown",
}[checkout] ?? checkout);

export function ProductDetailPage({ id }: { id: string }) {
  const product = getPublishedProduct(id);
  if (!product) return null;
  const outcomes = getProductOutcomes(product.id);

  return (
    <main className="product-detail-page">
      <SiteNav />
      <article className="product-detail-document">
        <header className="product-detail-header">
          <nav aria-label="Breadcrumb"><a href="/#packs">Outcomes</a><span>/</span><span>{product.name}</span></nav>
          <p>BY <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name} ↗</a></p>
          <h1>{product.name}</h1>
          <div className="product-detail-summary">{product.summary}</div>
          <div className="product-detail-links">
            <a href={product.website} target="_blank" rel="noreferrer">Product <span>↗</span></a>
            <a href={product.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a>
            {product.commerce.pricingUrl ? <a href={product.commerce.pricingUrl} target="_blank" rel="noreferrer">Pricing <span>↗</span></a> : null}
          </div>
        </header>

        <section className="product-commerce" aria-labelledby="product-access-heading">
          <h2 id="product-access-heading">Access</h2>
          <dl>
            <div><dt>Availability</dt><dd>{commerceLabel(product.commerce.availability)}</dd></div>
            <div><dt>Checkout</dt><dd>{checkoutLabel(product.commerce.agentCheckout)}</dd></div>
            <div><dt>Accepted methods</dt><dd>{product.commerce.methods.length ? product.commerce.methods.join(" · ") : "None required"}</dd></div>
          </dl>
          <p>Possible describes compatibility only. Outcome Packs and Product records never authorize spending.</p>
        </section>

        <section className="product-outcomes" aria-labelledby="product-outcomes-heading">
          <header><span>OUTCOMES</span><h2 id="product-outcomes-heading">What agents can create with {product.name}</h2></header>
          <div>
            {outcomes.map((entry) => <a href={packHref(entry)} key={entry.id}>
              <span>{entry.pack.name}</span><i>↗</i><p>{entry.pack.promise}</p>
            </a>)}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
