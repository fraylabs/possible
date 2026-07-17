import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const installMatchMedia = (width: number) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width: 960px") ? width <= 960 : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("Possible wiki", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    installMatchMedia(1280);
    window.history.replaceState(null, "", "/");
  });

  it("loads the shared wiki, redirects root, and lets search and graph select pages", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Loading Possible")).toBeInTheDocument();
    await screen.findByRole("heading", { level: 1, name: "Web" });
    expect(window.location.pathname).toBe("/wiki/web");

    const search = screen.getByRole("searchbox", { name: "Search pages" });
    await user.type(search, "vite");
    await user.click(screen.getByRole("button", { name: /Vite with React/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/vite-react");

    const graph = screen.getByRole("region", { name: "Related page graph" });
    const browserGraphNode = within(graph).getByRole("button", { name: /Browser applications, linked both ways/i });
    await user.click(browserGraphNode);
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/browser-applications");
  });

  it("uses article links for the same selection action and keeps raw HTML inert", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/wiki/vite-react");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Vite with React" });
    expect(screen.queryByTestId("unsafe-html")).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Browser applications" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/browser-applications");
  });

  it("tracks browser history and exposes a mobile article sheet", async () => {
    const user = userEvent.setup();
    installMatchMedia(390);
    render(<App />);

    const dialog = await screen.findByRole("dialog", { name: "Web" });
    await user.click(within(dialog).getByRole("button", { name: "Close article" }));
    expect(screen.queryByRole("dialog", { name: "Web" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open article" }));
    expect(await screen.findByRole("dialog", { name: "Web" })).toBeInTheDocument();

    window.history.pushState(null, "", "/wiki/browser-applications");
    fireEvent.popState(window);
    expect(await screen.findByRole("dialog", { name: "Browser applications" })).toBeInTheDocument();
  });

  it("focuses search with slash and has no detectable semantic accessibility violations", async () => {
    render(<App />);
    await screen.findByRole("heading", { level: 1, name: "Web" });

    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search pages" })).toHaveFocus();

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
