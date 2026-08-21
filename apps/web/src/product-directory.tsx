"use client";

import { useState } from "react";
import type { ProductCategory } from "@possible/catalog";
import { getProductOutcomes, productHref, publishedProducts } from "./public-content";
import { SiteShell } from "./shared";

const categories: Array<{ id: "all" | ProductCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "3d", label: "3D" },
  { id: "robotics", label: "Robotics" },
];

export function ProductsPage() {
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const products = publishedProducts.filter((product) => {
    if (category !== "all" && product.category !== category) return false;
    if (!normalizedQuery) return true;
    return [product.name, product.company.name, product.summary, product.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <SiteShell className="products-page">
      <section className="products-directory" aria-labelledby="products-directory-heading">
        <h1 className="sr-only" id="products-directory-heading">Products</h1>
        <header className="product-categories">
          <span>PRODUCTS</span>
          <nav aria-label="Product categories">
            {categories.map((item) => <button
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              key={item.id}
            >{item.label}</button>)}
          </nav>
        </header>
        <label className="product-directory-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
          <small>{products.length} RESULT{products.length === 1 ? "" : "S"}</small>
        </label>
        <div className="products-grid" aria-live="polite">
          {products.map((product) => {
            const outcomes = getProductOutcomes(product.id);
            return (
              <a className="product-directory-card" href={productHref(product)} key={product.id}>
                <header><img src={product.logoUrl} alt="" /><div><h2>{product.name}</h2><span>By {product.company.name}</span></div><i>↗</i></header>
                <p>{product.summary}</p>
                <div className="product-directory-meta"><span>{product.category}</span><span>{outcomes.length ? `${outcomes.length} ${outcomes.length === 1 ? "Outcome" : "Outcomes"}` : "No outcomes yet"}</span></div>
              </a>
            );
          })}
        </div>
        {!products.length ? <p className="products-empty">No products match this search.</p> : null}
      </section>

    </SiteShell>
  );
}
