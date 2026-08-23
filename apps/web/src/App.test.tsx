import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { AccountProfilePage, AuthoringDocsPage, DashboardPage, DocsPage, OutcomeDetailPage, OutcomesPage, ProductDetailPage, SkillDetailPage } from "./App";
import type { WeeklySourceRanking } from "./discovery-data";
import { getPublishedOutcome } from "./public-content";
import { getOutcomeState, summarizeGalleryImport } from "./publish";

vi.mock("./OutcomeCadViewer", () => ({ default: () => <div data-testid="cad-viewer" /> }));
afterEach(() => { cleanup(); window.history.pushState({}, "", "/"); });

describe("Possible website", () => {
  const rankingFixture: WeeklySourceRanking[] = Array.from({ length: 12 }, (_, index) => ({
    type: index % 2 === 0 ? "product" : "skill",
    id: `source-${index + 1}`,
    slug: `source-${index + 1}`,
    name: `Source ${index + 1}`,
    owner: "Example",
    href: index % 2 === 0 ? `/products/source-${index + 1}` : `/skills/source-${index + 1}`,
    copies: 120 - index,
  }));

  it("uses one ranked, visual Outcome directory as the homepage", async () => {
    const { container } = render(<OutcomesPage rankingFixture={rankingFixture} />);
    expect(screen.getByRole("heading", { name: "Most copied this week", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What can agents make?", level: 2 })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["DOCS", "DASHBOARD"]);
    expect(container.querySelector(".site-shell > .site-nav > .site-nav-inner.layout-wide")).toBeInTheDocument();
    expect(container.querySelector(".site-shell > .site-shell-body")).toContainElement(screen.getByRole("region", { name: "Outcome gallery" }));
    expect(container.querySelector(".site-shell > .site-footer > .site-footer-inner.layout-wide")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.getByRole("navigation", { name: "Weekly ranking pages" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next ranking page" }));
    expect(screen.getByRole("link", { name: /Source 11/i })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(window.location.search).toContain("rankingPage=2");
    const gallery = screen.getByRole("region", { name: "Outcome gallery" });
    expect(within(gallery).getByRole("heading", { name: /Possible Launch Film/i })).toBeInTheDocument();
    expect(within(gallery).getAllByRole("button", { name: "Copy prompt" })).toHaveLength(6);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("turns ordinary searches into related cards and a compact list", async () => {
    render(<App />);
    await userEvent.type(screen.getByRole("searchbox", { name: "What do you want an agent to make?" }), "quiet soundtrack");
    expect(screen.queryByRole("heading", { name: "Most copied this week" })).not.toBeInTheDocument();
    const gallery = screen.getByRole("region", { name: "Outcome gallery" });
    expect(within(gallery).getByRole("heading", { name: /Lantern Rain: Original Strudel Soundtrack/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("region", { name: "Outcome list" })).toBeInTheDocument();
    expect(window.location.search).toContain("view=list");
  });

  it("filters Outcomes by understandable capability categories", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "CAD" }));
    const gallery = screen.getByRole("region", { name: "Outcome gallery" });
    expect(within(gallery).getByRole("heading", { name: /Robot Snake CAD Prototype/i })).toBeInTheDocument();
    expect(within(gallery).queryByRole("heading", { name: /Launch Film/i })).not.toBeInTheDocument();
    expect(window.location.search).toContain("category=cad");
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
    expect(screen.getByRole("heading", { name: "Possible connects results, prompts, and sources" })).toBeInTheDocument();
    cleanup();
    render(<AuthoringDocsPage />);
    expect(screen.getByRole("heading", { name: "Share an Outcome" })).toBeInTheDocument();
    expect(screen.getByText(/The prompt, provider, model, title, summary, and author are required/)).toBeInTheDocument();
    expect(screen.queryByText(/trust status|expectations checklist|compiler/i)).not.toBeInTheDocument();
  });

  it("keeps the publisher workspace private and explicit when it is not configured", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("heading", { name: "Publisher workspace" })).toBeInTheDocument();
    expect(screen.getByText(/ignored workspace environment file/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /publish/i })).not.toBeInTheDocument();
    expect(screen.queryByText("OPEN SOURCE / 2026")).not.toBeInTheDocument();
  });

  it("presents an account as Outcomes first, with linked Products and Skills", async () => {
    render(<AccountProfilePage handle="fray-labs" />);
    expect(screen.getByRole("heading", { name: "Fray Labs", level: 1 })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Fray Labs Outcomes" })).getAllByRole("link")).toHaveLength(6);
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
