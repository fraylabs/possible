import { getProductOutcomes, productHref, publishedProducts } from "./public-content";
import { SiteFooter, SiteNav } from "./shared";

const availabilityLabel = (availability: string) => ({
  free: "Free",
  paid: "Paid",
  "contact-sales": "Contact sales",
  unavailable: "Unavailable",
  unknown: "Pricing unknown",
}[availability] ?? availability);

export function ProductsPage() {
  return (
    <main className="products-page">
      <SiteNav />

      <header className="products-page-header">
        <div><p>POSSIBLE / PRODUCTS</p><h1>Products</h1><span>Products behind Outcome Packs.</span></div>
        <strong>{publishedProducts.length} {publishedProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}</strong>
      </header>

      <section className="products-directory" aria-labelledby="products-directory-heading">
        <header><h2 id="products-directory-heading">Products agents can use</h2></header>
        <div className="products-grid">
          {publishedProducts.map((product) => {
            const outcomes = getProductOutcomes(product.id);
            return (
              <a className="product-directory-card" href={productHref(product)} key={product.id}>
                <header><img src={product.logoUrl} alt="" /><div><h3>{product.name}</h3><span>By {product.company.name}</span></div><i>↗</i></header>
                <p>{product.summary}</p>
                <footer><span>{availabilityLabel(product.commerce.availability)}</span><span>{outcomes.length} {outcomes.length === 1 ? "Outcome Pack" : "Outcome Packs"}</span></footer>
              </a>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
