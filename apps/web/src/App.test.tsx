import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@possible/knowledge/data", () => {
  const knowledgeGraphData = {
    nodes: [
      {
        id: "field",
        type: "topic",
        title: "A field",
        summary: "A maintained body of operational knowledge.",
        contributors: ["Maintainer"],
        reviewedAt: "2026-07-01",
      },
      {
        id: "workflow",
        type: "practice",
        title: "A productive workflow",
        summary: "A conditional recommendation.",
        applicability: ["Fast iteration matters"],
        counterconditions: ["A different constraint dominates"],
        alternatives: ["alternative"],
        sources: [{ title: "Primary documentation", url: "https://example.com/docs" }],
      },
      {
        id: "alternative",
        type: "tool",
        title: "Alternative tool",
        summary: "A connected alternative.",
      },
      {
        id: "provider",
        type: "provider",
        title: "Provider capability",
        summary: "A safe external capability.",
        actions: [{
          title: "Start handoff",
          description: "Opens an external provider procedure.",
          url: "https://example.com/start",
          requiresApproval: true,
        }],
      },
    ],
    edges: [
      { source: "field", target: "workflow", type: "hierarchy" },
      { source: "workflow", target: "alternative", type: "alternative" },
      { source: "workflow", target: "provider", type: "support" },
    ],
  };
  return { knowledgeGraphData, graph: knowledgeGraphData, default: knowledgeGraphData };
});

import { App } from "./App";

describe("Possible graph explorer", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("loads the shared graph and exposes graph and detail navigation", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Mapping contributor knowledge")).toBeInTheDocument();
    await screen.findByRole("heading", { name: "A field" });

    const workflowNodes = screen.getAllByRole("button", { name: /A productive workflow/i });
    await user.click(workflowNodes[0]!);

    expect(await screen.findByRole("heading", { name: "A productive workflow" })).toBeInTheDocument();
    expect(screen.getByText("Fast iteration matters")).toBeInTheDocument();
    expect(screen.getByText("A different constraint dominates")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Primary documentation/i })).toHaveAttribute("href", "https://example.com/docs");
  });

  it("searches knowledge and reports an honest empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = await screen.findByRole("searchbox", { name: "Search operational knowledge" });

    await user.type(search, "provider");
    expect(screen.getAllByText("Provider capability").length).toBeGreaterThan(0);

    await user.clear(search);
    await user.type(search, "no matching knowledge");
    expect(screen.getByText("No maintained node found")).toBeInTheDocument();
  });

  it("focuses search with slash and labels privileged handoffs", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "A field" });

    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox", { name: "Search operational knowledge" })).toHaveFocus();

    const providerNodes = screen.getAllByRole("button", { name: /Provider capability/i });
    await user.click(providerNodes[0]!);
    await waitFor(() => expect(screen.getByText("Captain approval required")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Open Start handoff handoff" })).toHaveAttribute("target", "_blank");
  });

  it("supports keyboard travel between visible graph nodes", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "A field" });
    const selectedGraphNode = screen.getByRole("button", { name: "A field, Topic, selected" });

    selectedGraphNode.focus();
    fireEvent.keyDown(selectedGraphNode, { key: "ArrowRight" });

    await waitFor(() => expect(window.location.hash).not.toBe("#/field"));
    expect(document.activeElement).toBe(selectedGraphNode);
  });

  it("has no detectable semantic accessibility violations", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "A field" });

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
