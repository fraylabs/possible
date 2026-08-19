import { getProductOutcomes, productHref, publishedProducts } from "./public-content";
import { SiteShell } from "./shared";

const availabilityLabel = (availability: string) => ({
  free: "Free",
  paid: "Paid",
  "contact-sales": "Contact sales",
  "free-and-paid": "Free + paid",
  unavailable: "Unavailable",
  unknown: "Pricing unknown",
}[availability] ?? availability);

export function ProductsPage() {
  return (
    <SiteShell className="products-page">
      <section className="products-directory" aria-labelledby="products-directory-heading">
        <h1 className="sr-only" id="products-directory-heading">Products</h1>
        <div className="products-grid">
          {publishedProducts.map((product) => {
            const outcomes = getProductOutcomes(product.id);
            return (
              <a className="product-directory-card" href={productHref(product)} key={product.id}>
                <header><img src={product.logoUrl} alt="" /><div><h2>{product.name}</h2><span>By {product.company.name}</span></div><i>↗</i></header>
                <p>{product.summary}</p>
                <div className="product-directory-meta"><span>{availabilityLabel(product.commerce.availability)}</span><span>{outcomes.length ? `${outcomes.length} ${outcomes.length === 1 ? "Outcome" : "Outcomes"}` : "No outcomes yet"}</span></div>
              </a>
            );
          })}
        </div>
      </section>

    </SiteShell>
  );
}
