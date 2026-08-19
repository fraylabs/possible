"use client";

import { useState } from "react";
import type { ProductCategory } from "@possible/packs";
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

const categories: Array<{ id: "all" | ProductCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "3d", label: "3D" },
  { id: "robotics", label: "Robotics" },
];

export function ProductsPage() {
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const products = category === "all" ? publishedProducts : publishedProducts.filter((product) => product.category === category);

  return (
    <SiteShell className="products-page">
      <section className="products-directory" aria-labelledby="products-directory-heading">
        <h1 className="sr-only" id="products-directory-heading">Products</h1>
        <header className="product-categories">
          <span>TOP CATEGORIES</span>
          <nav aria-label="Product categories">
            {categories.map((item) => <button
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              key={item.id}
            >{item.label}</button>)}
          </nav>
        </header>
        <div className="products-grid" aria-live="polite">
          {products.map((product) => {
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
