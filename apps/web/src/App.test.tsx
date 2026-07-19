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

describe("Possible", () => {
  it("starts with one clear question, three real outcomes, and an immediate install path", () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "What do you want to build today?", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText("Bring an idea or a live app. Possible gives Codex the skills, plan, and proof to build it, ship it, or keep it running.")).toBeInTheDocument();
    expect(screen.getByText("npx @fraylabs/possible init")).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".install-next code" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("href", "/docs");
    const starters = screen.getByRole("list", { name: /Choose a starting point/i });
    expect(within(starters).getAllByRole("listitem")).toHaveLength(3);
    for (const [title, demoHref] of [
      ["A strange 3D game", "/demo/game"],
      ["A hardware product", "/demo/hardware"],
      ["A software launch", "/demo/software"],
    ]) {
      expect(within(starters).getByRole("heading", { name: title })).toBeInTheDocument();
      expect(within(starters).getByRole("link", { name: `See ${title} demo` })).toHaveAttribute("href", demoHref);
      expect(within(starters).getByRole("link", { name: `Try ${title} with Codex` })).toHaveAttribute("href", "#try");
    }
    expect(container.querySelector(".journey")).not.toBeInTheDocument();
    expect(container.querySelector(".recommendation-example")).not.toBeInTheDocument();
    expect(container.querySelector(".home-pack-preview")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Filter outcome packs by lane/i })).not.toBeInTheDocument();
    expect(container.querySelectorAll(".quick-path li")).toHaveLength(3);
    expect(container.querySelector("main")).not.toHaveTextContent(/conversational outcome compiler|outcome lanes|ingredient skills|pack knowledge|workstreams/i);
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

  it("makes scheduling operations discoverable from the homepage and pack gallery", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /Schedule operations/i })).toHaveAttribute("href", "/packs/web-app-operations");

    cleanup();
    window.history.pushState({}, "", "/packs");
    render(<App />);
    const catalog = screen.getByRole("region", { name: "All outcome packs" });
    expect(within(catalog).getByRole("link", { name: /Web App Operations.*Schedule operations/is })).toHaveAttribute(
      "href",
      "/packs/web-app-operations",
    );
  });

  it("filters the packs catalog by occupied outcome lane", async () => {
    window.history.pushState({}, "", "/packs");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Complete recipes.*Chosen through conversation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start with Possible/i })).toHaveAttribute("href", "/#start");
    expect(screen.getByRole("button", { name: "All, 7 packs" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Playable Web Game" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Web App Operations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Working Web App" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Production Web Release" })).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole("button", { name: "Operate, 1 pack" }));
    expect(screen.getByRole("heading", { name: "Web App Operations" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Open-Source Release" })).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 Operate pack.")).toBeInTheDocument();
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
    expect(container.querySelectorAll(".docs-article > section")).toHaveLength(10);
    expect(screen.getByRole("link", { name: /EXAMPLE PACKHardware LaunchView recipe/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(screen.getByText(/WHAT.*YES.*AUTHORIZES/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment, scheduling changes, publishing, spending, outreach, fabrication/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /complete recorded Hardware Launch run/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("columnheader", { name: "Path" })).toBeInTheDocument();
    expect(screen.getByText("Codex does not recognize $possible")).toBeInTheDocument();
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
      expect(container.querySelectorAll(".pack-reference-section")).toHaveLength(pack.slug === "web-app-operations" ? 9 : 8);
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
    render(<App />);
    expect(screen.getByRole("heading", { name: /Don’t imagine the outcome.*Open it/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HARDWARE LAUNCH.*STILL/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("link", { name: /SOFTWARE LAUNCH.*THREE/i })).toHaveAttribute("href", "/demo/software");
    expect(screen.getByRole("link", { name: /OPEN-SOURCE RELEASE.*TINY-SLUG/i })).toHaveAttribute("href", "/demo/open-source");
    expect(screen.getByRole("link", { name: /PLAYABLE WEB GAME.*FOLD/i })).toHaveAttribute("href", "/demo/game");
  });

  it("presents the game pack as a playable proof without calling it a clean-room run", () => {
    window.history.pushState({}, "", "/demo/game");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Before the build.*find the fun/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /After the yes.*make it playable/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Playable Web Game pack/i })[0]).toHaveAttribute("href", "/packs/playable-web-game");
    expect(screen.getByText("LIVE PACK PROOF")).toBeInTheDocument();
    expect(screen.getByText(/not presented as a clean-room pack evaluation/i)).toBeInTheDocument();
    expect(screen.getByTitle("Fold paper plane game")).toHaveAttribute("src", "/demo/game/play");
    expect(screen.getByRole("link", { name: /PLAY FULL SCREEN/i })).toHaveAttribute("href", "/demo/game/play");
    expect(screen.getByRole("link", { name: /What review caught/i })).toHaveAttribute("href", "/demo/fold/review.md");
  });

  it("replays the real Hardware Launch run from brief to verified outcome", async () => {
    window.history.pushState({}, "", "/demo/hardware");
    render(<App />);
    expect(screen.getByRole("heading", { name: /After the yes/i })).toBeInTheDocument();
    expect(screen.getByText("CURRENT ENTRY FLOW / ILLUSTRATIVE INTAKE")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hardware Launch pack/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(screen.getByText(/repo-local ingredient skill installation.*External actions still require separate approval/i)).toBeInTheDocument();
    expect(screen.getByText("Yes, proceed.", { selector: ".demo-intake-confirm span" })).toBeInTheDocument();
    expect(screen.getByText("RECORDED REAL RUN")).toBeInTheDocument();
    expect(screen.getByText("Brief locked", { selector: ".replay-controls strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Show output/i })[0]).toHaveAttribute("href", "#artifacts");
    expect(screen.getByRole("heading", { name: /One conversation.*Real outputs/i })).toBeInTheDocument();
    expect(screen.getByTitle("Still launch website")).toHaveAttribute("src", "/demo/still/site/");
    expect(screen.getByAltText("Isometric CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Rear CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Top CAD view of the Still focus device concept")).toBeInTheDocument();
    expect(screen.getByAltText("Front CAD view of the Still focus device concept")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /View full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(screen.getByText(/31 exact public messages across 5 real agent threads/i)).toBeInTheDocument();
    expect(screen.getAllByText("Ampere").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Beauvoir").length).toBeGreaterThan(1);
    expect(screen.getByText(/fresh browser review has found a material integration failure/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Raw \.md/i })).toHaveAttribute("href", "/demo/still/CODEX-THREAD.md");
    await userEvent.click(screen.getByRole("button", { name: /Close full Codex thread/i }));

    const next = screen.getByRole("button", { name: "Next event" });
    for (let index = 0; index < 6; index += 1) await userEvent.click(next);

    expect(screen.getByRole("heading", { name: /Real outputs.*Real review/i })).toBeInTheDocument();
    expect(screen.getByText("58 / 58", { selector: ".replay-review-card strong" })).toBeInTheDocument();
    expect(screen.getByText("0", { selector: ".replay-review-card strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Show output/i })[0]).toHaveAttribute("href", "#artifacts");
  });

  it("shows the real Software Launch product, site, film, evidence, and thread", async () => {
    window.history.pushState({}, "", "/demo/software");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Before the build.*define launched/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /After the yes.*watch the launch take shape/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Software Launch pack/i })).toHaveAttribute("href", "/packs/software-launch");
    expect(screen.getByText("Brief locked", { selector: ".replay-controls strong" })).toBeInTheDocument();
    expect(screen.getByTitle("Three local-first product")).toHaveAttribute("src", "/demo/three/product/");
    expect(screen.getByTitle("Three launch website")).toHaveAttribute("src", "/demo/three/site/");
    expect(document.querySelector("video source")).toHaveAttribute("src", "/demo/three/film/three-demo.mp4");
    expect(screen.getByRole("link", { name: /15-test receipt/i })).toHaveAttribute("href", "/demo/three/evidence/product-test-receipt.md");
    expect(screen.getByRole("link", { name: /L0–L8 decision/i })).toHaveAttribute("href", "/demo/three/evidence/final-verification.md");
    expect(screen.getByRole("link", { name: /What review caught/i })).toHaveAttribute("href", "/demo/three/evidence/failed-review-01/README.md");
    await userEvent.click(screen.getByRole("button", { name: /View full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(screen.getByText(/exact public messages across \d+ real agent threads/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Raw \.md/i })).toHaveAttribute("href", "/demo/three/CODEX-THREAD.md");
  });

  it("shows the real Open-Source Release repository and review evidence", () => {
    window.history.pushState({}, "", "/demo/open-source");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Before the release.*define trust/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /After the yes.*watch the release harden/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open-Source Release pack/i })).toHaveAttribute("href", "/packs/open-source-release");
    expect(screen.getByText("Brief locked", { selector: ".replay-controls strong" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /OPEN SOURCE/i })).toHaveAttribute("href", "/demo/tiny-slug/index.js");
    expect(screen.getByRole("link", { name: /OPEN OUTCOME RECEIPT/i })).toHaveAttribute("href", "/demo/tiny-slug/.possible/outcome-receipt.md");
    expect(screen.getByRole("link", { name: /Complete public run/i })).toHaveAttribute("href", "/demo/tiny-slug/CODEX-THREAD.md");
  });
});
