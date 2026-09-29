import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it } from "vitest";
import { AuthoringDocsPage, DocsPage, DynamicOutcomeDetailPage, OutcomesPage, PublishPage } from "./App";
import type { DirectoryOutcomeDetail } from "./dynamic-outcome-detail";
import type { DiscoveryOutcome } from "./discovery-data";
import { normalizeSource } from "./publish";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
  window.localStorage.removeItem("possible-theme");
  document.documentElement.removeAttribute("data-theme");
});

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
    expect(screen.getByRole("heading", { name: "See what AI can make.", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All Outcomes", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Inspect real results. Take the recipe to your agent.")).toBeInTheDocument();
    expect(screen.getByText("Ranked by copies")).toBeInTheDocument();
    expect(screen.getByText("12 copies")).toBeInTheDocument();
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

  it("keeps a site-wide theme preference and can return to the system theme", async () => {
    render(<OutcomesPage outcomesFixture={seedOutcomes} />);
    const theme = screen.getByRole("combobox", { name: "Theme" });

    await userEvent.selectOptions(theme, "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("possible-theme")).toBe("dark");

    await userEvent.selectOptions(theme, "system");
    expect(document.documentElement.dataset.theme).toBe("system");
    expect(window.localStorage.getItem("possible-theme")).toBeNull();
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
    const outcomeWithGallery = {
      ...detailFixture,
      requirements: ["Reference image", "Target dimensions", "Material choice", "Printer constraints"],
      preview: { images: [{ src: "https://example.com/tall-result.png", alt: "Tall result preview", cover: true }, { src: "https://example.com/detail.png", alt: "Detail preview" }] },
    } satisfies DirectoryOutcomeDetail;
    const { container } = render(<DynamicOutcomeDetailPage outcomeFixture={outcomeWithGallery} attributionsFixture={[{ id: "heygen/hyperframes", kind: "Product", name: "HyperFrames", owner: "HeyGen", href: "/?uses=product%3Aheygen%2Fhyperframes#discover", role: "primary" }]} />);
    expect(screen.getByRole("heading", { name: "Possible Launch Film", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Outcome result" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exact prompt" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Download the result" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show full prompt" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Tall result preview" })).toBeInTheDocument();
    expect(container.querySelector(".outcome-gallery-stage")).toBeInTheDocument();
    expect(container.querySelector(".outcome-downloads")).toBeInTheDocument();
    expect(screen.getByText("HyperFrames")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show image 2" }));
    expect(screen.getByRole("img", { name: "Detail preview" })).toBeInTheDocument();
    expect(screen.queryByText("Printer constraints")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show all 4 requirements" }));
    expect(screen.getByText("Printer constraints")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show full prompt" }));
    expect(container.querySelector(".outcome-prompt-panel")).toHaveClass("is-expanded");
    await userEvent.click(screen.getByRole("button", { name: "Remix prompt" }));
    expect(screen.getByRole("textbox", { name: "Remix prompt" })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/workstreams|trust|verification framework/i);
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("shows the recipe after the result and copies the complete kit without losing prompt copy", async () => {
    const user = userEvent.setup();
    const commit = "a".repeat(40);
    const outcome: DirectoryOutcomeDetail = {
      ...detailFixture,
      models: [
        { provider: "OpenAI", model: "GPT-6", agent: "Codex", role: "execution" },
        { provider: "Anthropic", model: "Claude", agent: "Claude Code", role: "review" },
      ],
      recipe: {
        agent: { name: "Codex", version: "1.2", url: "https://example.com/agent" },
        skills: [{ repository: "maker/film", directory: "skills/video", lastReviewedCommit: commit }],
        references: [{ kind: "document", label: "Visual brief", url: "https://example.com/brief", purpose: "Sets the visual direction." }],
        tools: [{ name: "Renderer", purpose: "Renders the final film.", url: "https://example.com/render" }],
        steps: [{ title: "Storyboard", instructions: "Plan three scenes.", prompt: "Draft the opening scene." }, { title: "Render", instructions: "Render and inspect the result." }],
      },
    };
    const { container } = render(<DynamicOutcomeDetailPage outcomeFixture={outcome} />);
    const panel = screen.getByRole("region", { name: "How it was made" });
    expect(container.querySelector(".outcome-gallery")?.nextElementSibling).toBe(panel);
    expect(within(panel).getByText("GPT-6 · OpenAI · execution · Codex")).toBeInTheDocument();
    expect(within(panel).getByText("Claude · Anthropic · review · Claude Code")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /maker\/film/ })).toHaveAttribute("href", `https://github.com/maker/film/tree/${commit}/skills/video`);
    expect(within(panel).getByText("Sets the visual direction.")).toBeInTheDocument();
    expect(within(panel).getByText("Renders the final film.")).toBeInTheDocument();
    expect(Array.from(panel.querySelectorAll("ol h4")).map((element) => element.textContent)).toEqual(["Storyboard", "Render"]);
    for (const link of panel.querySelectorAll("a")) expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await user.click(screen.getByRole("button", { name: "Copy recipe" }));
    const kit = await navigator.clipboard.readText();
    expect(kit).toContain(commit);
    expect(kit).toContain("Claude · Anthropic · review · Claude Code");
    expect(kit).toContain("1. Storyboard\nPlan three scenes.\nStep prompt:\nDraft the opening scene.");
    expect(kit).toContain("2. Render\nRender and inspect the result.");
    expect(kit).toContain("Exact published prompt\nCreate a launch film.");
    await user.click(screen.getByRole("button", { name: "Copy prompt" }));
    expect(await navigator.clipboard.readText()).toBe(outcome.prompt);
    await user.click(screen.getByRole("button", { name: "Remix prompt" }));
    await user.clear(screen.getByRole("textbox", { name: "Remix prompt" }));
    await user.type(screen.getByRole("textbox", { name: "Remix prompt" }), "Make a shorter film.");
    await user.click(screen.getByRole("button", { name: "Copy remixed prompt" }));
    expect(await navigator.clipboard.readText()).toBe("Make a shorter film.");
    await user.click(screen.getByRole("button", { name: "Copy recipe" }));
    expect(await navigator.clipboard.readText()).toContain("Exact published prompt\nCreate a launch film.");
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("preserves emoji and script joiners in displayed and copied prompts", async () => {
    const user = userEvent.setup();
    const prompt = "Draw ❤️ and 👩‍💻 with the label می‌روم and क्‍ष.";
    render(<DynamicOutcomeDetailPage outcomeFixture={{ ...detailFixture, prompt }} />);
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy prompt" }));
    expect(await navigator.clipboard.readText()).toBe(prompt);
  });

  it("makes invisible text visible in legacy prompts, recipe steps and clipboard content", async () => {
    const user = userEvent.setup();
    const hidden = String.fromCodePoint(0xe0041);
    const outcome: DirectoryOutcomeDetail = { ...detailFixture, prompt: `Draw a planet.${hidden}`, recipe: { steps: [{ title: "Draw", instructions: "Use circles.", prompt: `Add rings.${hidden}` }] } };
    const { container } = render(<DynamicOutcomeDetailPage outcomeFixture={outcome} />);
    expect(screen.getByRole("note")).toHaveTextContent("hidden characters");
    expect(container.textContent).not.toContain(hidden);
    await user.click(screen.getByRole("button", { name: "Copy prompt" }));
    expect(await navigator.clipboard.readText()).toBe("Draw a planet.\\u{e0041}");
    await user.click(screen.getByRole("button", { name: "Copy recipe" }));
    expect(await navigator.clipboard.readText()).toContain("Add rings.\\u{e0041}");
    expect(await navigator.clipboard.readText()).not.toContain(hidden);
  });

  it("distinguishes recorded and reconstructed recipes in the page and copied text", async () => {
    const user = userEvent.setup();
    const recorded: DirectoryOutcomeDetail = { ...detailFixture, recipe: {
      provenance: { method: "recorded", source: "claude-code", reviewedAt: "2026-09-30T00:00:00Z", reviewDigest: "a".repeat(64) },
      notes: ["Some source details were removed for privacy."],
      steps: [{ title: "First request", instructions: "Recorded user message", prompt: "Make a spinning planet." }],
    } };
    render(<DynamicOutcomeDetailPage outcomeFixture={recorded} />);
    expect(screen.getByText("Recorded from session")).toBeInTheDocument();
    expect(screen.getByText(/not an unedited transcript/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy recipe" }));
    expect(await navigator.clipboard.readText()).toContain("Some source details were removed for privacy.");
    expect(await navigator.clipboard.readText()).toContain("Recorded from session");
    cleanup();
    render(<DynamicOutcomeDetailPage outcomeFixture={{ ...detailFixture, recipe: { provenance: { method: "reconstructed" } } }} />);
    expect(screen.getByText("Reconstructed")).toBeInTheDocument();
    expect(screen.queryByText("Recorded from session")).not.toBeInTheDocument();
  });

  it("labels an external legacy Outcome prompt only while retaining its creator and model", async () => {
    const user = userEvent.setup();
    const outcome = { ...detailFixture, author_name: "Independent Maker", author_url: "https://maker.example", source_url: "https://github.com/maker/old-outcome", source_locator: "maker/old-outcome" };
    render(<DynamicOutcomeDetailPage outcomeFixture={outcome} />);
    const panel = screen.getByRole("region", { name: "How it was made" });
    expect(within(panel).getByText("Prompt only")).toBeInTheDocument();
    expect(within(panel).queryByText("PUBLISHED RECIPE")).not.toBeInTheDocument();
    expect(within(panel).getByText("GPT-5.6 · OpenAI · Codex")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Independent Maker" })).toHaveAttribute("href", "https://maker.example");
    await user.click(screen.getByRole("button", { name: "Copy recipe" }));
    expect(await navigator.clipboard.readText()).toContain("Prompt only — no recipe was published.");
    expect(await navigator.clipboard.readText()).toContain(outcome.prompt);
  });

  it("keeps partial recipe omissions explicit and rejects unsafe recipe links", () => {
    render(<DynamicOutcomeDetailPage outcomeFixture={{ ...detailFixture, model: null, provider: null, agent: null, recipe: { tools: [{ name: "Offline editor", purpose: "Edited the result.", url: "javascript:alert(1)" }] } }} />);
    const panel = screen.getByRole("region", { name: "How it was made" });
    expect(within(panel).getByText("Not recorded.")).toBeInTheDocument();
    expect(within(panel).getByText("No steps were recorded.")).toBeInTheDocument();
    expect(within(panel).getByText("Offline editor")).toBeInTheDocument();
    expect(within(panel).queryByRole("link")).not.toBeInTheDocument();
    expect(panel).toHaveTextContent("Unlisted details are unknown.");
  });

  it("documents the same small public contract", () => {
    render(<DocsPage />);
    expect(screen.getByRole("heading", { name: "Results and the recipes behind them" })).toBeInTheDocument();
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
