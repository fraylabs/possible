import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

describe("Possible", () => {
  it("starts with installation and a brainstorm instead of a pack picker", () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Bring the idea.*Possible finds the path/i })).toBeInTheDocument();
    expect(screen.getByText("npx @possible/cli init")).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".install-next code" })).toBeInTheDocument();
    expect(screen.getByText("What would you like to make possible today?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Compile Hardware Launch/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("heading", { name: /Discover what is possible.*Learn how it's possible.*Make it possible/i })).toBeInTheDocument();
    expect(container.querySelectorAll(".journey li")).toHaveLength(3);
    expect([...container.querySelectorAll(".journey li strong")].map((node) => node.textContent)).toEqual([
      "Discover what is possible", "Learn how it’s possible", "Make it possible",
    ]);
    expect(screen.getByText(/Saying yes authorizes repo-local ingredient skill installation/i)).toBeInTheDocument();
  });

  it("copies the one-command installer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Copy install command/i }));
    expect(writeText).toHaveBeenCalledWith("npx @possible/cli init");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows every outcome in the packs catalog", () => {
    window.history.pushState({}, "", "/packs");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Complete recipes.*Chosen through conversation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start with Possible/i })).toHaveAttribute("href", "/#start");
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
  });

  it("documents the complete conversation-first journey and its safety boundary", () => {
    window.history.pushState({}, "", "/docs");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Start with an idea.*Not a configuration/i })).toBeInTheDocument();
    expect(screen.getByText("npx @possible/cli init", { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".docs-command--invoke code" })).toBeInTheDocument();
    expect(container.querySelectorAll(".docs-principles li")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Hardware Launch/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(screen.getByText(/WHAT YES AUTHORIZES/i)).toBeInTheDocument();
    expect(screen.getByText(/never authorizes deployment, publishing, purchases/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch a complete recorded run/i })).toHaveAttribute("href", "/demo");
  });

  it("presents each pack as a transparent recommendation, not a starting form", () => {
    window.history.pushState({}, "", "/packs/hardware-launch");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Parallel specialists/i })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(5);

    expect(screen.getByRole("heading", { name: /Possible recommends it.*You approve it/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Start with \$possible/i })[0]).toHaveAttribute("href", "/#start");
    expect(screen.getByText(/WHAT YES AUTHORIZES/i)).toBeInTheDocument();
    expect(screen.getByText(/External actions still require separate approval/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("YOUR PRODUCT BRIEF")).not.toBeInTheDocument();
  });

  it("returns a useful not-found page for unknown packs", () => {
    window.history.pushState({}, "", "/packs/not-real");
    render(<App />);
    expect(screen.getByRole("heading", { name: /not possible yet/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse the three packs/i })).toHaveAttribute("href", "/packs");
  });

  it("replays the real Hardware Launch run from brief to verified outcome", async () => {
    window.history.pushState({}, "", "/demo");
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
});
