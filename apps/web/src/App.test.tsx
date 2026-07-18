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
  it("turns one brief into the Hardware Launch pack", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Describe the outcome/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /Compile Hardware Launch/i }));
    expect(await screen.findByText("READY TO RUN")).toBeInTheDocument();
  });

  it("switches between three complete outcome packs", async () => {
    const { container } = render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Software Launch/i }));
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(6);
    expect(screen.getByDisplayValue("Prepare my SaaS product for launch.")).toBeInTheDocument();

    const openSourceChoices = screen.getAllByRole("button", { name: /Open-Source Release/i });
    expect(openSourceChoices).toHaveLength(1);
    await userEvent.click(openSourceChoices[0]!);
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(5);
  });

  it("copies a prompt containing the user's brief", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<App />);
    const brief = screen.getByLabelText("WHAT DO YOU WANT TO SHIP?");
    await userEvent.clear(brief);
    await userEvent.type(brief, "Launch my desk robot for remote design teams.");
    await userEvent.click(screen.getByRole("button", { name: /Copy compiled prompt/i }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]?.[0]).toMatch(/Launch my desk robot for remote design teams/);
    expect(writeText.mock.calls[0]?.[0]).toMatch(/CAPTAIN WORKFLOW/);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows every outcome in the packs catalog", () => {
    window.history.pushState({}, "", "/packs");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Outcome gallery/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Software Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open-Source Release" })).toBeInTheDocument();
  });

  it("turns each pack into a complete, personalized detail page", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    window.history.pushState({}, "", "/packs/hardware-launch");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Parallel specialists/i })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(5);

    const brief = screen.getByLabelText("YOUR PRODUCT BRIEF");
    await userEvent.clear(brief);
    await userEvent.type(brief, "Launch a pocket synth for first-time musicians.");
    await userEvent.click(screen.getByRole("button", { name: /Copy compiled prompt/i }));
    expect(writeText.mock.calls[0]?.[0]).toMatch(/Launch a pocket synth for first-time musicians/);
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
    expect(screen.getByRole("heading", { name: /Watch the outcome/i })).toBeInTheDocument();
    expect(screen.getByText("RECORDED REAL RUN")).toBeInTheDocument();
    expect(screen.getByText("Brief locked", { selector: ".replay-controls strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Show output/i })[0]).toHaveAttribute("href", "#artifacts");
    expect(screen.getByRole("heading", { name: /One prompt.*Real outputs/i })).toBeInTheDocument();
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
