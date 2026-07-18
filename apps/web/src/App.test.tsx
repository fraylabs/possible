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
    expect(screen.getByText("npx @fraylabs/possible init")).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".install-next code" })).toBeInTheDocument();
    expect(screen.getByText("What would you like to make possible today?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Compile Hardware Launch/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DOCS" })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("heading", { name: /No forms.*No pack knowledge required/i })).toBeInTheDocument();
    expect(container.querySelectorAll(".journey li")).toHaveLength(6);
    expect([...container.querySelectorAll(".journey li strong")].map((node) => node.textContent)).toEqual([
      "Install", "Invoke", "Brainstorm", "Recommend", "Confirm", "Execute",
    ]);
    expect(screen.getByText(/No ingredient skills install and no outcome work starts/i)).toBeInTheDocument();
    expect(screen.getByText(/Saying yes authorizes repo-local ingredient skill installation/i)).toBeInTheDocument();
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

  it("shows every outcome in the packs catalog", () => {
    window.history.pushState({}, "", "/packs");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Complete recipes.*Chosen through conversation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start with Possible/i })).toHaveAttribute("href", "/#start");
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
  });

  it("documents the complete conversation-first journey and its safety boundary", async () => {
    window.history.pushState({}, "", "/docs");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Build complete outcomes with Possible/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /Documentation navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /On this page/i })).toBeInTheDocument();
    expect(screen.getByText("npx @fraylabs/possible init", { selector: ".docs-command code" })).toBeInTheDocument();
    expect(screen.getByText("$possible", { selector: ".docs-command--invoke code" })).toBeInTheDocument();
    expect(container.querySelectorAll(".docs-article > section")).toHaveLength(9);
    expect(screen.getByRole("link", { name: /EXAMPLE PACKHardware LaunchView recipe/i })).toHaveAttribute("href", "/packs/hardware-launch");
    expect(screen.getByText(/WHAT.*YES.*AUTHORIZES/i)).toBeInTheDocument();
    expect(screen.getByText(/Deployment, publishing, spending, outreach, fabrication/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /complete recorded Hardware Launch run/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("columnheader", { name: "Path" })).toBeInTheDocument();
    expect(screen.getByText("Codex does not recognize $possible")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
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

  it("shows all three recorded runs in the demo gallery", () => {
    window.history.pushState({}, "", "/demo");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Don’t imagine the outcome.*Open it/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HARDWARE LAUNCH.*STILL/i })).toHaveAttribute("href", "/demo/hardware");
    expect(screen.getByRole("link", { name: /SOFTWARE LAUNCH.*THREE/i })).toHaveAttribute("href", "/demo/software");
    expect(screen.getByRole("link", { name: /OPEN-SOURCE RELEASE.*TINY-SLUG/i })).toHaveAttribute("href", "/demo/open-source");
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
    expect(screen.getByRole("heading", { name: /An empty repo became.*a complete launch/i })).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: /Three files became.*a release people can trust/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /OPEN SOURCE/i })).toHaveAttribute("href", "/demo/tiny-slug/index.js");
    expect(screen.getByRole("link", { name: /OPEN OUTCOME RECEIPT/i })).toHaveAttribute("href", "/demo/tiny-slug/.possible/outcome-receipt.md");
    expect(screen.getByRole("link", { name: /Complete public run/i })).toHaveAttribute("href", "/demo/tiny-slug/CODEX-THREAD.md");
  });
});
