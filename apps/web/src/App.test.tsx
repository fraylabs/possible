import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compilePack, outcomePacks } from "@possible/packs";
import App from "./App";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

function expectBefore(first: Element, second: Element) {
  expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
}

describe("Possible", () => {
  it("puts installation and the complete pack index in one clear starting journey", () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "What outcome do you want to achieve today?", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText("Possible is an outcome skill for Codex. Its packs compile dozens of coordinated tasks, specialist skills, and verification gates into one approved run—like taking a SaaS from idea to release.")).toBeInTheDocument();
    expect(screen.getByText("npx @fraylabs/possible init")).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".install-next code" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("link", { name: "BLOGS" })).toHaveAttribute("href", "/blogs");
    expect(screen.queryByRole("link", { name: "PACKS" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Browse packs/i })).not.toBeInTheDocument();
    const start = screen.getByRole("region", { name: "Start with Possible" });
    expect(within(start).getByRole("heading", { name: /Packs are complete recipes for.*real outcomes/i, level: 2 })).toBeInTheDocument();
    expect(within(start).getByText(/Describe the outcome.*Possible recommends a pack before Codex begins.*you do not need to choose one yourself/i)).toBeInTheDocument();
    expect(within(start).getByText("npx @fraylabs/possible init")).toBeInTheDocument();
    const packs = screen.getByRole("list", { name: "Packs Possible can recommend" });
    expect(within(packs).getAllByRole("listitem")).toHaveLength(8);
    for (const pack of outcomePacks) {
      expect(within(packs).getByRole("link", { name: `${pack.name}, ${pack.lane[0].toUpperCase()}${pack.lane.slice(1)} pack` })).toHaveAttribute(
        "href",
        `/packs/${pack.slug}`,
      );
    }
    expect(screen.queryByRole("link", { name: /Open the full pack reference/i })).not.toBeInTheDocument();
    const benchmark = screen.getByRole("region", { name: /Benchmarks, not claims/i });
    expect(within(benchmark).getByText(/Each gets identical model, tools, workspace, time, and brief.*no operator playbook/i)).toBeInTheDocument();
    expect(within(benchmark).getByText(/Independent verifiers score outcomes/i)).toBeInTheDocument();
    expect(within(benchmark).getByText(/Failures stay/i)).toBeInTheDocument();
    expect(within(benchmark).getByRole("link", { name: /Simple Prompt Benchmark.*Useful work from one prompt/i })).toHaveAttribute("href", "/benchmarks/simple-prompt");
    expect(within(benchmark).getByRole("link", { name: /Make Me a Billion-Dollar Company.*Systems built.*verified revenue/i })).toHaveAttribute("href", "/benchmarks/billion-dollar-company");
    expect(within(benchmark).getByRole("link", { name: /Kickstarter Funding Benchmark.*Idea to funds received/i })).toHaveAttribute("href", "/benchmarks/kickstarter-funding");
    expect(within(benchmark).getByRole("link", { name: /Kickstarter-to-Shipped Benchmark.*Funded to 95% shipped/i })).toHaveAttribute("href", "/benchmarks/kickstarter-shipped");
    expect(container.querySelector(".journey")).not.toBeInTheDocument();
    expect(container.querySelector(".recommendation-example")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Filter outcome packs by lane/i })).not.toBeInTheDocument();
    expect(container.querySelector(".schedule-entry, .quick-path, .boundary")).not.toBeInTheDocument();
    expect(container.querySelector("main")).not.toHaveTextContent(/\bAI agents\b|50[–-]100|megaprompt/i);
    expect(container.querySelector("main")).not.toHaveTextContent(/conversational outcome compiler|outcome lanes|pack knowledge|workstreams/i);
  });

  it("collects Possible writing under one blogs index", async () => {
    window.history.pushState({}, "", "/blogs");
    const { container } = render(<App />);
    expect(container.querySelector(".blogs-hero")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Possible writing", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /What is Possible.*READ ARTICLE/is })).toHaveAttribute("href", "/blogs/what-is-possible");
    expect(screen.getByRole("link", { name: /Why Possible.*READ ARTICLE/is })).toHaveAttribute("href", "/blogs/why-possible");
    expect(screen.getByRole("link", { name: /View benchmarks/i })).toHaveAttribute("href", "/benchmarks");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defines Possible as the outcome layer without confusing the product with its parts", async () => {
    window.history.pushState({}, "", "/blogs/what-is-possible");
    const { container } = render(<App />);
    expect(container.querySelector(".what-page.editorial-page .editorial-article .editorial-header .editorial-byline")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Possible is the.*outcome layer.*for AI agents/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("An installable Codex skill.")).toBeInTheDocument();
    expect(screen.getByText(/The skill is the delivery mechanism.*Outcome orchestration is the product/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What each thing means." })).toBeInTheDocument();
    expect(container.querySelectorAll(".what-anatomy article")).toHaveLength(4);
    expect(screen.getByText(/The website is the public home, not the agent/i)).toBeInTheDocument();
    expect(screen.getByText(/not yet a supported product claim/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read the documentation/i })).toHaveAttribute("href", "/docs");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("copies the one-command installer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Copy install command/i }));
    expect(writeText).toHaveBeenCalledWith("npx @fraylabs/possible init");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("makes scheduling operations discoverable from the pack gallery", () => {
    window.history.pushState({}, "", "/packs");
    render(<App />);
    const catalog = screen.getByRole("region", { name: "All outcome packs" });
    expect(within(catalog).getByRole("link", { name: /Web App Operations.*Optional schedule/is })).toHaveAttribute(
      "href",
      "/packs/web-app-operations",
    );
  });

  it("filters the packs catalog by occupied outcome lane", async () => {
    window.history.pushState({}, "", "/packs");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Complete recipes.*Chosen through conversation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start with Possible/i })).toHaveAttribute("href", "/#start");
    expect(screen.getByRole("button", { name: "All, 8 packs" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Playable Web Game" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Web App Operations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Working Web App" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Production Web Release" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Marketing Operations" })).toBeInTheDocument();
    expect(container.querySelector(".pack-art--working")).toBeInTheDocument();
    expect(container.querySelector(".pack-art--production-release")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Create, 2 packs" }));
    expect(screen.getByRole("heading", { name: "Playable Web Game" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Working Web App" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hardware Launch" })).not.toBeInTheDocument();
    expect(screen.getByText("Showing 2 Create packs.")).toBeInTheDocument();
    expect(container.querySelector(".pack-grid")).toHaveClass("pack-grid--filtered");
    expect(container.querySelector(".pack-grid")).not.toHaveClass("pack-grid--single");

    await userEvent.click(screen.getByRole("button", { name: "Launch, 2 packs" }));
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Playable Web Game" })).not.toBeInTheDocument();
    expect(screen.getByText("PACK / 01")).toBeInTheDocument();
    expect(screen.getByText("PACK / 02")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Release, 2 packs" }));
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Production Web Release" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Software Launch" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Operate, 2 packs" }));
    expect(screen.getByRole("heading", { name: "Web App Operations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Marketing Operations" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Open-Source Release" })).not.toBeInTheDocument();
    expect(screen.getByText("Showing 2 Operate packs.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("documents the complete conversation-first journey and its safety boundary", async () => {
    window.history.pushState({}, "", "/docs");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Build complete outcomes with Possible/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /Documentation navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /On this page/i })).toBeInTheDocument();
    expect(screen.getByText("npx @fraylabs/possible init", { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".docs-command--invoke code" })).toBeInTheDocument();
    expect(container.querySelectorAll(".docs-article > section")).toHaveLength(11);
    expect(screen.getByRole("heading", { name: "Glossary" })).toBeInTheDocument();
    expect(screen.getByText(/An observable end state that can be checked/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".docs-glossary > div")).toHaveLength(12);
    expect(screen.getByText(/A task describes work; it does not define success/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /EXAMPLE PACKHardware LaunchView recipe/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(screen.getByText(/WHAT.*YES.*AUTHORIZES/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment, scheduling changes, publishing, spending, outreach, fabrication/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /complete recorded Hardware Launch run/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("columnheader", { name: "Path" })).toBeInTheDocument();
    expect(screen.getByText("Codex does not recognize $possible")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How to use Possible" })).toHaveAttribute("href", "/docs/how-to-use");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("documents the human and agent sides of using Possible", async () => {
    window.history.pushState({}, "", "/docs/how-to-use");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "How to use Possible", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "For the human" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What Possible does" })).toBeInTheDocument();
    expect(screen.getByText(/You do not need to manually instruct the agent through these steps/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".docs-role-summary > div")).toHaveLength(2);
    expect(container.querySelectorAll(".docs-responsibility-list")).toHaveLength(2);
    expect(container.querySelectorAll(".docs-handshake li")).toHaveLength(7);
    expect(screen.getByText(/Confirming a pack authorizes only the disclosed repo-local work/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore outcome packs/i })).toHaveAttribute("href", "/packs");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("explains who steers, coordinates, and executes without making users choose packs", async () => {
    window.history.pushState({}, "", "/blogs/why-possible");
    const { container } = render(<App />);
    expect(container.querySelector(".why-page.editorial-page .editorial-article .editorial-header .editorial-byline")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /The bottleneck is no longer what AI can do/i, level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: /In this essay/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Three roles, clearly separated/i })).toBeInTheDocument();
    expect(screen.getByText(/Possible is not a pack browser/i)).toBeInTheDocument();
    expect(container.querySelector(".why-thesis")).toHaveTextContent(/Possible recommends the pack.*You approve it/i);
    expect(screen.getByText(/This is a map for Possible, not an intake menu for the user/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See the recorded Hardware Launch outcome/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByText("npx @fraylabs/possible init", { selector: ".why-article-cta code" })).toBeInTheDocument();
    expect(container.querySelectorAll(".why-responsibility-table article")).toHaveLength(3);
    expect(container.querySelectorAll(".why-essay-lanes > div")).toHaveLength(4);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("presents four outcome-shaped benchmark protocols", async () => {
    window.history.pushState({}, "", "/benchmarks");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Measure the.*whole outcome/i, level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll(".benchmark-gallery-grid > a")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /SIMPLE-0\.1.*One simple prompt.*Useful verified work.*NO RUNS/i })).toHaveAttribute("href", "/benchmarks/simple-prompt");
    expect(screen.getByRole("link", { name: /\$1B-0\.1.*Make me a billion-dollar company.*Verified revenue.*NO RUNS/i })).toHaveAttribute("href", "/benchmarks/billion-dollar-company");
    expect(screen.getByRole("link", { name: /FUNDING-0\.1.*Get it funded.*Net funds received.*NO RUNS/i })).toHaveAttribute("href", "/benchmarks/kickstarter-funding");
    expect(screen.getByRole("link", { name: /SHIPPED-0\.1.*Get it shipped.*Days to 95% shipped.*NO RUNS/i })).toHaveAttribute("href", "/benchmarks/kickstarter-shipped");
    expect(screen.getByText(/Fixed task.*explicit metric.*reproducible protocol.*evidence-backed results.*disclosed limitations/i)).toBeInTheDocument();
    expect(container.querySelector(".benchmark-article")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("measures useful work from one simple prompt", async () => {
    window.history.pushState({}, "", "/benchmarks/simple-prompt");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "The Simple Prompt Benchmark", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/How much useful, verified work gets done from one simple prompt/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /No controlled results published/i })).toBeInTheDocument();
    expect(screen.getByText(/Build me a successful software company.*Make no mistakes/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Count useful work, not elapsed runtime/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /A score requires a receipt/i })).toBeInTheDocument();
    expect(container.querySelector(".benchmark-outcome-bars")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /All benchmarks/i })).toHaveAttribute("href", "/benchmarks");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defines company coverage without presenting it as business success", async () => {
    window.history.pushState({}, "", "/benchmarks/billion-dollar-company");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Make Me a Billion-Dollar Company.*Benchmark/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/how much verified revenue does it generate/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /No controlled results published/i })).toBeInTheDocument();
    expect(screen.getByText(/earned rubric points.*48.*100/i)).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: /Coverage evidence levels/i })).getAllByRole("listitem")).toHaveLength(5);
    expect(container.querySelectorAll(".benchmark-ingredients-grid > span")).toHaveLength(12);
    expect(screen.getByRole("heading", { name: "Verified revenue", level: 3 })).toBeInTheDocument();
    expect(container.querySelector(".benchmark-boundary")).toHaveTextContent(/Coverage never substitutes for money.*revenue record stays at \$0/i);
    expect(screen.getByRole("link", { name: /Atlassian FY2025 Form 10-K/i })).toHaveAttribute("href", expect.stringContaining("sec.gov"));
    expect(container.querySelector(".benchmark-projection")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("records Kickstarter funding through payout received", async () => {
    window.history.pushState({}, "", "/benchmarks/kickstarter-funding");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "The Kickstarter Funding Benchmark", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Record money received, not campaign theater/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Net funds received", level: 3 })).toBeInTheDocument();
    const timeline = screen.getByRole("list", { name: "Kickstarter funding benchmark milestones" });
    expect(within(timeline).getAllByRole("listitem")).toHaveLength(7);
    expect(within(timeline).getByText("Funding goal reached")).toBeInTheDocument();
    expect(within(timeline).getByText("Payout received")).toBeInTheDocument();
    expect(screen.getByText(/Unfunded campaigns remain in the cohort/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kickstarter all-or-nothing funding/i })).toHaveAttribute("href", expect.stringContaining("help.kickstarter.com"));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps Kickstarter shipping separate from funding", async () => {
    window.history.pushState({}, "", "/benchmarks/kickstarter-shipped");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "The Kickstarter-to-Shipped Benchmark", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /No controlled results published/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Start the delivery clock after funding/i })).toBeInTheDocument();
    const timeline = screen.getByRole("list", { name: "Kickstarter-to-shipped benchmark milestones" });
    expect(within(timeline).getAllByRole("listitem")).toHaveLength(6);
    expect(within(timeline).getByText("Funding goal reached")).toBeInTheDocument();
    expect(within(timeline).getByText("95% of rewards shipped")).toBeInTheDocument();
    expect(container.querySelectorAll(".benchmark-fulfillment-measures > div")).toHaveLength(4);
    expect(screen.getByText(/Delayed and unfinished campaigns remain in the cohort/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kickstarter fulfillment dashboard guidance/i })).toHaveAttribute("href", expect.stringContaining("help.kickstarter.com"));
    expect(screen.getByText(/Funding does not count as shipping/i)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders every pack route as a manifest-derived, accessible outcome specification", async () => {
    for (const pack of outcomePacks) {
      window.history.pushState({}, "", `/packs/${pack.slug}`);
      const { container } = render(<App />);
      const compiled = compilePack(pack);

      expect(screen.getByRole("heading", { name: pack.name, level: 1 })).toBeInTheDocument();
      expect(container.querySelectorAll("h1")).toHaveLength(1);
      expect(container.querySelector(".pack-hero")).not.toBeInTheDocument();
      expect(container.querySelector(".pack-start")).not.toBeInTheDocument();
      expect(container.querySelectorAll(".pack-reference-section")).toHaveLength(pack.lane === "operate" ? 9 : 8);
      expect(container.querySelector(".pack-reference-packs a[aria-current='page']")).toHaveTextContent(pack.name);
      expect(screen.getByText(pack.useWhen[0])).toBeInTheDocument();
      expect(screen.getByText(pack.notFor[0])).toBeInTheDocument();
      expect(container.querySelectorAll(".pack-contract-list li")).toHaveLength(pack.outputs.length);
      expect(container.querySelectorAll(".pack-workstream-table tbody tr")).toHaveLength(pack.workstreams.length);
      expect(container.querySelectorAll(".pack-ingredient-table tbody tr")).toHaveLength(pack.skills.length + (pack.plugins?.length ?? 0));
      expect(container.querySelectorAll(".pack-reference-list li")).toHaveLength(pack.guardrails.length);
      expect(container.querySelectorAll(".pack-verification-list li")).toHaveLength(pack.verification.length);
      expect(container.querySelectorAll(".pack-command-list > div")).toHaveLength(compiled.installCommands.length);
      expect(container.querySelector(".pack-command-list code")).toHaveTextContent(compiled.installCommands[0]);
      expect(container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compiled.runPrompt);
      expect(screen.getAllByRole("link", { name: "Compiled pack JSON ↗" })[0]).toHaveAttribute("href", `/packs/${pack.slug}.json`);
      expect(screen.getByRole("link", { name: "Download .txt ↓" })).toHaveAttribute("href", `/packs/${pack.slug}/run.txt`);
      expect(screen.getByRole("link", { name: "Install .txt ↓" })).toHaveAttribute("href", `/packs/${pack.slug}/install.txt`);
      expect(await axe(container)).toHaveNoViolations();
      cleanup();
    }
  });

  it("copies the exact compiled run prompt from a pack specification", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    window.history.pushState({}, "", "/packs/hardware-launch");
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Copy full run prompt" }));
    expect(writeText).toHaveBeenCalledWith(compilePack(outcomePacks[0]).runPrompt);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("documents OpenAI Sites as an optional plugin instead of a fake install command", () => {
    window.history.pushState({}, "", "/packs/software-launch");
    const { container } = render(<App />);
    expect(screen.getByText("OpenAI Sites")).toBeInTheDocument();
    expect(screen.getByText(/@sites · \$sites-building · \$sites-hosting/)).toBeInTheDocument();
    expect(screen.getByText(/Optional plugins such as @sites are detected in Codex/)).toBeInTheDocument();
    expect(container.querySelector(".pack-command-list")).not.toHaveTextContent("sites");
  });

  it("presents Web App Operations as a recurring operating loop", () => {
    window.history.pushState({}, "", "/packs/web-app-operations");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "Web App Operations" })).toBeInTheDocument();
    expect(container.querySelectorAll(".pack-ingredient-table tbody tr")).toHaveLength(6);
    expect(screen.getAllByText(/Executable operations check and dated health baseline/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/First dated operations receipt/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/one snapshot is a baseline, never an uptime claim/i).length).toBeGreaterThan(0);
  });

  it("explains the test-first, separately approved scheduling flow and its recurring receipts", () => {
    window.history.pushState({}, "", "/packs/web-app-operations");
    render(<App />);
    const flow = screen.getByRole("list", { name: /Scheduling flow/i });

    expect(within(flow).getByText(/Test the first cycle manually before scheduling/i)).toBeInTheDocument();
    expect(within(flow).getByText(/Show the exact task, cadence, timezone, project, prompt, and permissions/i)).toBeInTheDocument();
    expect(within(flow).getByText(/Ask for separate approval before creating or enabling/i)).toBeInTheDocument();
    expect(
      within(flow).getByText(/Each recurring run reads the latest receipt, runs one cycle, carries unresolved work forward, and writes a new dated receipt/i),
    ).toBeInTheDocument();
  });

  it("discovers pack 08 and gives both Operate packs the same safe scheduling UX", () => {
    window.history.pushState({}, "", "/packs");
    render(<App />);
    const catalog = screen.getByRole("region", { name: "All outcome packs" });
    expect(within(catalog).getByRole("link", { name: /PACK \/ 08.*Marketing Operations.*Optional schedule/is })).toHaveAttribute(
      "href",
      "/packs/marketing-operations",
    );

    for (const [slug, name, scheduleHeading, prompt, unattendedBoundary] of [
      [
        "web-app-operations",
        "Web App Operations",
        "Schedule the operating loop",
        "I want to schedule operations.",
        /never deploy, restart, page, publish, or change production unattended/i,
      ],
      [
        "marketing-operations",
        "Marketing Operations",
        "Schedule the marketing loop",
        "I want to schedule marketing operations.",
        /never publish, send, spend, contact people, change tracking or accounts, use write-capable connectors, or access unauthorized private data/i,
      ],
    ]) {
      cleanup();
      window.history.pushState({}, "", `/packs/${slug}`);
      render(<App />);

      expect(screen.getByRole("heading", { name, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: scheduleHeading, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(prompt)).toBeInTheDocument();
      const flow = screen.getByRole("list", { name: /Scheduling flow/i });
      expect(within(flow).getByText(/Test the first cycle manually before scheduling/i)).toBeInTheDocument();
      expect(within(flow).getByText(/Ask for separate approval before creating or enabling/i)).toBeInTheDocument();
      expect(within(flow).getByText(/reads the latest receipt.*carries unresolved work forward.*new dated receipt/i)).toBeInTheDocument();
      expect(screen.getByText(unattendedBoundary)).toBeInTheDocument();
      expect(screen.getAllByRole("link", { name: "Compiled pack JSON ↗" })[0]).toHaveAttribute("href", `/packs/${slug}.json`);
      expect(screen.getByRole("link", { name: "Download .txt ↓" })).toHaveAttribute("href", `/packs/${slug}/run.txt`);
    }
  });

  it("documents scheduling operations as a natural-language Possible request", () => {
    window.history.pushState({}, "", "/docs");
    render(<App />);
    expect(screen.getAllByText(/I want to schedule operations/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: /Web App Operations/i })).toHaveAttribute("href", "/packs/web-app-operations");
    expect(screen.getByText(".possible/schedule.json")).toBeInTheDocument();
    expect(screen.getByText(/does not prove the external task is still enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/do not claim a schedule exists until its external state can be inspected/i)).toBeInTheDocument();
  });

  it("returns a useful not-found page for unknown packs", () => {
    window.history.pushState({}, "", "/packs/not-real");
    render(<App />);
    expect(screen.getByRole("heading", { name: /not possible yet/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse all packs/i })).toHaveAttribute("href", "/packs");
  });

  it("shows three recorded runs and the playable game proof in the demo gallery", () => {
    window.history.pushState({}, "", "/demo");
    const { container } = render(<App />);
    expect(container.querySelector(".demo-gallery-hero")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Possible outcome demos", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /HARDWARE LAUNCH.*STILL/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("link", { name: /SOFTWARE LAUNCH.*THREE/i })).toHaveAttribute("href", "/demo/software");
    expect(screen.getByRole("link", { name: /OPEN-SOURCE RELEASE.*TINY-SLUG/i })).toHaveAttribute("href", "/demo/open-source");
    expect(screen.getByRole("link", { name: /PLAYABLE WEB GAME.*FOLD/i })).toHaveAttribute("href", "/demo/game");
  });

  it("keeps every outcome-first demo free of automated accessibility violations", async () => {
    for (const route of ["/demo/hardware", "/demo/software", "/demo/open-source", "/demo/game"]) {
      window.history.pushState({}, "", route);
      const { container, unmount } = render(<App />);
      expect(container.querySelector("main")).toHaveClass("demo-detail-page");
      expect(container.querySelector('main[class*="replay"]')).not.toBeInTheDocument();
      const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
      const conversation = screen.getByRole("region", { name: "$possible conversation" });
      const footer = container.querySelector(".demo-outcome-footer")!;
      expectBefore(artifacts, conversation);
      expectBefore(conversation, footer);
      expect(await axe(container.querySelector(".demo-outcome-header")!)).toHaveNoViolations();
      expect(await axe(conversation)).toHaveNoViolations();
      unmount();
    }
  });

  it("presents the game pack as a playable proof without calling it a clean-room run", () => {
    window.history.pushState({}, "", "/demo/game");
    render(<App />);
    expect(screen.getByRole("heading", { name: /A strange idea.*made playable/i })).toBeInTheDocument();
    expect(screen.getByText(/not presented as a clean-room pack evaluation/i)).toBeInTheDocument();
    const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
    const conversation = screen.getByRole("region", { name: "$possible conversation" });
    expectBefore(artifacts, conversation);
    expect(within(conversation).getByText("$possible")).toBeInTheDocument();
    expect(within(conversation).getByRole("link", { name: /Playable Web Game pack/i })).toHaveAttribute("href", "/packs/playable-web-game");
    expect(within(conversation).getByText("Yes, proceed.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Full Codex thread/i })).not.toBeInTheDocument();
    expect(screen.getByTitle("Fold paper plane game")).toHaveAttribute("src", "/demo/game/play");
    expect(screen.getByRole("link", { name: /PLAY FULL SCREEN/i })).toHaveAttribute("href", "/demo/game/play");
    expect(screen.getByRole("link", { name: /What review caught/i })).toHaveAttribute("href", "/demo/fold/review.md");
  });

  it("shows the Hardware Launch outcome before its short conversation and preserved thread", async () => {
    window.history.pushState({}, "", "/demo/hardware");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /A focus device.*made believable/i })).toBeInTheDocument();
    const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
    const conversation = screen.getByRole("region", { name: "$possible conversation" });
    expectBefore(artifacts, conversation);
    expect(within(artifacts).getByText("OUTPUT", { selector: ".demo-output-label strong" })).toBeInTheDocument();
    expect(within(conversation).getByText("$possible")).toBeInTheDocument();
    expect(within(conversation).getByRole("link", { name: /Hardware Launch pack/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(within(conversation).getByText(/repo-local ingredient skill installation.*External actions still require separate approval/i)).toBeInTheDocument();
    expect(within(conversation).getByText("Yes, proceed.")).toBeInTheDocument();
    expect(container.querySelector(".demo-artifacts-title")).not.toBeInTheDocument();
    expect(screen.getByTitle("Still launch website")).toHaveAttribute("src", "/demo/still/site/index.html");
    expect(screen.getByAltText("Isometric CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Rear CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Top CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Front CAD view of the Still focus device concept")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(screen.getByText(/31 exact public messages across 5 real agent threads/i)).toBeInTheDocument();
    expect(screen.getAllByText("Ampere").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Beauvoir").length).toBeGreaterThan(1);
    expect(screen.getByText(/fresh browser review has found a material integration failure/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Raw \.md/i })).toHaveAttribute("href", "/demo/still/CODEX-THREAD.md");
    await userEvent.click(screen.getByRole("button", { name: /Close full Codex thread/i }));
  });

  it("shows the real Software Launch product, site, film, evidence, and thread", async () => {
    window.history.pushState({}, "", "/demo/software");
    render(<App />);
    expect(screen.getByRole("heading", { name: /A real product.*ready to open/i })).toBeInTheDocument();
    const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
    const conversation = screen.getByRole("region", { name: "$possible conversation" });
    expectBefore(artifacts, conversation);
    expect(within(conversation).getByRole("link", { name: /Software Launch pack/i })).toHaveAttribute("href", "/packs/software-launch");
    expect(within(conversation).getByText("Yes, proceed.")).toBeInTheDocument();
    expect(screen.getByTitle("Three local-first product")).toHaveAttribute("src", "/demo/three/product/index.html");
    expect(screen.getByTitle("Three launch website")).toHaveAttribute("src", "/demo/three/site/index.html");
    expect(document.querySelector("video source")).toHaveAttribute("src", "/demo/three/film/three-demo.mp4");
    expect(screen.getByRole("link", { name: /15-test receipt/i })).toHaveAttribute("href", "/demo/three/evidence/product-test-receipt.md");
    expect(screen.getByRole("link", { name: /L0–L8 decision/i })).toHaveAttribute("href", "/demo/three/evidence/final-verification.md");
    expect(screen.getByRole("link", { name: /What review caught/i })).toHaveAttribute("href", "/demo/three/evidence/failed-review-01/README.md");
    await userEvent.click(screen.getByRole("button", { name: /Full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(screen.getByText(/exact public messages across \d+ real agent threads/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Raw \.md/i })).toHaveAttribute("href", "/demo/three/CODEX-THREAD.md");
  });

  it("shows the Open-Source Release outcome before its conversation and preserved thread", async () => {
    window.history.pushState({}, "", "/demo/open-source");
    render(<App />);
    expect(screen.getByRole("heading", { name: /A tiny package.*ready to trust/i })).toBeInTheDocument();
    const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
    const conversation = screen.getByRole("region", { name: "$possible conversation" });
    expectBefore(artifacts, conversation);
    expect(within(conversation).getByRole("link", { name: /Open-Source Release pack/i })).toHaveAttribute("href", "/packs/open-source-release");
    expect(within(conversation).getByText("Yes, proceed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /OPEN SOURCE/i })).toHaveAttribute("href", "/demo/tiny-slug/index.js");
    expect(screen.getByRole("link", { name: /OPEN OUTCOME RECEIPT/i })).toHaveAttribute("href", "/demo/tiny-slug/.possible/outcome-receipt.md");
    expect(screen.getByRole("link", { name: /Complete public run/i })).toHaveAttribute("href", "/demo/tiny-slug/CODEX-THREAD.md");
    await userEvent.click(screen.getByRole("button", { name: /Full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Raw \.md/i })).toHaveAttribute("href", "/demo/tiny-slug/CODEX-THREAD.md");
  });
});
