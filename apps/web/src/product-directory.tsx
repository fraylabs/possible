import { getProductFeature, getProductOutcomes, productHref, publishedProducts } from "./public-content";
import { SiteFooter, SiteNav } from "./shared";

export function ProductsPage() {
  return (
    <main className="products-page">
      <SiteNav />

      <header className="products-hero">
        <p>PRODUCTS / POSSIBLE</p>
        <h1>Products that make<br /><em>more possible.</em></h1>
        <div>
          <strong>Discover products through what agents can make with them.</strong>
          <span>Every listing leads to complete outcomes—not another feature directory.</span>
        </div>
      </header>

      <section className="products-directory" aria-labelledby="products-directory-heading">
        <header>
          <h2 id="products-directory-heading">Explore products</h2>
          <span>{publishedProducts.length} {publishedProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}</span>
        </header>

        <div className="products-grid">
          {publishedProducts.map((product, index) => {
            const outcomes = getProductOutcomes(product.id);
            const feature = getProductFeature(product.id);
            const showcase = feature?.showcase;
            const cover = showcase?.images?.find(({ cover }) => cover) ?? showcase?.images?.[0];
            const poster = cover ?? (showcase?.video ? {
              src: showcase.video.poster,
              alt: showcase.video.caption ?? `${product.name} outcome preview`,
            } : undefined) ?? (showcase?.cad?.poster ? {
              src: showcase.cad.poster,
              alt: showcase.cad.caption ?? `${product.name} CAD outcome preview`,
            } : undefined);

            return (
              <a className="product-directory-card" href={productHref(product)} key={product.id}>
                <div className="product-directory-visual">
                  {poster ? <img src={poster.src} alt={poster.alt} loading={index === 0 ? "eager" : "lazy"} decoding="async" /> : (
                    <div className="product-directory-fallback"><span>{product.company.name}</span><strong>{product.name}</strong></div>
                  )}
                  <span className="product-directory-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="product-directory-copy">
                  <small>BY {product.company.name.toUpperCase()}</small>
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <footer>
                    <span>{outcomes.length} {outcomes.length === 1 ? "OUTCOME" : "OUTCOMES"} TO TRY</span>
                    <strong>See what it makes possible <i>↗</i></strong>
                  </footer>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="products-principle">
        <span>WHY PRODUCTS ARE HERE</span>
        <p>Products provide capabilities. Outcome Packs show agents how to turn those capabilities into something finished.</p>
        <a href="/#packs">Explore every outcome <i>↗</i></a>
      </section>

      <SiteFooter />
    </main>
  );
}
