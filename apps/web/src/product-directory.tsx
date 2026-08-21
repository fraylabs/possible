"use client";

import { useState } from "react";
import type { ProductCategory } from "@possible/catalog";
import { getProductOutcomes, getSkillOutcomes, productHref, publishedProducts, publishedSkills, skillHref } from "./public-content";
import { SiteShell } from "./shared";

type DiscoveryType = "all" | "product" | "skill";
type DiscoveryCategory = "all" | ProductCategory;

const categories: Array<{ id: DiscoveryCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "3d", label: "3D" },
  { id: "robotics", label: "Robotics" },
];

const typeLinks: Array<{ id: DiscoveryType; label: string; href: string }> = [
  { id: "all", label: "All", href: "/discover" },
  { id: "product", label: "Products", href: "/products" },
  { id: "skill", label: "Skills", href: "/skills" },
];

const productListings = publishedProducts.map((product) => {
  const outcomes = getProductOutcomes(product.id);
  return {
    id: `product:${product.id}`,
    kind: "product" as const,
    href: productHref(product),
    name: product.name,
    owner: product.company.name,
    summary: product.summary,
    logoUrl: product.logoUrl,
    categories: [product.category],
    outcomes,
    searchText: [product.name, product.company.name, product.summary, product.category, ...outcomes.flatMap(({ outcome }) => [outcome.title, outcome.summary])].join(" ").toLowerCase(),
  };
});

const skillListings = publishedSkills.map((skill) => {
  const outcomes = getSkillOutcomes(skill.id);
  const skillCategories = [...new Set(outcomes.flatMap(({ products }) => products.map(({ category }) => category)))];
  return {
    id: `skill:${skill.id}`,
    kind: "skill" as const,
    href: skillHref(skill),
    name: skill.name,
    owner: skill.repository,
    summary: skill.directory,
    logoUrl: null,
    categories: skillCategories,
    outcomes,
    searchText: [skill.name, skill.repository, skill.directory, ...outcomes.flatMap(({ outcome }) => [outcome.title, outcome.summary])].join(" ").toLowerCase(),
  };
});

const discoveryListings = [...productListings, ...skillListings].sort((left, right) => left.name.localeCompare(right.name));

export function DiscoverPage({ initialType = "all" }: { initialType?: DiscoveryType }) {
  const [category, setCategory] = useState<DiscoveryCategory>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const listings = discoveryListings.filter((listing) => {
    if (initialType !== "all" && listing.kind !== initialType) return false;
    if (category !== "all" && !listing.categories.includes(category)) return false;
    return !normalizedQuery || listing.searchText.includes(normalizedQuery);
  });
  const heading = initialType === "product" ? "Products" : initialType === "skill" ? "Skills" : "Discover Products and Skills";

  return (
    <SiteShell className="products-page">
      <section className="products-directory" aria-labelledby="discover-directory-heading">
        <h1 className="sr-only" id="discover-directory-heading">{heading}</h1>
        <header className="product-categories">
          <span>DISCOVER</span>
          <nav aria-label="Discovery type">
            {typeLinks.map((item) => <a className={initialType === item.id ? "active" : ""} aria-current={initialType === item.id ? "page" : undefined} href={item.href} key={item.id}>{item.label}</a>)}
          </nav>
        </header>
        <label className="product-directory-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products and skills"
            aria-label="Search products and skills"
          />
          <small>{listings.length} RESULT{listings.length === 1 ? "" : "S"}</small>
        </label>
        <nav className="discovery-categories" aria-label="Discovery categories">
          <span>CATEGORY</span>
          <div>{categories.map((item) => <button type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} key={item.id}>{item.label}</button>)}</div>
        </nav>
        <div className="products-grid" aria-live="polite">
          {listings.map((listing) => <a className={`product-directory-card${listing.kind === "skill" ? " skill-directory-card" : ""}`} href={listing.href} key={listing.id}>
            <header>{listing.logoUrl ? <img src={listing.logoUrl} alt="" /> : <span className="skill-directory-mark">SK</span>}<div><h2>{listing.name}</h2><span>{listing.kind === "product" ? `By ${listing.owner}` : listing.owner}</span></div><i>↗</i></header>
            <p>{listing.summary}</p>
            <div className="product-directory-meta"><span>{listing.kind}</span>{listing.categories[0] ? <span>{listing.categories[0]}</span> : null}<span>{listing.outcomes.length ? `${listing.outcomes.length} ${listing.outcomes.length === 1 ? "Outcome" : "Outcomes"}` : "No outcomes yet"}</span></div>
          </a>)}
        </div>
        {!listings.length ? <p className="products-empty">No Products or Skills match this search.</p> : null}
      </section>
    </SiteShell>
  );
}

export function ProductsPage() {
  return <DiscoverPage initialType="product" />;
}

export function SkillsPage() {
  return <DiscoverPage initialType="skill" />;
}
