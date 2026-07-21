import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compilePack } from "@possible/packs";
import App from "./App";
import { featuredPacks, installCommand } from "./public-content";

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

describe("Possible", () => {
  it("presents one judge journey around four outcomes", async () => {
    const { container } = render(<App />);

    expect(screen.getByRole("heading", { name: /Complete a possible\s*outcome\./, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Possible gives Codex the workstreams, safeguards and verification needed.*dozens of coordinated tasks/i)).toBeInTheDocument();
    expect(screen.getByText(installCommand)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Star on GitHub ↗" })).toHaveAttribute("href", "https://github.com/fraylabs/possible");

    const navigation = Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent);
    expect(navigation).toEqual(["DEMO", "DOCS", "GITHUB ↗"]);

    const workflow = screen.getByRole("region", { name: /Bring the ambition.*Possible supplies the missing work/i });
    expect(within(workflow).getAllByRole("listitem")).toHaveLength(4);
    expect(workflow).toHaveTextContent(/DESCRIBE.*APPROVE.*EXECUTE.*VERIFY/i);

    const demos = screen.getByRole("region", { name: /See the conversation.*Inspect the result/i });
    expect(within(demos).getAllByRole("listitem")).toHaveLength(4);
    for (const [name, href] of [
      ["Still", "/demo/hardware"],
      ["Robot Snake", "/demo/robot-snake"],
      ["Fold", "/demo/game"],
      ["Possible", "/demo/presentation"],
    ]) expect(within(demos).getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);

    const packs = screen.getByRole("list", { name: "Outcome Packs Possible can recommend" });
    expect(within(packs).getAllByRole("listitem")).toHaveLength(4);
    for (const pack of featuredPacks) expect(within(packs).getByRole("link", { name: new RegExp(pack.name) })).toHaveAttribute("href", `/packs/${pack.slug}`);

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
    expect(writeText).toHaveBeenCalledWith("npx @fraylabs/possible@0.1.8 init");
  });

  it("exposes only the four featured Outcome Packs", async () => {
    const { container } = renderRoute("/packs");
    const catalog = screen.getByRole("region", { name: "Featured Outcome Packs" });
    expect(within(catalog).getAllByRole("link")).toHaveLength(4);
    for (const pack of featuredPacks) expect(within(catalog).getByRole("heading", { name: pack.name })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Software Launch|Open-Source Release|Marketing Operations|Billion-Dollar SaaS/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders each featured pack from its typed manifest", async () => {
    for (const pack of featuredPacks) {
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

  it("keeps retired pack routes out of the public product", () => {
    renderRoute("/packs/software-launch");
    expect(screen.getByRole("heading", { name: /This outcome is\s*not here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse the demos/i })).toHaveAttribute("href", "/demo");
  });

  it("keeps the primary documentation focused on first use", async () => {
    const { container } = renderRoute("/docs");
    expect(screen.getByText(installCommand, { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Glossary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /complete recorded Hardware Launch run/i })).toHaveAttribute("href", "/demo/hardware");
    expect(container.querySelector("main")).not.toHaveTextContent(/schedule operations|recurring outcome|\.possible\/schedule\.json/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows exactly four demos", async () => {
    const { container } = renderRoute("/demo");
    const gallery = container.querySelector(".demo-gallery-grid")!;
    expect(within(gallery).getAllByRole("link")).toHaveLength(4);
    for (const href of ["/demo/hardware", "/demo/robot-snake", "/demo/game", "/demo/presentation"]) {
      expect(gallery.querySelector(`a[href='${href}']`)).toBeInTheDocument();
    }
    expect(container).not.toHaveTextContent(/Tiny Slug|Software Launch|Open-Source Release/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses the same output-then-conversation structure for every outcome", async () => {
    for (const path of ["/demo/hardware", "/demo/robot-snake", "/demo/game", "/demo/presentation"]) {
      const { container, unmount } = renderRoute(path);
      const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
      const conversation = screen.getByRole("region", { name: "$possible conversation" });
      expectBefore(artifacts, conversation);
      expectBefore(conversation, container.querySelector(".demo-outcome-footer")!);
      expect(await axe(container.querySelector(".demo-outcome-header")!)).toHaveNoViolations();
      unmount();
    }
  });

  it("preserves the Still verification and repair evidence", async () => {
    const { container } = renderRoute("/demo/hardware");
    const artifacts = screen.getByRole("region", { name: "Outcome artifacts" });
    expect(within(artifacts).getByText(/fresh verification-only agent before declaring completion/i)).toBeInTheDocument();
    expect(within(artifacts).getByText(/four 404s caused by the embedded site/i)).toBeInTheDocument();
    expect(within(artifacts).getByText(/fresh rerun passed 50\/50 browser responses/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Full Codex thread/i }));
    expect(screen.getByRole("dialog", { name: /full Codex thread/i })).toBeInTheDocument();
    expect(container).toHaveTextContent(/fresh browser review has found a material integration failure/i);
  });
});
