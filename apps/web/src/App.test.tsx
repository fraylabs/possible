import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compilePack, publicCatalog } from "@possible/packs";
import App from "./App";
import { getPublishedPack, getRoutablePack, installCommand, packHref, publishedPacks, routablePacks } from "./public-content";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

function renderRoute(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

const exampleContracts = [
  { slug: "still", name: "Still", title: "Still", preserved: true, featured: 3, total: 15, secondId: "product-film", evidence: true },
  { slug: "robot-snake", name: "Robot Snake", title: "Robot Snake", preserved: true, featured: 5, total: 20, secondId: "urdf", evidence: true },
  { slug: "fold", name: "Fold", title: "Fold", preserved: false, featured: 1, total: 1, secondId: null, evidence: true },
  { slug: "web-presentation", name: "Web Presentation", title: "Possible", preserved: false, featured: 2, total: 2, secondId: "visual-atlas", evidence: false },
  { slug: "patchproof", name: "PatchProof", title: "PatchProof", preserved: true, featured: 3, total: 6, secondId: "launch-site", evidence: true },
] as const;

describe("Possible", () => {
  it("presents a focused install hero", async () => {
    const { container } = render(<App />);

    expect(screen.getByRole("heading", { name: /Complete a possible\s*outcome\./, level: 1 })).toBeInTheDocument();
    expect(container.querySelector(".build-hero-description")).toHaveTextContent(/Possible\.sh is an open-source library of Outcome Packs.*dozens of coordinated tasks/i);
    expect(screen.getByText(installCommand)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Star on GitHub ↗" })).toHaveAttribute("href", "https://github.com/fraylabs/possible");

    const navigation = Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent);
    expect(navigation).toEqual(["EXAMPLES", "DOCS", "GITHUB ↗"]);

    expect(container.querySelectorAll("main > section")).toHaveLength(3);
    expect(container.querySelector(".home-workflow")).not.toBeInTheDocument();
    expect(container.querySelector(".home-demo")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /There’s a whole world\s*inside Codex\./, level: 2 })).toBeInTheDocument();
    const launchFilm = container.querySelector(".home-film-player video") as HTMLVideoElement;
    expect(launchFilm).not.toHaveAttribute("src");
    expect(launchFilm.autoplay).toBe(true);
    expect(launchFilm.loop).toBe(true);
    expect(launchFilm.muted).toBe(true);
    expect(container.querySelector(".home-film-player source")).toHaveAttribute("src", "/possible-launch-film.mp4");
    expect(screen.getByRole("link", { name: /Motion film pack/i })).toHaveAttribute("href", "/packs/html-css-animated-product-launch-film");
    expect(screen.getByRole("link", { name: /Soundtrack pack/i })).toHaveAttribute("href", "/packs/original-strudel-soundtrack");
    expect(container.querySelector(".home-pack-gallery")).toBeInTheDocument();
    expect(container.querySelector(".home-source")).not.toBeInTheDocument();

    expect(container.querySelector("main")).not.toHaveTextContent(/50[–-]100|RECORDED OUTCOMES \/|BENCHMARK|Direct.*\/goal|schedule operations/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens the compact mobile navigation and closes it with Escape", async () => {
    const { container } = render(<App />);
    const trigger = screen.getByRole("button", { name: "MENU" });
    await userEvent.click(trigger);
    const sidebar = screen.getByRole("dialog", { name: "Mobile navigation" });
    expect(within(sidebar).getAllByRole("link")).toHaveLength(3);
    expect(within(sidebar).getByRole("link", { name: "GITHUB" })).toHaveAttribute("href", "https://github.com/fraylabs/possible");
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("copies the canonical published installer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Copy install command/i }));
    expect(writeText).toHaveBeenCalledWith("npx @fraylabs/possible@0.1.11 init");
  });

  it("shows the complete public Outcome Pack catalog on the homepage", async () => {
    const { container } = render(<App />);
    const gallery = screen.getByRole("region", { name: /Choose the work\.Make it real\./i });
    const grid = gallery.querySelector(".home-pack-gallery-grid")!;
    expect(routablePacks).toHaveLength(publicCatalog.length);
    expect(within(grid).getAllByRole("link")).toHaveLength(routablePacks.length);
    for (const pack of routablePacks) expect(within(grid).getByRole("heading", { name: pack.name, level: 3 })).toBeInTheDocument();
    expect(grid.querySelectorAll(".pack-card-preview")).toHaveLength(routablePacks.length);
    expect(container).toHaveTextContent(/Choose the work\.Make it real\./i);
    expect(container).not.toHaveTextContent(/text-first library|EXPERIMENTAL OUTCOME PACK/i);
    expect(container).toHaveTextContent(/Hardware Launch|Open-Source Release|Marketing Operations/i);
    expect(container).toHaveTextContent(/HTML\/CSS Animated Product Launch Film/i);
    expect(container).toHaveTextContent(/Original Instrumental Soundtrack with Editable Strudel Source and WAV Master/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("retires the standalone /packs catalog route", async () => {
    const { container } = renderRoute("/packs");
    expect(screen.getByRole("heading", { name: /This outcome isnot here/i })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Choose the work|Reviewed Outcome Packs/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders every active public catalog snapshot at its canonical route", async () => {
    for (const pack of publishedPacks) {
      const { container, unmount } = renderRoute(packHref(pack));
      expect(screen.getByRole("heading", { name: pack.name, level: 1 })).toBeInTheDocument();
      expect(container.querySelector(".pack-reference-summary")).toHaveTextContent(pack.summary);
      expect(screen.getByRole("heading", { name: "Outputs", level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Expectations", level: 2 })).toBeInTheDocument();
      if (pack.lifecycle === "draft") {
        expect(container.querySelectorAll(".pack-reference-section")).toHaveLength(7);
        expect(screen.getByRole("complementary", { name: "Listed Outcome Pack" })).toBeInTheDocument();
        expect(container.querySelector(".pack-prompt-disclosure")).not.toBeInTheDocument();
      } else {
        expect(container.querySelectorAll(".pack-reference-section")).toHaveLength(9);
        expect(container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compilePack(pack).runPrompt);
      }
      expect(container.querySelector("main")).not.toHaveTextContent(/SCHEDULABLE|OPTIONAL SCHEDULE|Schedule the/i);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });

  it("publishes discovery and customer outcomes as reviewed Packs", async () => {
    for (const slug of ["software-opportunity-discovery", "first-customer-sprint"]) {
      const pack = getPublishedPack(slug);
      expect(pack).toBeDefined();
      const { container, unmount } = renderRoute(`/packs/${slug}`);
      expect(screen.getByRole("heading", { name: pack!.name, level: 1 })).toBeInTheDocument();
      expect(container.querySelector(".pack-experimental-notice")).not.toBeInTheDocument();
      expect(container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compilePack(pack!).runPrompt);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });

  it("preserves the archived developer, robot, and fulfillment pages without offering obsolete runs", async () => {
    for (const slug of ["developer-project-launch", "robot-prototype", "kickstarter-fulfillment"]) {
      const pack = getRoutablePack(slug);
      expect(pack?.archived).toBeDefined();
      const route = renderRoute(`/packs/${slug}`);
      expect(screen.getByRole("heading", { name: pack!.name, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("complementary", { name: "Archived Outcome Pack" })).toHaveTextContent(/ARCHIVED.*2026-07-29/i);
      expect(screen.queryByRole("link", { name: /Start with \$possible/i })).not.toBeInTheDocument();
      expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compilePack(pack!).runPrompt);
      expect(await axe(route.container)).toHaveNoViolations();
      route.unmount();
    }
  });

  it("preserves the archived Hardware Launch page without offering a new run", async () => {
    const pack = getRoutablePack("hardware-launch");
    expect(pack?.archived).toBeDefined();
    const { container } = renderRoute("/packs/hardware-launch");
    const notice = screen.getByRole("complementary", { name: "Archived Outcome Pack" });
    expect(notice).toHaveTextContent(/ARCHIVED.*2026-07-27/i);
    expect(notice).toHaveTextContent(/will not recommend or compile it for new work/i);
    expect(within(notice).getByRole("link", { name: "Mechanical CAD Review" })).toHaveAttribute("href", "/packs/mechanical-cad-review");
    expect(screen.queryByRole("link", { name: /Start with \$possible/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View active packs/i })).toHaveAttribute("href", "/#packs");
    expect(container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compilePack(pack!).runPrompt);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("preserves the archived Working Hardware Prototype page on the standard contract", async () => {
    const pack = getRoutablePack("working-hardware-prototype");
    expect(pack?.archived).toBeDefined();
    const route = renderRoute("/packs/working-hardware-prototype");
    expect(screen.getByRole("heading", { name: "Working Hardware Prototype", level: 1 })).toBeInTheDocument();
    const notice = screen.getByRole("complementary", { name: "Archived Outcome Pack" });
    expect(notice).toHaveTextContent(/ARCHIVED.*2026-07-27/i);
    expect(notice).toHaveTextContent(/seven fixed workstreams/i);
    expect(within(notice).getByRole("link", { name: "Functional Hardware Prototype" })).toHaveAttribute("href", "/packs/functional-hardware-prototype");
    expect(screen.queryByRole("link", { name: /Start with \$possible/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Expectations", level: 2 })).toBeInTheDocument();
    expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).toMatch(/EXPECTATIONS CHECKLIST/);
    expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).not.toMatch(/MEASURED HARDWARE PROTOTYPE GATE|PHYSICAL REMIX GATE/);
    expect(await axe(route.container)).toHaveNoViolations();
  });

  it("preserves the archived Launch Content Campaign page on the standard contract", async () => {
    const pack = getRoutablePack("launch-content-campaign");
    expect(pack?.archived).toBeDefined();
    const route = renderRoute("/packs/launch-content-campaign");
    expect(screen.getByRole("heading", { name: "Launch Content Campaign", level: 1 })).toBeInTheDocument();
    const notice = screen.getByRole("complementary", { name: "Archived Outcome Pack" });
    expect(notice).toHaveTextContent(/ARCHIVED.*2026-07-27/i);
    expect(notice).toHaveTextContent(/five workstreams.*three creative directions/i);
    expect(within(notice).getByRole("link", { name: "Launch Content Package" })).toHaveAttribute("href", "/packs/launch-content-package");
    expect(within(notice).getByRole("link", { name: "Marketing Operations" })).toHaveAttribute("href", "/packs/marketing-operations");
    expect(screen.queryByRole("link", { name: /Start with \$possible/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Expectations", level: 2 })).toBeInTheDocument();
    expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).toMatch(/\$humanizer/);
    expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).not.toMatch(/PRODUCT DECISION RECORD|REMIX GATE/);
    expect(await axe(route.container)).toHaveNoViolations();
  });

  it("preserves the archived Kickstarter Funding page without offering a live run", async () => {
    const pack = getRoutablePack("kickstarter-funding");
    expect(pack?.archived).toBeDefined();
    const route = renderRoute("/packs/kickstarter-funding");
    expect(screen.getByRole("heading", { name: "Kickstarter Funding", level: 1 })).toBeInTheDocument();
    const notice = screen.getByRole("complementary", { name: "Archived Outcome Pack" });
    expect(notice).toHaveTextContent(/ARCHIVED.*2026-07-29/i);
    expect(notice).toHaveTextContent(/prototype and manufacturing feasibility.*deposited payout/i);
    expect(within(notice).getByRole("link", { name: "Crowdfunding Campaign Readiness" })).toHaveAttribute("href", "/packs/crowdfunding-campaign-readiness");
    expect(within(notice).getByRole("link", { name: "Launch Content Package" })).toHaveAttribute("href", "/packs/launch-content-package");
    expect(screen.queryByRole("link", { name: /Start with \$possible/i })).not.toBeInTheDocument();
    expect(route.container.querySelector(".pack-prompt-disclosure code")?.textContent).toMatch(/deposited platform payout/i);
    expect(await axe(route.container)).toHaveNoViolations();
  });

  it("separates opportunity discovery from the resumable first-customer sprint", async () => {
    const discoveryRoute = renderRoute("/packs/software-opportunity-discovery");
    expect(screen.getByRole("heading", { name: "Software Opportunity Discovery", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Expectations", level: 2 })).toBeInTheDocument();
    expect(discoveryRoute.container.querySelector(".pack-prompt-disclosure code")?.textContent).toMatch(/EXPECTATIONS CHECKLIST/);
    expect(discoveryRoute.container.querySelector(".pack-prompt-disclosure code")?.textContent).not.toMatch(/OPPORTUNITY DISCOVERY GATE|FIRST CUSTOMER SPRINT/);
    expect(await axe(discoveryRoute.container)).toHaveNoViolations();
    discoveryRoute.unmount();

    const sprintRoute = renderRoute("/packs/first-customer-sprint");
    expect(screen.getByRole("heading", { name: "First Customer Sprint", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Expectations", level: 2 })).toBeInTheDocument();
    expect(sprintRoute.container.querySelector(".pack-prompt-disclosure code")?.textContent).toMatch(/EXPECTATIONS CHECKLIST/);
    expect(sprintRoute.container.querySelector(".pack-prompt-disclosure code")?.textContent).not.toMatch(/FIRST CUSTOMER SPRINT|RESUMABLE SALES CYCLE/);
    expect(await axe(sprintRoute.container)).toHaveNoViolations();
  });

  it("keeps the primary documentation focused on first use", async () => {
    const { container } = renderRoute("/docs");
    expect(screen.getByText(installCommand, { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What happens next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy page" })).toBeInTheDocument();
    expect(container.querySelector('.docs-context-nav a.is-active[href="/docs"]')).toBeInTheDocument();
    expect(container.querySelector("#next")).toHaveTextContent(/clarify the outcome.*recommend one contract.*wait for your yes/i);
    expect(screen.getByRole("link", { name: /Read the complete workflow/i })).toHaveAttribute("href", "/docs/how-to-use");
    expect(container.querySelector(".docs-glossary")).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Hardware Launch|Outcome Journey|The artifact is not the proof/i);
    expect(container.querySelector("main")).not.toHaveTextContent(/schedule operations|recurring outcome|\.possible\/schedule\.json/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("explains how /goal and Possible work together in the usage guide", async () => {
    const { container } = renderRoute("/docs/how-to-use");
    const section = container.querySelector("#goal-and-possible");
    expect(section).toBeInTheDocument();
    expect(container.querySelector('a[href="#goal-and-possible"]')).toBeInTheDocument();
    expect(section).toHaveTextContent(/\/goal.*(?:pursuit|persist|adapt)/i);
    expect(section).toHaveTextContent(/Possible.*(?:controlled outcome|reviewed contract)/i);
    expect(section).toHaveTextContent(/contract.*(?:workstreams|safeguards|interfaces|evidence|definition of done)/i);
    expect(section).toHaveTextContent(/together|combine|both/i);
    expect(await axe(section!)).toHaveNoViolations();
  });

  it("explains presentation variations and retrospective Outcome Journeys without predeclaring the future", async () => {
    const { container } = renderRoute("/docs/how-to-use");
    const section = container.querySelector("#presentation-and-journey");
    expect(section).toHaveTextContent(/Presentation variation changes the expression/i);
    expect(section).toHaveTextContent(/small set of project-specific directions/i);
    expect(section).toHaveTextContent(/not in a separate pack contract/i);
    expect(section).toHaveTextContent(/Outcome Journey.*visible only afterward/i);
    expect(section).toHaveTextContent(/completes and verifies one outcome.*inspects the new reality.*recommends one next outcome.*fresh approval/i);
    expect(section).toHaveTextContent(/never fixes the future sequence in advance/i);
    expect(container.querySelector('a[href="#remix-and-journey"]')).not.toBeInTheDocument();
    expect(await axe(section!)).toHaveNoViolations();
  });

  it("gives docs a persistent multi-page sidebar and a mobile browse menu", async () => {
    const pages = [
      ["/docs", /Build complete outcomes with Possible/i, "overview"],
      ["/docs/how-to-use", /How to use Possible/i, "how-to-use"],
      ["/docs/outcome-packs", /Choose a complete outcome/i, "outcome-packs"],
      ["/docs/expectations", /The artifact is not the proof/i, "expectations"],
      ["/docs/authoring", /Write the contract in JSON/i, "authoring"],
      ["/docs/reference", /Keep the run inspectable/i, "reference"],
      ["/docs/glossary", /The language of complete outcomes/i, "glossary"],
    ] as const;

    for (const [path, heading, active] of pages) {
      const { container, unmount } = renderRoute(path);
      expect(screen.getByRole("heading", { name: heading, level: 1 })).toBeInTheDocument();
      const sidebar = container.querySelector(".docs-sidebar");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar?.querySelector(".docs-mobile-menu")).toBeInTheDocument();
      expect(sidebar?.querySelector(`a.is-active[href*="${active === "overview" ? "/docs" : active}"]`)).toBeInTheDocument();
      expect(container.querySelector(`.docs-context-nav a.is-active[href="${path}"]`)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Copy page" })).toBeInTheDocument();
      expect(Array.from(sidebar?.querySelectorAll("a") ?? []).every((link) => !link.getAttribute("href")?.includes("#"))).toBe(true);
      for (const href of ["/docs/outcome-packs", "/docs/expectations", "/docs/authoring", "/docs/reference"]) {
        expect(sidebar?.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
      }
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });

  it("makes every authoring field's demand explicit", async () => {
    const { container } = renderRoute("/docs/authoring");
    const fields = container.querySelector("#fields");
    expect(fields).toBeInTheDocument();
    expect(fields).toHaveTextContent(/promise.*observable result/i);
    expect(fields).toHaveTextContent(/summary.*run stops.*description/i);
    expect(fields).toHaveTextContent(/expectations.*failure modes.*required evidence/i);
    expect(fields).toHaveTextContent(/outputs.*not.*proof/i);
    expect(await axe(fields!)).toHaveNoViolations();
  });

  it("maps the four official judging criteria to direct evidence", async () => {
    const { container } = renderRoute("/judging");
    expect(screen.getByRole("heading", { name: /One rough idea\.\s*A verified outcome\./, level: 1 })).toBeInTheDocument();

    const criteria = screen.getByRole("table", { name: /four official judging criteria/i });
    for (const name of ["Technological Implementation", "Design", "Potential Impact", "Quality of the Idea"]) {
      expect(within(criteria).getByRole("rowheader", { name })).toBeInTheDocument();
    }
    expect(within(criteria).getByRole("link", { name: /Compiler source/i })).toHaveAttribute("href", "https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts");
    expect(within(criteria).getByRole("link", { name: /Example gallery/i })).toHaveAttribute("href", "/examples");
    expect(within(criteria).getByRole("link", { name: /Robot Snake report/i })).toHaveAttribute("href", "https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md");
    expect(container.querySelector("main")).not.toHaveTextContent(/wrapper|Why this is not/i);
    expect(container.querySelector(".nav-links")).not.toHaveTextContent(/JUDGING/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("makes the recorded /goal comparison and its protocol directly inspectable", () => {
    const { container } = renderRoute("/judging");
    const main = container.querySelector("main");
    expect(main).toHaveTextContent(/recorded.*\/goal|\/goal.*(?:comparison|control)/i);
    expect(main).toHaveTextContent(/\/goal.*(?:pursuit|persist|adapt)/i);
    expect(main).toHaveTextContent(/Possible.*(?:reviewed|controlled).*outcome contract/i);
    expect(main).toHaveTextContent(/18.*CAD.*(?:robot descriptions|URDF).*MuJoCo/i);
    for (const href of [
      "/demo/robot-snake/CONTROL-RUN.md",
      "/demo/robot-snake/control/",
      "/demo/robot-snake/manifest.json",
      "/demo/robot-snake/evidence/outcome-receipt.md",
    ]) expect(main?.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
  });

  it("publishes the Robot Snake control as a comparison rather than a Possible output", async () => {
    const { container } = renderRoute("/comparisons/robot-snake");
    expect(screen.getByRole("heading", { name: /Same rough request\.\s*Different starting knowledge\./i, level: 1 })).toBeInTheDocument();
    expect(container.querySelector("main")).toHaveTextContent("/goal I want to make a robot snake");
    expect(screen.getByRole("table", { name: /pre-existing Robot Prototype Outcome Pack contract/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /OPEN \/GOAL OUTPUT/i })).toHaveAttribute("href", "/demo/robot-snake/control/");
    expect(screen.getByRole("link", { name: /INSPECT MANIFEST/i })).toHaveAttribute("href", "/demo/robot-snake/manifest.json");
    expect(screen.getByText(/Possible defines what complete means/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Controlled outcome\.\s*Dynamic pursuit\./i })).toHaveTextContent(/\/goal sustains the pursuit/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows Still progressing from intake through a passing fresh rerun", () => {
    renderRoute("/judging");
    const trail = screen.getByRole("region", { name: /One outcome,\s*end to end/i });
    expect(within(trail).getAllByRole("listitem")).toHaveLength(5);
    expect(trail).toHaveTextContent(/INTAKE.*COMPILE.*FAIL.*REPAIR.*PASS/i);
    expect(within(trail).getByRole("link", { name: /Failed trace/i })).toHaveAttribute("href", "/demo/still/verification/browser-results-initial-failure.json");
    expect(within(trail).getByRole("link", { name: /Completion receipt/i })).toHaveAttribute("href", "/demo/still/OUTCOME-RECEIPT.md");
  });

  it("renders exactly five finished-outcome cards at /examples", async () => {
    const { container } = renderRoute("/examples");
    const gallery = screen.getByRole("region", { name: "Possible examples" });
    const cards = within(gallery).getAllByRole("link");
    expect(cards).toHaveLength(exampleContracts.length);
    expect(new Set(cards.map((card) => card.textContent?.trim())).size).toBe(exampleContracts.length);

    for (const example of exampleContracts) {
      expect(within(gallery).getByRole("link", { name: new RegExp(example.name, "i") })).toHaveAttribute("href", `/examples/${example.slug}`);
    }

    expect(container).not.toHaveTextContent(/Tiny Slug|Open-Source Release/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps outputs and process in one scalable example modal", async () => {
    const titles = new Set<string>();

    for (const example of exampleContracts) {
      const { container, unmount } = renderRoute(`/examples/${example.slug}`);
      const dialog = screen.getByRole("dialog", { name: new RegExp(example.title, "i") });
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const title = within(dialog).getByRole("heading", { name: new RegExp(example.title, "i") }).textContent?.trim() ?? "";
      titles.add(title);

      const outputsTab = within(dialog).getByRole("tab", { name: "OUTPUTS" });
      const processTab = within(dialog).getByRole("tab", { name: "PROCESS" });
      expect(outputsTab).toHaveAttribute("aria-selected", "true");
      expect(processTab).toHaveAttribute("aria-selected", "false");

      const description = within(dialog).getByRole("region", { name: "Description" });
      const descriptionWords = description.textContent?.trim().split(/\s+/).filter(Boolean).length ?? 0;
      expect(descriptionWords).toBeGreaterThan(0);
      expect(descriptionWords).toBeLessThanOrEqual(60);

      expect(within(dialog).getByRole("region", { name: "Outcome Pack" })).not.toBeEmptyDOMElement();
      const outputs = within(dialog).getByRole("region", { name: "Output carousel" });
      const previous = within(outputs).getByRole("button", { name: "Previous output" });
      const next = within(outputs).getByRole("button", { name: "Next output" });
      expect(previous).toHaveTextContent("<");
      expect(next).toHaveTextContent(">");
      expect(outputs).toHaveTextContent(`01 / ${String(example.featured).padStart(2, "0")}`);
      const initialOutputHref = within(outputs).getByRole("link").getAttribute("href");
      expect(initialOutputHref).toMatch(/^\//);
      await userEvent.click(next);
      if (example.secondId) {
        expect(outputs).toHaveTextContent(`02 / ${String(example.featured).padStart(2, "0")}`);
        expect(within(outputs).getByRole("link").getAttribute("href")).toMatch(/^\//);
        expect(within(outputs).getByRole("link").getAttribute("href")).not.toBe(initialOutputHref);
        expect(window.location.search).toBe(`?output=${example.secondId}`);
      } else {
        expect(outputs).toHaveTextContent("01 / 01");
        expect(window.location.search).toBe("");
      }

      const inventory = within(dialog).getByText(/VIEW ALL OUTPUTS/i).closest("details");
      expect(inventory).not.toHaveAttribute("open");
      expect(inventory).toHaveTextContent(`${example.featured} FEATURED / ${example.total} TOTAL`);
      await userEvent.click(within(inventory as HTMLElement).getByText(/VIEW ALL OUTPUTS/i));
      const inventoryLinks = within(inventory as HTMLElement).getAllByRole("link");
      expect(inventoryLinks).toHaveLength(example.total);
      expect(new Set(inventoryLinks.map((link) => link.getAttribute("href"))).size).toBe(example.total);
      expect(inventory).not.toHaveTextContent(/Outcome brief|Completion receipt|Repair log/i);
      if (example.slug === "robot-snake") {
        expect(inventory.querySelector('a[href^="/demo/robot-snake/control/"]')).not.toBeInTheDocument();
        expect(inventory).toHaveTextContent(/URDF robot description|SRDF planning model|Locomotion replay|Rerun telemetry/i);
      }

      expect(within(dialog).queryByRole("link", { name: /Open outcome/i })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole("link", { name: /See how Possible made this/i })).not.toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Close example" })).toBeInTheDocument();

      await userEvent.click(processTab);
      expect(processTab).toHaveAttribute("aria-selected", "true");
      expect(outputsTab).toHaveAttribute("aria-selected", "false");
      expect(window.location.search).toBe("?view=process");
      expect(within(dialog).queryByRole("region", { name: "Output carousel" })).not.toBeInTheDocument();

      const process = within(dialog).getByRole("tabpanel", { name: "PROCESS" });
      const processSections = ["You asked", "Possible added", "Verification caught", "Final outcome"];
      for (const name of processSections) {
        expect(within(process).getByRole("region", { name })).not.toBeEmptyDOMElement();
      }
      expect(process.querySelector('a[href^="/packs/"]')).not.toBeInTheDocument();
      const verification = within(process).getByRole("region", { name: "Verification caught" });
      if (example.preserved) {
        expect(verification).toHaveTextContent(/fail/i);
        expect(verification).toHaveTextContent(/repair/i);
        expect(verification).toHaveTextContent(/pass/i);
      } else {
        expect(verification).toHaveTextContent(/not preserved|reference/i);
      }

      const evidenceDisclosure = process.querySelector(".example-process-evidence");
      if (example.evidence) {
        expect(evidenceDisclosure).not.toHaveAttribute("open");
        await userEvent.click(within(evidenceDisclosure as HTMLElement).getByText(/Inspect supporting evidence/i));
        const evidenceLinks = within(evidenceDisclosure as HTMLElement).getAllByRole("link");
        expect(evidenceLinks.length).toBeGreaterThan(0);
        expect(evidenceLinks.length).toBeLessThanOrEqual(3);
        expect(new Set(evidenceLinks.map((link) => link.getAttribute("href"))).size).toBe(evidenceLinks.length);
      } else {
        expect(evidenceDisclosure).not.toBeInTheDocument();
      }

      await userEvent.click(outputsTab);
      expect(outputsTab).toHaveAttribute("aria-selected", "true");
      expect(new URLSearchParams(window.location.search).has("view")).toBe(false);
      expect(within(dialog).getByRole("region", { name: "Output carousel" })).toBeInTheDocument();

      for (const frame of container.querySelectorAll("iframe")) frame.remove();
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }

    expect(titles.size).toBe(exampleContracts.length);
  });

  it("confines modal focus, then dismisses with Escape and returns to the canonical gallery URL", async () => {
    const { container } = renderRoute("/examples/patchproof");
    const dialog = screen.getByRole("dialog", { name: "PatchProof" });
    const close = within(dialog).getByRole("button", { name: "Close example" });
    const inventorySummary = within(dialog).getByText(/VIEW ALL OUTPUTS/i).closest("summary");
    const background = container.querySelector(".examples-background");

    expect(close).toHaveFocus();
    expect(background).toHaveAttribute("inert");
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(inventorySummary).toHaveFocus();
    await userEvent.keyboard("{Tab}");
    expect(close).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "PatchProof" })).not.toBeInTheDocument();
    expect(window.location.pathname).toBe("/examples");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(background).not.toHaveAttribute("inert");
    expect(background).not.toHaveAttribute("aria-hidden");
    await waitFor(() => expect(screen.getByRole("link", { name: /Open Outcome Journey: PatchProof example/i })).toHaveFocus());
  });

  it("uses PatchProof to explain why future outcomes are recommended one at a time", () => {
    renderRoute("/examples/patchproof?view=process");
    const process = screen.getByRole("tabpanel", { name: "PROCESS" });
    expect(process).toHaveTextContent(/predeclared path.*discovery learned.*user validation.*next risk/i);
    expect(process).toHaveTextContent(/demand.*willingness to pay.*user validation unresolved/i);
    expect(process).toHaveTextContent(/went straight to a browser product.*validation as the next outcome/i);
    expect(process).toHaveTextContent(/OUTCOME JOURNEY \/ RETROSPECTIVE/i);
  });

  it("opens a shareable process query in the same example modal", async () => {
    const { container } = renderRoute("/examples/robot-snake?view=process");
    const dialog = screen.getByRole("dialog", { name: "Robot Snake" });
    const processTab = within(dialog).getByRole("tab", { name: "PROCESS" });
    await waitFor(() => expect(processTab).toHaveAttribute("aria-selected", "true"));
    expect(within(dialog).getByRole("tabpanel", { name: "PROCESS" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("region", { name: "Output carousel" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Compare with \/goal/i })).toHaveAttribute("href", "/comparisons/robot-snake");
    expect(container.querySelector(".demo-template, .demo-index-page")).not.toBeInTheDocument();
  });

  it("deep-links featured outputs by stable id and keeps arrow keys scoped to the carousel", async () => {
    renderRoute("/examples/robot-snake?output=urdf");
    const dialog = screen.getByRole("dialog", { name: "Robot Snake" });
    const carousel = within(dialog).getByRole("region", { name: "Output carousel" });
    await waitFor(() => expect(carousel).toHaveTextContent("URDF robot description"));
    expect(carousel).toHaveTextContent("02 / 05");

    carousel.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(carousel).toHaveTextContent("Locomotion replay");
    expect(window.location.search).toBe("?output=locomotion-replay");

    const processTab = within(dialog).getByRole("tab", { name: "PROCESS" });
    processTab.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(within(dialog).getByRole("tab", { name: "OUTPUTS" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(processTab).toHaveAttribute("aria-selected", "true");
    expect(window.location.search).toBe("?view=process");
  });
});
