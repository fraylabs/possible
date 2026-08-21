import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { AccountProfilePage, AuthoringDocsPage, DiscoverPage, DocsPage, OutcomeDetailPage, ProductDetailPage, ProductsPage, PublishPage, SkillDetailPage, SkillsPage } from "./App";
import { commonSearches } from "./catalog";
import { getPublishedOutcome, searchPublishedOutcomes } from "./public-content";
import { getOutcomeState, summarizeGalleryImport } from "./publish";

vi.mock("./OutcomeCadViewer", () => ({ default: () => <div data-testid="cad-viewer" /> }));
afterEach(() => { cleanup(); window.history.pushState({}, "", "/"); });

describe("Possible website", () => {
  it("uses the visual Outcome directory as the homepage", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Anything is possible/, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Discover what agents can do.")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["OUTCOMES", "DISCOVER", "DOCS", "GITHUB ↗"]);
    const gallery = screen.getByRole("region", { name: "Outcome directory" });
    expect(within(gallery).getAllByRole("link")).toHaveLength(5);
    expect(gallery.querySelector(".library-pack-card.has-media .library-pack-visual")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Outcome pages" })).not.toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: "Outcomes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Community 1" })).toBeInTheDocument();
    expect(screen.queryByText(/checkout|pricing unknown/i)).not.toBeInTheDocument();
  });

  it("discovers Products and Skills in one searchable directory", async () => {
    const { container } = render(<DiscoverPage />);
    const directory = screen.getByRole("region", { name: "Discover Products and Skills" });
    expect(directory.querySelector('a[href="/products/hyperframes"]')).toBeInTheDocument();
    expect(directory.querySelector('a[href^="/skills/"]')).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search products and skills" }), "pptx");
    expect(screen.getByRole("link", { name: /Pptx Generator/i })).toBeInTheDocument();
    expect(container.querySelector('a[href="/products/hyperframes"]')).not.toBeInTheDocument();
  });

  it("uses the same gallery-first structure for Skills", () => {
    render(<SkillsPage />);
    expect(screen.getByRole("region", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Strudel Compose/i })).toBeInTheDocument();
    cleanup();
    render(<SkillDetailPage id="MiniMax-AI/skills/skills/pptx-generator" />);
    expect(screen.getByRole("heading", { name: "Pptx Generator", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Community/ })).toBeInTheDocument();
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
    expect(screen.queryByText("OPEN SOURCE / 2026")).not.toBeInTheDocument();
  });

  it("presents an account as Outcomes first, with linked Products and Skills", async () => {
    render(<AccountProfilePage handle="fray-labs" />);
    expect(screen.getByRole("heading", { name: "Fray Labs", level: 1 })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Fray Labs Outcomes" })).getAllByRole("link")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /products\s*2/i }));
    expect(within(screen.getByRole("region", { name: "Fray Labs Products" })).getAllByRole("link")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: /skills\s*17/i }));
    expect(within(screen.getByRole("region", { name: "Fray Labs Skills" })).getAllByRole("link")).toHaveLength(17);
  });

  it("reduces publication to three human states and reports import changes", () => {
    expect(getOutcomeState({ is_published: true, is_publishable: true })).toBe("Published");
    expect(getOutcomeState({ is_published: false, is_publishable: true })).toBe("Unpublished");
    expect(getOutcomeState({ is_published: false, is_publishable: false })).toBe("Missing information");
    expect(summarizeGalleryImport({
      items: [
        { sourceKey: "new", title: "New", prompt: "Make it", resultMediaUrl: "https://example.com/new.mp4" },
        { sourceKey: "existing", title: "Existing", prompt: null, resultMediaUrl: "https://example.com/existing.mp4" },
      ],
      warnings: [{ message: "Prompt is not public." }],
    }, new Set(["existing"]))).toEqual({ received: 2, added: 1, updated: 1, incomplete: 1, warnings: 1 });
  });
});
