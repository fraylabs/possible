import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import App, { AuthoringDocsPage, DocsGlossaryPage, DocsPage, DocsReferencePage, ExpectationsDocsPage, HowToUsePage, NotFoundPage, OutcomePacksDocsPage, PackDetailPage, PacksPage, ProductDetailPage, ProductsPage } from "./App";
import { commonSearches } from "./catalog";
import { getPublishedProduct, getRoutablePack, installCommand, packHref, productHref, publishedPacks, publishedProducts, routablePacks, searchPublishedPacks } from "./public-content";

vi.mock("./PackCadViewer", () => ({ default: () => <div data-testid="cad-viewer" /> }));

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

function renderRoute(path: string) {
  window.history.pushState({}, "", path);
  if (path === "/") return render(<PacksPage />);
  if (path === "/docs") return render(<DocsPage />);
  if (path === "/docs/how-to-use") return render(<HowToUsePage />);
  if (path === "/docs/outcome-packs") return render(<OutcomePacksDocsPage />);
  if (path === "/docs/expectations") return render(<ExpectationsDocsPage />);
  if (path === "/docs/authoring") return render(<AuthoringDocsPage />);
  if (path === "/docs/reference") return render(<DocsReferencePage />);
  if (path === "/docs/glossary") return render(<DocsGlossaryPage />);
  if (path.startsWith("/packs/")) {
    const id = path.slice("/packs/".length);
    return render(getRoutablePack(id) ? <PackDetailPage idOrSlug={id} /> : <NotFoundPage />);
  }
  if (path.startsWith("/products/")) {
    const id = path.slice("/products/".length);
    return render(getPublishedProduct(id) ? <ProductDetailPage id={id} /> : <NotFoundPage />);
  }
  return render(<NotFoundPage />);
}

