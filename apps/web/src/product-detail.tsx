"use client";

import { getProductFeature, getProductOutcomes, getPublishedProduct, packHref } from "./public-content";
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
  const feature = getProductFeature(product.id);
  const showcase = feature?.showcase;
  const heroImage = showcase?.images?.find(({ cover }) => cover) ?? showcase?.images?.[0];

  return (
    <main className="product-detail-page">
      <SiteNav />
      <article className="product-detail-document">
        <header className="product-marketing-hero">
          <div className="product-hero-copy">
            <nav aria-label="Breadcrumb"><a href="/#packs">Outcomes</a><span>/</span><span>{product.name}</span></nav>
            <p className="product-kicker">PRODUCT BY <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name} ↗</a></p>
            <h1><span>Make more with</span>{product.name}.</h1>
            <div className="product-detail-summary">{product.summary}</div>
            <div className="product-hero-actions">
              <a className="is-primary" href="#outcomes">See what agents can make <span>↓</span></a>
              <a href={product.website} target="_blank" rel="noreferrer">Visit {product.name} <span>↗</span></a>
            </div>
            <dl className="product-hero-facts">
              <div><dt>Outcomes</dt><dd>{outcomes.length}</dd></div>
              <div><dt>Access</dt><dd>{commerceLabel(product.commerce.availability)}</dd></div>
              <div><dt>For agents</dt><dd>{checkoutLabel(product.commerce.agentCheckout)}</dd></div>
            </dl>
          </div>

          <div className="product-hero-proof">
            {showcase?.video ? <figure>
              <video autoPlay muted loop playsInline controls poster={showcase.video.poster}>
                <source src={showcase.video.src} />
                <a href={showcase.video.src}>Open the featured outcome video</a>
              </video>
              <figcaption><span>MADE WITH {product.name.toUpperCase()}</span>{showcase.video.caption ?? feature?.entry.pack.name}</figcaption>
            </figure> : heroImage ? <figure>
              <img src={heroImage.src} alt={heroImage.alt} />
              <figcaption><span>MADE WITH {product.name.toUpperCase()}</span>{heroImage.caption ?? feature?.entry.pack.name}</figcaption>
            </figure> : <div className="product-proof-fallback"><span>PRODUCT / OUTCOME</span><strong>{product.name}</strong><i>↗</i></div>}
          </div>
        </header>

        <section className="product-story" aria-labelledby="product-story-heading">
          <span>FROM PRODUCT TO POSSIBILITY</span>
          <h2 id="product-story-heading">Don’t start with the tool.<br />Start with what you want to make.</h2>
          <p>{product.name} becomes useful when it is connected to a complete outcome. Pick one below and your agent gets the direction and capabilities to turn the idea into a finished result.</p>
        </section>

        <section className="product-outcomes" id="outcomes" aria-labelledby="product-outcomes-heading">
          <header><span>WHAT AGENTS CAN DO</span><h2 id="product-outcomes-heading">Make something with {product.name}.</h2></header>
          <div className="product-outcome-list">
            {outcomes.map((entry, index) => <a href={packHref(entry)} key={entry.id}>
              <small>{String(index + 1).padStart(2, "0")} / OUTCOME PACK</small>
              <h3>{entry.pack.name}</h3>
              <p>{entry.pack.promise}</p>
              <strong>Use this outcome <span>↗</span></strong>
            </a>)}
          </div>
        </section>

        <section className="product-source" aria-labelledby="product-source-heading">
          <div>
            <span>THE PRODUCT</span>
            <h2 id="product-source-heading">Explore {product.name}.</h2>
            <p>Built by <a href={product.company.website} target="_blank" rel="noreferrer">{product.company.name} ↗</a></p>
          </div>
          <nav aria-label={`${product.name} links`}>
            <a href={product.website} target="_blank" rel="noreferrer">Product <span>↗</span></a>
            <a href={product.docsUrl} target="_blank" rel="noreferrer">Documentation <span>↗</span></a>
            {product.commerce.pricingUrl ? <a href={product.commerce.pricingUrl} target="_blank" rel="noreferrer">Pricing <span>↗</span></a> : null}
          </nav>
          <div className="product-access-note">
            <span>{commerceLabel(product.commerce.availability)}</span>
            <span>{checkoutLabel(product.commerce.agentCheckout)}</span>
            {product.commerce.methods.map((method) => <span key={method}>{method}</span>)}
          </div>
          <p className="product-commerce-disclosure">Access information describes compatibility only. Possible never authorizes spending.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
