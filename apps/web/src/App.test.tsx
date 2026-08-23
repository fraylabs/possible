import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { AuthoringDocsPage, DocsPage, OutcomeDetailPage, OutcomesPage, ProductDetailPage, PublishPage, SkillDetailPage } from "./App";
import { localDiscoveryOutcomes } from "./discovery-data";
import type { DiscoveryOutcome } from "./discovery-data";
import { getPublishedOutcome } from "./public-content";
import { normalizeSource } from "./publish";

vi.mock("./OutcomeCadViewer", () => ({ default: () => <div data-testid="cad-viewer" /> }));
afterEach(() => { cleanup(); window.history.pushState({}, "", "/"); });

describe("Possible website", () => {
  const outcomeFixture: DiscoveryOutcome[] = Array.from({ length: 12 }, (_, index) => ({
    ...localDiscoveryOutcomes[index % localDiscoveryOutcomes.length]!,
    id: `fixture-${index + 1}`,
    title: `Fixture Outcome ${index + 1}`,
    catalogNumber: index + 1,
  }));
  it("uses one ranked, visual Outcome directory as the homepage", async () => {
    const { container } = render(<OutcomesPage outcomesFixture={outcomeFixture} />);
    expect(screen.getByRole("heading", { name: "What do you want an agent to make?", level: 1 })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["DOCS", "PUBLISH"]);
    expect(container.querySelector(".site-shell > .site-nav > .site-nav-inner.layout-wide")).toBeInTheDocument();
    expect(container.querySelector(".site-shell > .site-shell-body")).toContainElement(screen.getByRole("region", { name: "Outcome results" }));
    expect(container.querySelector(".site-shell > .site-footer > .site-footer-inner.layout-wide")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Most copied Outcomes" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(within(screen.getByRole("region", { name: "Outcome results" })).getAllByText("0 copies")).toHaveLength(10);
    expect(screen.getAllByText(/★ 0\.0 · 0 reviews/)).toHaveLength(10);
    expect(screen.getByRole("navigation", { name: "Outcome pages" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next Outcome page" }));
    expect(screen.getByRole("heading", { name: "Fixture Outcome 11" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(window.location.search).toContain("page=2");
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("turns ordinary searches into related visual results", async () => {
    render(<App />);
    await userEvent.type(screen.getByRole("searchbox", { name: "What do you want an agent to make?" }), "quiet soundtrack");
    const results = screen.getByRole("region", { name: "Outcome results" });
    expect(within(results).getByRole("heading", { name: /Lantern Rain: Original Strudel Soundtrack/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "List" })).not.toBeInTheDocument();
    expect(window.location.search).toContain("q=quiet+soundtrack");
  });

  it("filters Outcomes by understandable capability categories", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "CAD" }));
    const results = screen.getByRole("region", { name: "Outcome results" });
    expect(within(results).getByRole("heading", { name: /Robot Snake CAD Prototype/i })).toBeInTheDocument();
    expect(within(results).queryByRole("heading", { name: /Launch Film/i })).not.toBeInTheDocument();
    expect(window.location.search).toContain("category=cad");
  });

  it("shows the preview, exact prompt, provenance, author, Products, and optional Skills", async () => {
    const entry = getPublishedOutcome("html-css-animated-product-launch-film");
    expect(entry).toBeDefined();
    if (!entry) {
      throw new Error("Expected the launch-film Outcome fixture to exist");
    }
    const { container } = render(<OutcomeDetailPage slug="html-css-animated-product-launch-film" />);
    expect(screen.getByRole("heading", { name: entry.outcome.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What it can make" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Original request" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Made with" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remix this prompt" })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/workstreams|trust|verification framework/i);
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("keeps Products as official attribution with related Outcome cards", () => {
    render(<ProductDetailPage id="heygen/hyperframes" />);
    expect(screen.getByRole("heading", { name: "HyperFrames", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Outcomes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Community 1" })).toBeInTheDocument();
    expect(screen.queryByText(/checkout|pricing unknown/i)).not.toBeInTheDocument();
  });

  it("uses the same gallery-first structure for Skills", () => {
    render(<SkillDetailPage id="MiniMax-AI/skills/skills/pptx-generator" />);
    expect(screen.getByRole("heading", { name: "Pptx Generator", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Community/ })).toBeInTheDocument();
  });

  it("documents the same small public contract", () => {
    render(<DocsPage />);
    expect(screen.getByRole("heading", { name: "Possible connects results, prompts, and what made them" })).toBeInTheDocument();
    cleanup();
    render(<AuthoringDocsPage />);
    expect(screen.getByRole("heading", { name: "Publish from your source" })).toBeInTheDocument();
    expect(screen.getByText(/Possible reads it—no account required/i)).toBeInTheDocument();
    expect(screen.getAllByText(/outcome\.md/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/trust status|expectations checklist|compiler/i)).not.toBeInTheDocument();
  });

  it("publishes from a public source without a publisher account", () => {
    render(<PublishPage />);
    expect(screen.getByRole("heading", { name: "Publish from your source." })).toBeInTheDocument();
    expect(screen.getByText(/no account required/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /GitHub repository or publisher domain/i })).toBeInTheDocument();
  });

  it("normalizes publisher sources without inventing account state", () => {
    expect(normalizeSource(" https://example.com/ ")).toBe("https://example.com");
    expect(normalizeSource("owner/repository")).toBe("owner/repository");
  });
});