describe("Possible website", () => {
  it("uses the Outcome Pack library as the homepage", async () => {
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /Anything is possible/, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Discover what agents can do.")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll(".nav-links a")).map((link) => link.textContent)).toEqual(["PACKS", "PRODUCTS", "DOCS", "GITHUB ↗"]);
    const gallery = screen.getByRole("region", { name: "Active Outcome Pack catalog" });
    expect(within(gallery).getAllByRole("link")).toHaveLength(6);
    expect(gallery.querySelector(".library-pack-card.has-media .library-pack-visual")).toBeInTheDocument();
    expect(gallery.querySelector(".library-pack-card.is-text-only .library-pack-visual")).toBeNull();
    expect(gallery).not.toHaveTextContent(/\b(?:SKILLS|CHECKS|EXPERIMENTAL)\b/);
    expect(screen.getByRole("navigation", { name: "Outcome Pack pages" })).toHaveTextContent(`PAGE 1 OF ${Math.ceil(publishedPacks.length / 6)}`);
    await userEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(window.location.search).toBe("?page=2");
    expect(within(gallery).getByRole("heading", { name: publishedPacks[6].pack.name, level: 3 })).toBeInTheDocument();
    expect(within(gallery).queryByRole("heading", { name: publishedPacks[0].pack.name, level: 3 })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("turns common searches into real outcome searches", async () => {
    renderRoute("/");
    expect(screen.getByText("COMMON SEARCHES")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((button) => button.closest(".packs-search-examples"))).toHaveLength(commonSearches.length);
    for (const query of commonSearches) expect(searchPublishedPacks(query).length, query).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "Compose an original soundtrack" }));
    expect(screen.getByRole("searchbox", { name: "Search what agents can do" })).toHaveValue("Compose an original soundtrack");
    expect(window.location.search).toBe("?q=Compose+an+original+soundtrack");
    expect(within(screen.getByRole("region", { name: "Agent outcome search results" })).getByRole("heading", { name: /Original Instrumental Soundtrack/i })).toBeInTheDocument();
  });

  it("opens and closes the compact mobile navigation", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "MENU" }));
    expect(within(screen.getByRole("dialog", { name: "Mobile navigation" })).getAllByRole("link")).toHaveLength(4);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("searches the active pack library", async () => {
    const { container } = renderRoute("/");
    const catalog = screen.getByRole("region", { name: "Active Outcome Pack catalog" });
    expect(within(catalog).getAllByRole("link")).toHaveLength(6);
    const search = screen.getByRole("searchbox", { name: "Search what agents can do" });
    await userEvent.type(search, "instrumental soundtrack");
    expect(window.location.search).toBe("?q=instrumental+soundtrack");
    expect(screen.getByRole("region", { name: "Agent outcome search results" })).toBeInTheDocument();
    expect(container.querySelector(".packs-library-page")).toHaveClass("is-searching");
    expect(screen.queryByRole("heading", { name: /Anything is possible/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Original Instrumental Soundtrack/i })).toBeInTheDocument();
    expect(screen.getByText("Finished when")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Working Web App", level: 3 })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Agent outcome search results" }).querySelector("img")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(within(screen.getByRole("region", { name: "Active Outcome Pack catalog" })).getAllByRole("link")).toHaveLength(6);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses Product attribution as a discovery hint without hiding the Outcome", async () => {
    const { container } = renderRoute("/");
    await userEvent.type(screen.getByRole("searchbox", { name: "Search what agents can do" }), "HyperFrames");
    const result = screen.getByRole("heading", { name: "Possible Launch Film: Codex Is Bigger Than Code", level: 3 }).closest("a");
    expect(result).toHaveTextContent("For HyperFrames by HeyGen");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("restores a shared search from the URL and exposes source-derived attribution", async () => {
    window.history.pushState({}, "", "/?q=browser+game");
    const { container } = render(<PacksPage />);
    await waitFor(() => expect(screen.getByRole("searchbox", { name: "Search what agents can do" })).toHaveValue("browser game"));
    const result = screen.getByRole("heading", { name: "Playable Web Game", level: 3 }).closest("a");
    expect(result).toHaveTextContent("possible.sh › fraylabs › possible › playable-web-game");
    expect(result).toHaveTextContent("fraylabs");
    expect(within(screen.getByRole("region", { name: "Agent outcome search results" })).getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Web Presentation", level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Original Instrumental Soundtrack/i, level: 3 })).not.toBeInTheDocument();
    expect(container.querySelector(".nav-meta")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reveals the Possible introduction, installer, and launch film on demand", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    const { container } = renderRoute("/");
    const toggle = screen.getByRole("button", { name: "What is Possible?" });
    const video = container.querySelector(".packs-intro-film video")!;
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(video).not.toHaveAttribute("controls");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "About Possible" })).toHaveTextContent("See more of what your agent can do");
    expect(screen.getByRole("region", { name: "About Possible" })).toHaveTextContent("The hard part is knowing what to ask for and how to guide them there.");
    expect(screen.getByText(installCommand)).toBeInTheDocument();
    expect(screen.getByText("$possible")).toBeInTheDocument();
    expect(container.querySelector(".packs-intro-film source")).toHaveAttribute("src", "/pack-media/html-css-animated-product-launch-film/media/possible-launch-film.mp4");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveProperty("muted", false);
    expect(play).toHaveBeenCalledOnce();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(pause).toHaveBeenCalledOnce();
    play.mockRestore();
    pause.mockRestore();
  });

  it("supports image, video, and CAD showcase states", () => {
    const images = renderRoute("/packs/first-customer-sprint");
    expect(screen.getByRole("heading", { name: "First Customer Sprint", level: 1 })).toBeInTheDocument();
    expect(images.container.querySelector(".pack-showcase img")).toHaveAttribute("src", "/pack-media/first-customer-sprint/media/private-pack-offer.png");
    expect(images.container.querySelectorAll(".pack-showcase-picker button")).toHaveLength(4);
    expect(screen.getByRole("heading", { name: "What’s inside", level: 2 })).toBeInTheDocument();
    images.unmount();

    const film = renderRoute("/packs/html-css-animated-product-launch-film");
    expect(film.container.querySelector(".pack-showcase video source")).toHaveAttribute("src", "/pack-media/html-css-animated-product-launch-film/media/possible-launch-film.mp4");
    expect(screen.getByRole("link", { name: /HyperFrames by HeyGen/i })).toHaveAttribute("href", "/products/hyperframes");
    expect(screen.getByRole("heading", { name: "Copy the exact prompt", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy exact prompt" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Expectations" })).not.toBeInTheDocument();
    expect(film.container).toHaveTextContent(/showcase media is not verification/i);
    film.unmount();

    const cad = renderRoute("/packs/robot-digital-prototype");
    expect(screen.getByRole("group", { name: "Choose showcase media" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CAD/i })).toBeInTheDocument();
    expect(cad.container.querySelectorAll(".pack-showcase-picker button")).toHaveLength(4);
  });

  it("renders concise Product attribution, access, and related Outcomes", async () => {
    const product = publishedProducts.find(({ id }) => id === "heygen/hyperframes");
    expect(product).toBeDefined();
    const { container } = renderRoute(productHref(product!));
    expect(screen.getAllByRole("link", { name: /HeyGen/i })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /HeyGen/i })[0]).toHaveAttribute("href", "https://www.heygen.com");
    expect(screen.getAllByText("Free to use").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No checkout").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "HyperFrames", level: 1 })).toBeInTheDocument();
    expect(container.querySelector(".product-profile-header > img")).toHaveAttribute("src", product!.logoUrl);
    expect(screen.getByRole("link", { name: /Official description/i })).toHaveAttribute("href", product!.summarySourceUrl);
    expect(screen.queryByText(/Create motion graphics, explainers/i)).not.toBeInTheDocument();
    expect(container.querySelector(".product-hero-proof")).toBeNull();
    expect(container.querySelector(".product-source")).toBeNull();
    expect(screen.getByRole("link", { name: /Possible Launch Film: Codex Is Bigger Than Code/i })).toHaveAttribute("href", "/packs/html-css-animated-product-launch-film");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a compact Product directory with official logos", async () => {
    const { container } = render(<ProductsPage />);
    expect(screen.getByRole("heading", { name: "Products", level: 1 })).toBeInTheDocument();
    expect(container.querySelector(".products-page-header")).toBeNull();
    for (const product of publishedProducts) {
      expect(screen.getByRole("link", { name: new RegExp(product.name, "i") })).toHaveAttribute("href", productHref(product));
      expect(container.querySelector(`a[href="${productHref(product)}"] img`)).toHaveAttribute("src", product.logoUrl);
      expect(container.querySelector(`a[href="${productHref(product)}"] .product-directory-meta`)).toBeInTheDocument();
    }
    expect(publishedProducts).toHaveLength(6);
    expect(screen.getByRole("link", { name: /Seedance 2\.0/i })).toHaveAttribute("href", "/products/seedance");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps Products without published Outcomes honest", () => {
    renderRoute("/products/seedance");
    expect(screen.getByRole("heading", { name: "Seedance 2.0", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("No published Outcomes use this product yet.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Outcome Pack/i })).not.toBeInTheDocument();
  });

  it("renders every catalog pack on its canonical details route", () => {
    for (const entry of routablePacks) {
      const route = renderRoute(packHref(entry));
      expect(screen.getByRole("heading", { name: entry.pack.name, level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Publisher").nextElementSibling).toHaveTextContent("fraylabs");
      if (entry.pack.expectations?.length) {
        expect(screen.getByRole("heading", { name: "What’s inside", level: 2 })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Possible" })).toHaveAttribute("aria-selected", "true");
      } else {
        expect(screen.getByRole("heading", { name: "What it uses", level: 2 })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Copy exact prompt" })).toBeInTheDocument();
      }
      route.unmount();
    }
  });

  it("keeps the primary pack action simple and reveals the full prompt on demand", async () => {
    const { container } = renderRoute("/packs/first-customer-sprint");
    expect(container.querySelector(".nav-meta")).toBeNull();
    expect(container.querySelector(".pack-detail-sidebar")).toBeNull();
    expect(screen.getByText("Technical details").closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText("$possible Use the First Customer Sprint Outcome Pack for this project.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Full prompt" }));
    expect(screen.getByRole("tab", { name: "Full prompt" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "Copy full run prompt" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps documentation multi-page and links exploration back to packs", async () => {
    for (const [path, heading] of [
      ["/docs", /Build complete outcomes with Possible/i],
      ["/docs/how-to-use", /How to use Possible/i],
      ["/docs/outcome-packs", /Choose a complete outcome/i],
      ["/docs/expectations", /artifact is not the proof/i],
      ["/docs/authoring", /Write the contract in JSON/i],
      ["/docs/reference", /Keep the selected pack inspectable/i],
      ["/docs/glossary", /language of complete outcomes/i],
    ] as const) {
      const route = renderRoute(path);
      expect(screen.getByRole("heading", { name: heading, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Outcome Pack library/i })).toHaveAttribute("href", "/#packs");
      route.unmount();
    }
  });

  it("routes unknown locations to the pack library", () => {
    renderRoute("/not-real");
    expect(screen.getByRole("heading", { name: /This outcome is\s*not here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse Outcome Packs/i })).toHaveAttribute("href", "/#packs");
  });

  it("does not keep a duplicate /packs library route", () => {
    renderRoute("/packs");
    expect(screen.getByRole("heading", { name: /This outcome is\s*not here/i })).toBeInTheDocument();
  });
});
