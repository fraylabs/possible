import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("Possible wiki", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("opens on the atlas, keeps fields as siblings, and lets search and graph select pages", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Loading Possible")).toBeInTheDocument();
    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });
    expect(window.location.pathname).toBe("/");
    expect(screen.queryByRole("button", { name: "Read page" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Start with the primary surface/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const atlas = screen.getByRole("region", { name: "Possible knowledge atlas" });
    expect(within(atlas).getByRole("button", { name: "Web, 3 pages" })).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Manufacturing, 2 pages" })).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Vite with React, Web page" })).toBeInTheDocument();
    await user.click(within(atlas).getByRole("button", { name: "Zoom in graph" }));
    expect(within(atlas).getByText(/Graph zoom 118%/)).toBeInTheDocument();
    await user.click(within(atlas).getByRole("button", { name: "Fit entire graph" }));
    expect(within(atlas).getByText(/Graph zoom 100%/)).toBeInTheDocument();
    await user.click(within(atlas).getByRole("button", { name: "Web, 3 pages" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Web" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/web");
    expect(screen.getByRole("button", { name: "Read page" })).toBeInTheDocument();
    const webGraph = screen.getByRole("region", { name: "Possible knowledge atlas" });
    expect(webGraph).toBe(atlas);
    expect(within(webGraph).getByRole("button", { name: "Manufacturing, 2 pages" })).toBeInTheDocument();
    expect(within(webGraph).getByRole("button", { name: "Custom manufactured parts, Manufacturing page" })).toBeInTheDocument();
    expect(within(webGraph).getByRole("button", { name: "Web, 3 pages" })).toHaveAttribute("aria-pressed", "true");

    const search = screen.getByRole("searchbox", { name: "Search pages" });
    await user.type(search, "vite");
    await user.click(within(screen.getByRole("listbox", { name: "Search results" })).getByRole("button", { name: /Vite with React/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/vite-react");

    const graph = screen.getByRole("region", { name: "Possible knowledge atlas" });
    expect(graph).toBe(atlas);
    expect(within(graph).getByRole("button", { name: "Vite with React, Web page" })).toHaveAttribute("aria-pressed", "true");
    const browserGraphNode = within(graph).getByRole("button", {
      name: "Browser applications, Web page",
    });
    await user.click(browserGraphNode);
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/browser-applications");
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveFocus());
  });

  it("reveals the whole universe when zoomed out and preserves that camera through selection", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });
    const atlas = screen.getByRole("region", { name: "Possible knowledge atlas" });
    const zoomOut = within(atlas).getByRole("button", { name: "Zoom out graph" });
    await user.click(zoomOut);
    await user.click(zoomOut);

    expect(within(atlas).getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Web, 3 pages" })).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Manufacturing, 2 pages" })).toBeInTheDocument();

    await user.click(within(atlas).getByRole("button", { name: "Vite with React, Web page" }));
    await screen.findByRole("heading", { level: 1, name: "Vite with React" });
    expect(screen.getByRole("region", { name: "Possible knowledge atlas" })).toBe(atlas);
    expect(within(atlas).getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
  });

  it("opens a graph page when its visible label is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });
    const atlas = screen.getByRole("region", { name: "Possible knowledge atlas" });
    await user.click(within(atlas).getByText("Vite with React"));

    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/vite-react");
  });

  it("uses a focused Read view with article links, provenance, and one way back", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/wiki/vite-react");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Vite with React" });
    expect(screen.queryByRole("link", { name: "Browser applications" })).not.toBeInTheDocument();
    const atlas = screen.getByRole("region", { name: "Possible knowledge atlas" });
    await user.click(within(atlas).getByRole("button", { name: "Zoom out graph" }));
    expect(within(atlas).getByText("Graph zoom 82%, Field view")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Read page" }));
    expect(await screen.findByRole("link", { name: "Browser applications" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Vite guide/i })).toHaveAttribute(
      "href",
      "https://vite.dev/guide/",
    );
    expect(screen.getByText(/Reviewed July 17, 2026/i)).toBeInTheDocument();
    expect(screen.queryByTestId("unsafe-html")).not.toBeInTheDocument();
    expect(screen.getByText(/<span data-testid="unsafe-html">unsafe html<\/span>/i)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Browser applications" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Sources" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/browser-applications");

    await user.click(screen.getByRole("button", { name: "Back to map" }));
    expect(await screen.findByRole("button", { name: "Read page" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Possible knowledge atlas" })).getByText("Graph zoom 82%, Field view")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/browser-applications");
  });

  it("tracks browser history without changing the active mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });
    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    await screen.findByRole("heading", { level: 1, name: "Web" });
    await user.click(screen.getByRole("button", { name: "Read page" }));
    expect(await screen.findByRole("button", { name: "Back to map" })).toBeInTheDocument();

    window.history.pushState(null, "", "/wiki/browser-applications");
    fireEvent.popState(window);
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to map" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to map" }));
    const restoredState = {
      possible: { version: 1, graphViewport: { x: 24, y: -16, scale: 0.67 } },
    };
    window.history.pushState(restoredState, "", "/wiki/vite-react");
    fireEvent.popState(window, { state: restoredState });
    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Read page" })).toBeInTheDocument();
    expect(screen.getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
  });

  it("uses the same full-page Explore and Read modes on mobile", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open article|close article/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    await screen.findByRole("heading", { level: 1, name: "Web" });
    await user.click(screen.getByRole("button", { name: "Read page" }));
    expect(await screen.findByRole("button", { name: "Back to map" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Sources" })).toBeInTheDocument();
  });

  it("supports keyboard shortcuts and has no detectable semantic accessibility violations", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" });

    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search pages" })).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "-" });
    fireEvent.keyDown(window, { key: "-" });
    expect(screen.getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "0" });
    expect(screen.getByText("Graph zoom 100%, Field view")).toBeInTheDocument();

    const exploreResults = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(exploreResults.violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    await screen.findByRole("heading", { level: 1, name: "Web" });
    await user.click(screen.getByRole("button", { name: "Read page" }));
    await screen.findByRole("button", { name: "Back to map" });
    const readResults = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(readResults.violations).toEqual([]);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(await screen.findByRole("button", { name: "Read page" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Read page" }));
    fireEvent.keyDown(window, { key: "/" });
    await waitFor(() => {
      expect(screen.getByRole("searchbox", { name: "Search pages" })).toHaveFocus();
    });
  });

  it("returns to the top-level atlas from both Explore and Read", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/wiki/web");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Web" });
    await user.click(screen.getByRole("button", { name: /possible\.sh/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");

    await user.click(screen.getByRole("button", { name: "Manufacturing, 2 pages" }));
    await user.click(screen.getByRole("button", { name: "Read page" }));
    await screen.findByRole("button", { name: "Back to map" });
    await user.click(screen.getByRole("button", { name: "Return to Possible atlas" }));
    expect(await screen.findByRole("heading", { level: 1, name: "What do you want to make possible?" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
