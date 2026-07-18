import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(cleanup);

describe("Possible", () => {
  it("turns one brief into the Hardware Launch pack", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Describe the outcome/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hardware Launch" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ingredient-list a")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /Compile Hardware Launch/i }));
    expect(await screen.findByText("READY TO RUN")).toBeInTheDocument();
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
});
