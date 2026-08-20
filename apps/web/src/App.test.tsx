import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { AuthoringDocsPage, DocsPage, OutcomeDetailPage, ProductDetailPage, ProductsPage, PublishPage } from "./App";
import { commonSearches } from "./catalog";
import { getPublishedOutcome, searchPublishedOutcomes } from "./public-content";

vi.mock("./OutcomeCadViewer", () => ({ default: () => <div data-testid="cad-viewer" /> }));
afterEach(() => { cleanup(); window.history.pushState({}, "", "/"); });

describe("Possible website", () => {
  it("uses the visual Outcome directory as the homepage", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Anything is possible/, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Discover what agents can do.")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["OUTCOMES", "PRODUCTS", "DOCS", "GITHUB ↗"]);
    const gallery = screen.getByRole("region", { name: "Outcome directory" });
    expect(within(gallery).getAllByRole("link")).toHaveLength(6);
    expect(gallery.querySelector(".library-pack-card.has-media .library-pack-visual")).toBeInTheDocument();
    const pagination = screen.getByRole("navigation", { name: "Outcome pages" });
    expect(within(pagination).getByRole("button", { name: "Page 2" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("turns common searches into prompt-directory results", async () => {
    render(<App />);
    for (const query of commonSearches) expect(searchPublishedOutcomes(query).length, query).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Compose a quiet Strudel soundtrack" }));
    expect(screen.getByRole("searchbox", { name: "Search what agents can do" })).toHaveValue("Compose a quiet Strudel soundtrack");
    const results = screen.getByRole("region", { name: "Agent outcome search results" });
    expect(within(results).getByRole("heading", { name: /Lantern Rain: Original Strudel Soundtrack/i })).toBeInTheDocument();
    expect(within(results).getAllByText("Exact prompt").length).toBeGreaterThan(0);
  });

  it("shows the preview, exact prompt, provenance, author, Products, and optional Skills", async () => {
    const entry = getPublishedOutcome("html-css-animated-product-launch-film");
    expect(entry).toBeDefined();
    const { container } = render(<OutcomeDetailPage slug="html-css-animated-product-launch-film" />);
    expect(screen.getByRole("heading", { name: entry?.outcome.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What it can make" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Original request" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Made with" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remix this prompt" })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/workstreams|trust|verification framework/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps Products as official attribution with related Outcome cards", () => {
    render(<ProductsPage />);
    expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HyperFrames/i })).toBeInTheDocument();
    cleanup();
    render(<ProductDetailPage id="heygen/hyperframes" />);
    expect(screen.getByRole("heading", { name: "HyperFrames", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "COMMUNITY" })).toBeInTheDocument();
    expect(screen.queryByText(/checkout|pricing unknown/i)).not.toBeInTheDocument();
  });

  it("documents the same small public contract", () => {
    render(<DocsPage />);
    expect(screen.getByRole("heading", { name: "Possible connects results, prompts, and sources" })).toBeInTheDocument();
    cleanup();
    render(<AuthoringDocsPage />);
    expect(screen.getByRole("heading", { name: "Share an Outcome" })).toBeInTheDocument();
    expect(screen.getByText(/The prompt, provider, model, title, summary, and author are required/)).toBeInTheDocument();
    expect(screen.queryByText(/trust status|expectations checklist|compiler/i)).not.toBeInTheDocument();
  });

  it("keeps the publisher workspace private and explicit when it is not configured", () => {
    render(<PublishPage />);
    expect(screen.getByRole("heading", { name: "Publisher workspace" })).toBeInTheDocument();
    expect(screen.getByText(/ignored workspace environment file/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /publish/i })).not.toBeInTheDocument();
  });
});
