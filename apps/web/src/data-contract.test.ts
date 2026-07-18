import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getBacklinks, getPage, getRelatedPages, loadWiki } from "@possible/knowledge";
import { App } from "./App";

describe("real corpus integration", () => {
  it("renders a real shared page and its derived relations", async () => {
    const corpus = await loadWiki();
    expect(corpus.pages.length).toBeGreaterThan(0);

    const page = corpus.pages[0]!;
    expect(getPage(corpus, page.slug)).toEqual(page);
    expect(getRelatedPages(corpus, page.slug)).toEqual(expect.any(Array));
    expect(getBacklinks(corpus, page.slug)).toEqual(expect.any(Array));

    window.history.replaceState(null, "", `/wiki/${page.slug}`);
    render(createElement(App));

    expect(await screen.findByRole("heading", { level: 1, name: page.title })).toBeInTheDocument();
    expect(screen.getByText(page.summary)).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Connected nodes" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
