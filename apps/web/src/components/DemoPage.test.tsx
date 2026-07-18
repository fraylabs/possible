import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DEMO_QUERY, DemoPage, findDemoGuide } from "./DemoPage";

describe("transparent guide retrieval example", () => {
  afterEach(() => cleanup());

  it("uses a real corpus search result rather than a hard-coded guide sequence", () => {
    const guide = findDemoGuide();

    expect(DEMO_QUERY).toBe("robotic arm");
    expect(guide?.slug).toBe("robotic-arms");
    expect(guide?.sources.length).toBeGreaterThan(0);
  });

  it("separates retrieved reading from the host agent's responsibility", () => {
    render(<DemoPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Context for an agent—not a project plan." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Robotic arms/i })).toHaveAttribute("href", "/wiki/robotic-arms");
    expect(screen.getByRole("heading", { name: "Related reading, not ordered steps." })).toBeInTheDocument();
    expect(screen.getByText(/Possible supplied reading; it did not plan/i)).toBeInTheDocument();
    expect(screen.queryByText(/published guide library/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/route ready|execution workspace|sourced execution/i)).not.toBeInTheDocument();
  });
});
