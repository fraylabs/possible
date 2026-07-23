import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compilePack } from "@possible/packs";
import App from "./App";
import { getPublishedPack, installCommand, publishedPacks } from "./public-content";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

function renderRoute(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

function expectBefore(first: Element, second: Element) {
  expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
}

const exampleContracts = [
  { slug: "still", name: "Still", title: "Still" },
  { slug: "robot-snake", name: "Robot Snake", title: "Robot Snake" },
  { slug: "fold", name: "Fold", title: "Fold" },
  { slug: "web-presentation", name: "Web Presentation", title: "Possible" },
  { slug: "patchproof", name: "PatchProof", title: "PatchProof" },
] as const;

const demoContracts = [
  { slug: "still", name: "Still", aliases: ["hardware"], preserved: true },
  { slug: "robot-snake", name: "Robot Snake", aliases: [], preserved: true },
  { slug: "fold", name: "Fold", aliases: ["game"], preserved: false },
  { slug: "web-presentation", name: "Possible", aliases: ["presentation"], preserved: false },
  { slug: "patchproof", name: "PatchProof", aliases: [], preserved: true },
] as const;

const demoSectionNames = [
  "Original request",
  "$possible conversation",
  "Recommended Outcome Pack",
  "Compiled workstreams",
  "Outcome artifacts",
  "Verification, repair, and pass",
  "Evidence",
] as const;

describe("Possible", () => {
  it("presents one judge journey around four outcomes", async () => {
    const { container } = render(<App />);

    expect(screen.getByRole("heading", { name: /Complete a possible\s*outcome\./, level: 1 })).toBeInTheDocument();
    expect(container.querySelector(".build-hero-description")).toHaveTextContent(/Possible\.sh is an open-source library of Outcome Packs.*dozens of coordinated tasks/i);
    expect(screen.getByText(installCommand)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Star on GitHub ↗" })).toHaveAttribute("href", "https://github.com/fraylabs/possible");

    const navigation = Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent);
    expect(navigation).toEqual(["EXAMPLES", "DOCS", "GITHUB ↗"]);

    const workflow = screen.getByRole("region", { name: /Bring the ambition.*Possible supplies the missing work/i });
    expect(within(workflow).getAllByRole("listitem")).toHaveLength(4);
    expect(workflow).toHaveTextContent(/DESCRIBE.*APPROVE.*EXECUTE.*VERIFY/i);

    const demos = screen.getByRole("region", { name: /Finished outcomes.*Open one/i });
    expect(within(demos).getAllByRole("listitem")).toHaveLength(4);
    for (const [name, href] of ([
      ["Still", "/examples/still"],
      ["Robot Snake", "/examples/robot-snake"],
      ["Fold", "/examples/fold"],
      ["Web Presentation", "/examples/web-presentation"],
    ] as const)) expect(within(demos).getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);

    const packs = screen.getByRole("list", { name: "Outcome Packs Possible can recommend" });
    expect(within(packs).getAllByRole("listitem")).toHaveLength(publishedPacks.length);
    for (const pack of publishedPacks) expect(within(packs).getByRole("link", { name: new RegExp(pack.name) })).toHaveAttribute("href", `/packs/${pack.slug}`);

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
    expect(writeText).toHaveBeenCalledWith("npx @fraylabs/possible@0.1.10 init");
  });

  it("paginates every reviewed public Outcome Pack in one catalog", async () => {
    const { container } = renderRoute("/packs");
    const firstPage = screen.getByRole("region", { name: "Outcome Packs page 1 of 2" });
    expect(within(firstPage).getAllByRole("link")).toHaveLength(4);
    for (const pack of publishedPacks.slice(0, 4)) expect(within(firstPage).getByRole("heading", { name: pack.name })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "02" }));
    const secondPage = screen.getByRole("region", { name: "Outcome Packs page 2 of 2" });
    expect(within(secondPage).getAllByRole("link")).toHaveLength(2);
    for (const pack of publishedPacks.slice(4)) expect(within(secondPage).getByRole("heading", { name: pack.name })).toBeInTheDocument();
    expect(window.location.search).toBe("?page=2");
    expect(screen.queryByText(/EXPERIMENTAL OUTCOME PACK/i)).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Software Launch|Open-Source Release|Marketing Operations|Billion-Dollar SaaS/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders each reviewed public pack from its typed manifest", async () => {
    for (const pack of publishedPacks) {
      const { container, unmount } = renderRoute(`/packs/${pack.slug}`);
      const compiled = compilePack(pack);
      expect(screen.getByRole("heading", { name: pack.name, level: 1 })).toBeInTheDocument();
      expect(container.querySelectorAll(".pack-reference-section")).toHaveLength(8);
      expect(container.querySelector(".pack-prompt-disclosure code")?.textContent).toBe(compiled.runPrompt);
      expect(container.querySelector("main")).not.toHaveTextContent(/SCHEDULABLE|OPTIONAL SCHEDULE|Schedule the/i);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });

  it("publishes discovery and developer launch as reviewed Outcome Packs", async () => {
    for (const slug of ["software-opportunity-discovery", "developer-project-launch"]) {
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

  it("keeps retired pack routes out of the public product", () => {
    renderRoute("/packs/software-launch");
    expect(screen.getByRole("heading", { name: /This outcome is\s*not here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse the demos/i })).toHaveAttribute("href", "/demo");
  });

  it("keeps the primary documentation focused on first use", async () => {
    const { container } = renderRoute("/docs");
    expect(screen.getByText(installCommand, { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Glossary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /complete recorded Hardware Launch run/i })).toHaveAttribute("href", "/demo/still");
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

  it("explains Remix and Outcome Chains without treating them as one approval", async () => {
    const { container } = renderRoute("/docs/how-to-use");
    const section = container.querySelector("#remix-and-chain");
    expect(section).toHaveTextContent(/Remix changes the expression/i);
    expect(section).toHaveTextContent(/three project-specific creative directions/i);
    expect(section).toHaveTextContent(/Software Opportunity Discovery.*Working Web App.*Developer Project Launch/i);
    expect(section).toHaveTextContent(/NOW \/ IF THIS PASSES \/ LATER/i);
    expect(section).toHaveTextContent(/separate approval/i);
    expect(await axe(section!)).toHaveNoViolations();
  });

  it("maps the four official judging criteria to direct evidence", async () => {
    const { container } = renderRoute("/judging");
    expect(screen.getByRole("heading", { name: /One rough idea\.\s*A verified outcome\./, level: 1 })).toBeInTheDocument();

    const criteria = screen.getByRole("table", { name: /four official judging criteria/i });
    for (const name of ["Technological Implementation", "Design", "Potential Impact", "Quality of the Idea"]) {
      expect(within(criteria).getByRole("rowheader", { name })).toBeInTheDocument();
    }
    expect(within(criteria).getByRole("link", { name: /Compiler source/i })).toHaveAttribute("href", "https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts");
    expect(within(criteria).getByRole("link", { name: /Demo gallery/i })).toHaveAttribute("href", "/demo");
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

    expect(container).not.toHaveTextContent(/Tiny Slug|Software Launch|Open-Source Release/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps /demo as the process index for the same five outcomes", () => {
    renderRoute("/demo");
    const index = screen.getByRole("region", { name: "Possible demo records" });
    const links = within(index).getAllByRole("link");
    expect(links).toHaveLength(demoContracts.length);
    for (const demo of demoContracts) {
      expect(within(index).getByRole("link", { name: new RegExp(demo.name, "i") })).toHaveAttribute("href", `/demo/${demo.slug}`);
    }
  });

  it("keeps every example modal focused on the finished outcome, not the run record", async () => {
    const titles = new Set<string>();

    for (const example of exampleContracts) {
      const { container, unmount } = renderRoute(`/examples/${example.slug}`);
      const dialog = screen.getByRole("dialog", { name: new RegExp(example.title, "i") });
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const title = within(dialog).getByRole("heading", { name: new RegExp(example.title, "i") }).textContent?.trim() ?? "";
      titles.add(title);

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
      expect(outputs).toHaveTextContent(/01\s*\/\s*0[2-9]/);
      const initialOutputHref = within(outputs).getByRole("link").getAttribute("href");
      expect(initialOutputHref).toMatch(/^\//);
      await userEvent.click(next);
      expect(outputs).toHaveTextContent(/02\s*\/\s*0[2-9]/);
      expect(within(outputs).getByRole("link").getAttribute("href")).toMatch(/^\//);
      expect(within(outputs).getByRole("link").getAttribute("href")).not.toBe(initialOutputHref);

      const evidence = within(dialog).getByRole("link", { name: /See how Possible made this/i });
      expect(within(dialog).queryByRole("link", { name: /Open outcome/i })).not.toBeInTheDocument();
      expect(evidence).toHaveAttribute("href", `/demo/${example.slug}`);
      expect(within(dialog).getByRole("link", { name: /Close|Back to examples/i })).toHaveAttribute("href", "/examples");

      for (const name of demoSectionNames) {
        expect(within(dialog).queryByRole("region", { name })).not.toBeInTheDocument();
      }
      for (const term of [/conversation/i, /workstreams?/i, /verifiers?/i, /receipts?/i]) {
        expect(within(dialog).queryByRole("link", { name: term })).not.toBeInTheDocument();
        expect(within(dialog).queryByRole("heading", { name: term })).not.toBeInTheDocument();
      }
      expect(container.querySelector(".demo-record-page, .chain-example-page")).not.toBeInTheDocument();
      for (const frame of container.querySelectorAll("iframe")) frame.remove();
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }

    expect(titles.size).toBe(exampleContracts.length);
  });

  it("confines modal focus, then dismisses with Escape and returns to the canonical gallery URL", async () => {
    const { container } = renderRoute("/examples/patchproof");
    const dialog = screen.getByRole("dialog", { name: "PatchProof" });
    const close = within(dialog).getByRole("link", { name: "Close example" });
    const evidence = within(dialog).getByRole("link", { name: /See how Possible made this/i });
    const background = container.querySelector(".examples-background");

    expect(close).toHaveFocus();
    expect(background).toHaveAttribute("inert");
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(evidence).toHaveFocus();
    await userEvent.keyboard("{Tab}");
    expect(close).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "PatchProof" })).not.toBeInTheDocument();
    expect(window.location.pathname).toBe("/examples");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(background).not.toHaveAttribute("inert");
    expect(background).not.toHaveAttribute("aria-hidden");
  });

  it("uses one ordered run-record contract for all five canonical demos", async () => {
    const templateMarkers = new Set<string>();

    for (const demo of demoContracts) {
      const { container, unmount } = renderRoute(`/demo/${demo.slug}`);
      const main = container.querySelector("main");
      expect(main).toHaveAttribute("data-demo-template");
      templateMarkers.add(main?.getAttribute("data-demo-template") ?? "");
      expect(container.querySelector(".demo-template-hero img, .demo-template-playable")).not.toBeInTheDocument();
      expect(main).not.toHaveTextContent(/How .* was made/i);
      expect(main).not.toHaveTextContent(/Open outcome/i);
      const sectionIndex = screen.getByRole("complementary", { name: "Process record sections" });
      expect(within(sectionIndex).getAllByRole("link")).toHaveLength(demoSectionNames.length);

      const sections = demoSectionNames.map((name) => screen.getByRole("region", { name }));
      for (const section of sections) expect(section).not.toBeEmptyDOMElement();
      for (let index = 1; index < sections.length; index += 1) expectBefore(sections[index - 1]!, sections[index]!);

      const pack = sections[2]!;
      const packLinks = within(pack).getAllByRole("link");
      expect(packLinks.length).toBeGreaterThan(0);
      for (const link of packLinks) expect(link.getAttribute("href")).toMatch(/^\/packs\/[^/]+$/);
      expect(within(sections[3]!).getAllByRole("listitem").length).toBeGreaterThan(0);
      expect(within(sections[5]!).getAllByRole("listitem").length).toBeGreaterThan(0);
      if (demo.preserved) {
        expect(sections[5]).toHaveTextContent(/fail/i);
        expect(sections[5]).toHaveTextContent(/repair/i);
        expect(sections[5]).toHaveTextContent(/pass/i);
      } else {
        expect(sections[5]).toHaveTextContent(/reference|not preserved/i);
      }
      expect(within(sections[6]!).getAllByRole("link").length).toBeGreaterThan(0);
      expect(await axe(main!)).toHaveNoViolations();
      unmount();
    }

    expect(templateMarkers.size).toBe(1);
    expect([...templateMarkers][0]).not.toBe("");
  });

  it("keeps the legacy demo URLs compatible with their canonical run records", async () => {
    for (const demo of demoContracts) {
      for (const alias of demo.aliases) {
        const { container, unmount } = renderRoute(`/demo/${alias}`);
        expect(container.querySelector("main")).toHaveAttribute("data-demo-template");
        expect(screen.getByRole("heading", { name: new RegExp(demo.name, "i"), level: 1 })).toBeInTheDocument();
        for (const name of demoSectionNames) expect(screen.getByRole("region", { name })).not.toBeEmptyDOMElement();
        unmount();
      }
    }
  });
});
