import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it } from "vitest";
import { AuthoringDocsPage, DocsPage, DynamicOutcomeDetailPage, OutcomesPage, PublishPage } from "./App";
import type { DirectoryOutcomeDetail } from "./dynamic-outcome-detail";
import type { DiscoveryOutcome } from "./discovery-data";
import { normalizeSource } from "./publish";

afterEach(() => { cleanup(); window.history.pushState({}, "", "/"); });

const baseOutcome: DiscoveryOutcome = {
  id: "fixture-1",
  databaseId: "00000000-0000-0000-0000-000000000001",
  slug: "possible-launch-film",
  title: "Possible Launch Film",
  summary: "A launch film explaining what agents can make.",
  prompt: "Create a launch film.",
  href: "/outcomes/view/?id=00000000-0000-0000-0000-000000000001",
  category: "video",
  sources: [{ kind: "product", id: "heygen/hyperframes", name: "HyperFrames", owner: "HeyGen", role: "primary" }],
  source: { kind: "product", id: "heygen/hyperframes", name: "HyperFrames", owner: "HeyGen", role: "primary" },
  requirements: [],
  publicationKind: "community",
  useCount: 0,
  likeCount: 0,
  publishedAt: "2026-08-24T00:00:00Z",
  catalogNumber: 1,
};

const seedOutcomes: DiscoveryOutcome[] = [
  baseOutcome,
  { ...baseOutcome, id: "fixture-2", title: "Lantern Rain: Quiet Soundtrack", summary: "A quiet original instrumental soundtrack.", prompt: "Compose a quiet soundtrack.", category: "audio", catalogNumber: 2 },
  {
    ...baseOutcome,
    id: "fixture-3",
    title: "Robot Snake CAD Prototype",
    summary: "An articulated robot CAD model.",
    prompt: "Create an articulated robot CAD model.",
    category: "cad",
    sources: [{ kind: "skill", id: "earthtojake/text-to-cad/skills/cad", name: "CAD", owner: "earthtojake/text-to-cad", role: "primary" }],
    source: { kind: "skill", id: "earthtojake/text-to-cad/skills/cad", name: "CAD", owner: "earthtojake/text-to-cad", role: "primary" },
    catalogNumber: 3,
  },
];

const detailFixture: DirectoryOutcomeDetail = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "Possible Launch Film",
  summary: "A launch film explaining what agents can make.",
  about_markdown: "# Possible Launch Film\n\nA launch film explaining what agents can make.",
  prompt: "Create a launch film.",
  result_media_url: "https://example.com/film.mp4",
  poster_url: "https://example.com/poster.jpg",
  provider: "OpenAI",
  agent: "Codex",
  model: "GPT-5.6",
  author_name: "Fray Labs",
  author_url: "https://fraylabs.com",
  requirements: [],
  published_at: "2026-08-24T00:00:00Z",
  publication_kind: "community",
  source_locator: "fraylabs/possible-outcomes",
  source_url: "https://github.com/fraylabs/possible-outcomes",
  preview: { video: { src: "https://example.com/film.mp4", poster: "https://example.com/poster.jpg" } },
  inputs: [],
  artifacts: [{ type: "source", src: "https://example.com/source.zip", label: "Editable source", format: "zip" }],
};

describe("Possible website", () => {
  const outcomeFixture: DiscoveryOutcome[] = Array.from({ length: 12 }, (_, index) => ({
    ...seedOutcomes[index % seedOutcomes.length]!,
    id: `fixture-${index + 1}`,
    title: `Fixture Outcome ${index + 1}`,
    catalogNumber: index + 1,
    useCount: 12 - index,
  }));

  it("uses one ranked, visual Outcome directory as the homepage", async () => {
    const { container } = render(<OutcomesPage outcomesFixture={outcomeFixture} />);
    expect(screen.getByRole("heading", { name: "All Outcomes", level: 1 })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["DOCS", "PUBLISH"]);
    expect(screen.queryByRole("heading", { name: "Most copied Outcomes" })).not.toBeInTheDocument();
    expect(container.querySelectorAll(".home-outcome-fallback").length).toBeGreaterThan(0);
    expect(screen.getAllByText("HyperFrames").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/product · HeyGen/i).length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.home-result-row[data-featured="true"]')).toHaveLength(3);
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getAllByRole("navigation", { name: "Outcome pages" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Next Outcome page" }));
    expect(screen.getByRole("heading", { name: "Fixture Outcome 11" })).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("turns ordinary searches into related visual results", async () => {
    render(<OutcomesPage outcomesFixture={seedOutcomes} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "What do you want an agent to make?" }), "quiet soundtrack");
    expect(within(screen.getByRole("region", { name: "Outcome results" })).getByRole("heading", { name: /Lantern Rain/i })).toBeInTheDocument();
  });

  it("filters Outcomes by understandable capability categories", async () => {
    render(<OutcomesPage outcomesFixture={seedOutcomes} />);
    await userEvent.click(screen.getByRole("button", { name: "CAD" }));
    const results = screen.getByRole("region", { name: "Outcome results" });
    expect(within(results).getByRole("heading", { name: /Robot Snake CAD Prototype/i })).toBeInTheDocument();
    expect(within(results).queryByRole("heading", { name: /Launch Film/i })).not.toBeInTheDocument();
  });

  it("uses Product and Skill labels as shareable leaderboard filters", async () => {
    render(<OutcomesPage outcomesFixture={seedOutcomes} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Filter by product HyperFrames" })[0]!);
    const results = screen.getByRole("region", { name: "Outcome results" });
    expect(within(results).getByRole("heading", { name: /Possible Launch Film/i })).toBeInTheDocument();
    expect(within(results).queryByRole("heading", { name: /Robot Snake CAD Prototype/i })).not.toBeInTheDocument();
    expect(window.location.search).toContain("uses=product%3Aheygen%2Fhyperframes");
    await userEvent.click(screen.getByRole("button", { name: "Clear Product or Skill filter" }));
    expect(within(screen.getByRole("region", { name: "Outcome results" })).getByRole("heading", { name: /Robot Snake CAD Prototype/i })).toBeInTheDocument();
  });

  it("shows a source-owned preview, exact prompt, provenance, and artifacts", async () => {
    const { container } = render(<DynamicOutcomeDetailPage outcomeFixture={detailFixture} attributionsFixture={[{ id: "heygen/hyperframes", kind: "Product", name: "HyperFrames", owner: "HeyGen", href: "/?uses=product%3Aheygen%2Fhyperframes#discover", role: "primary" }]} />);
    expect(screen.getByRole("heading", { name: "Possible Launch Film", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What it made" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Download the result" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeInTheDocument();
    expect(screen.getByText(/Primary Product · HeyGen/i)).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/workstreams|trust|verification framework/i);
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("documents the same small public contract", () => {
    render(<DocsPage />);
    expect(screen.getByRole("heading", { name: "Possible connects results, prompts, and what made them" })).toBeInTheDocument();
    cleanup();
    render(<AuthoringDocsPage />);
    expect(screen.getByRole("heading", { name: "Publish from your source" })).toBeInTheDocument();
    expect(screen.getByText(/Possible reads it—no account required/i)).toBeInTheDocument();
  });

  it("publishes from a public source without a publisher account", () => {
    render(<PublishPage />);
    expect(screen.getByRole("heading", { name: "Publish from your source." })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /GitHub repository or publisher domain/i })).toBeInTheDocument();
  });

  it("normalizes publisher sources without inventing account state", () => {
    expect(normalizeSource(" https://example.com/ ")).toBe("https://example.com");
    expect(normalizeSource("owner/repository")).toBe("owner/repository");
  });
});
