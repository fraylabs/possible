import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("Possible field guides", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("explains how Possible works without entering the graph", () => {
    window.history.replaceState(null, "", "/how-it-works");
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Learn what the work involves." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Atlas" })).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: /See (an example|guide retrieval)/i })).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 2, name: "For agents" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/\b(?:public|published)\b/i);
    expect(screen.queryByRole("region", { name: "Possible field guide atlas" })).not.toBeInTheDocument();
  });

  it("shows transparent robotic-arm guide retrieval without claiming a project workflow", () => {
    window.history.replaceState(null, "", "/demo");
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Context for an agent—not a project plan." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Robotic arms/i })).toHaveAttribute("href", "/wiki/robotic-arms");
    expect(screen.getByRole("heading", { name: "Related reading, not ordered steps." })).toBeInTheDocument();
    expect(screen.getByText(/Possible supplied reading; it did not plan/i)).toBeInTheDocument();
    expect(screen.queryByText(/route ready|sourced execution|execution workspace/i)).not.toBeInTheDocument();
  });

  it("opens on the atlas, keeps fields as siblings, and lets search and graph select pages", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Loading Possible")).toBeInTheDocument();
    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });
    expect(window.location.pathname).toBe("/");
    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Start with the primary surface/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const atlas = screen.getByRole("region", { name: "Possible field guide atlas" });
    expect(atlas.querySelector("canvas.three-graph")).not.toBeInTheDocument();
    expect(atlas.querySelector("svg.graph-lines")).toHaveAttribute("width", "100%");
    expect(atlas.querySelector("svg.graph-lines")).toHaveAttribute("height", "100%");
    expect(atlas.querySelectorAll("svg.graph-lines line")).toHaveLength(7);
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
    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
    const webGraph = screen.getByRole("region", { name: "Possible field guide atlas" });
    expect(webGraph).toBe(atlas);
    expect(within(webGraph).getByRole("complementary", { name: "Related guides" })).toBeInTheDocument();
    expect(within(webGraph).getByText("Related guides")).toBeInTheDocument();
    expect(within(webGraph).getByRole("button", { name: "Manufacturing, 2 pages" })).toBeInTheDocument();
    expect(within(webGraph).getByRole("button", { name: "Custom manufactured parts, Manufacturing page" })).toBeInTheDocument();
    expect(within(webGraph).getByRole("button", { name: "Web, 3 pages" })).toHaveAttribute("aria-pressed", "true");

    const search = screen.getByRole("searchbox", { name: "Search field guides" });
    await user.type(search, "vite");
    await user.click(within(screen.getByRole("listbox", { name: "Search results" })).getByRole("button", { name: /Vite with React/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/vite-react");

    const graph = screen.getByRole("region", { name: "Possible field guide atlas" });
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

  it("reveals the whole universe, then focuses the selected page", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });
    const atlas = screen.getByRole("region", { name: "Possible field guide atlas" });
    const zoomOut = within(atlas).getByRole("button", { name: "Zoom out graph" });
    await user.click(zoomOut);
    await user.click(zoomOut);

    expect(within(atlas).getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Web, 3 pages" })).toBeInTheDocument();
    expect(within(atlas).getByRole("button", { name: "Manufacturing, 2 pages" })).toBeInTheDocument();

    await user.click(within(atlas).getByRole("button", { name: "Vite with React, Web page" }));
    await screen.findByRole("heading", { level: 1, name: "Vite with React" });
    expect(screen.getByRole("region", { name: "Possible field guide atlas" })).toBe(atlas);
    expect(within(atlas).getByText("Graph zoom 150%, Page detail")).toBeInTheDocument();
    expect(within(atlas).getByText("Use > to read the guide · Esc clears focus")).toBeInTheDocument();
  });

  it("opens a graph page when its visible label is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });
    const atlas = screen.getByRole("region", { name: "Possible field guide atlas" });
    await user.click(within(atlas).getByText("Vite with React"));

    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/wiki/vite-react");
  });

  it("expands the selected page inside the left sidebar", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/wiki/vite-react");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Vite with React" });
    const atlas = screen.getByRole("region", { name: "Possible field guide atlas" });
    await user.click(within(atlas).getByRole("button", { name: "Zoom out graph" }));
    expect(within(atlas).getByText("Graph zoom 82%, Field view")).toBeInTheDocument();

    const sidebar = screen.getByRole("region", { name: "Vite with React" });
    await user.click(within(sidebar).getByRole("button", { name: "Expand field guide in sidebar" }));
    expect(within(sidebar).getByRole("button", { name: "Collapse field guide in sidebar" })).toBeInTheDocument();
    expect(within(sidebar).getByText(/A lightweight setup for client-rendered applications/i)).toBeInTheDocument();
    expect(within(atlas).getByRole("complementary", { name: "Related guides" })).toBeInTheDocument();
    expect(within(atlas).queryByRole("button", { name: "Expand page card" })).not.toBeInTheDocument();
    expect(within(atlas).getByText("Graph zoom 82%, Field view")).toBeInTheDocument();
  });

  it("tracks browser history without changing the active mode", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });
    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    await screen.findByRole("heading", { level: 1, name: "Web" });

    window.history.pushState(null, "", "/wiki/browser-applications");
    fireEvent.popState(window);
    expect(await screen.findByRole("heading", { level: 1, name: "Browser applications" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();

    const restoredState = {
      possible: { version: 1, graphViewport: { x: 24, y: -16, scale: 0.67 } },
    };
    window.history.pushState(restoredState, "", "/wiki/vite-react");
    fireEvent.popState(window, { state: restoredState });
    expect(await screen.findByRole("heading", { level: 1, name: "Vite with React" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
    expect(screen.getByText("Graph zoom 67%, Universe view")).toBeInTheDocument();
  });

  it("keeps the graph context on mobile", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open article|close article/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    await screen.findByRole("heading", { level: 1, name: "Web" });
    expect(await screen.findByRole("button", { name: "Expand field guide in sidebar" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports keyboard shortcuts and has no detectable semantic accessibility violations", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." });

    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search field guides" })).toHaveFocus();
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
    const readResults = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(readResults.violations).toEqual([]);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Web, 3 pages" }));
    fireEvent.keyDown(window, { key: "/" });
    await waitFor(() => {
      expect(screen.getByRole("searchbox", { name: "Search field guides" })).toHaveFocus();
    });
  });

  it("returns to the top-level atlas from an expanded page", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/wiki/web");
    render(<App />);

    await screen.findByRole("heading", { level: 1, name: "Web" });
    await user.click(screen.getByRole("button", { name: /possible\.sh/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");

    await user.click(screen.getByRole("button", { name: "Manufacturing, 2 pages" }));
    await user.click(screen.getByRole("button", { name: /possible\.sh/i }));
    expect(await screen.findByRole("heading", { level: 1, name: "Learn what the work involves." })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
