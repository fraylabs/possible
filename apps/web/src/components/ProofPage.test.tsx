import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadWiki, type WikiCorpus } from "@possible/knowledge";
import { ProofPage } from "./ProofPage";

vi.mock("@possible/knowledge", async (importOriginal) => {
  const runtime = await importOriginal<typeof import("@possible/knowledge")>();
  return {
    ...runtime,
    loadWiki: vi.fn(runtime.loadWiki),
    assessSearchResults: (results: ReturnType<typeof runtime.searchPages>) => {
      const outcomeResults = results.filter(({ page }) => page.kind === "outcome");
      const verifiedRoutes = outcomeResults
        .filter(({ page }) => page.routeStatus === "verified")
        .map(({ page }) => page.slug);
      const partialRoutes = outcomeResults
        .filter(({ page }) => page.routeStatus !== "verified")
        .map(({ page }) => page.slug);

      if (verifiedRoutes.length > 0) {
        return {
          status: "verified" as const,
          reason: "Possible found an explicitly verified outcome route.",
          verifiedRoutes,
          partialRoutes,
        };
      }
      if (partialRoutes.length > 0) {
        return {
          status: "partial" as const,
          reason: "Possible found an outcome page, but no explicitly verified route.",
          verifiedRoutes,
          partialRoutes,
        };
      }
      return {
        status: "no-maintained-route" as const,
        reason: "Possible found no maintained pages matching every query term.",
        verifiedRoutes,
        partialRoutes,
      };
    },
  };
});

const corpus: WikiCorpus = {
  pages: [
    {
      slug: "digital-photo-frame",
      title: "Digital photo frame",
      summary: "A local-first display, browser application, storage plan, and enclosure route.",
      body: [
        "## What this makes possible",
        "",
        "This is a partial route. It does not contain a tested device image, chosen panel, completed enclosure, electrical design, or physical receipt.",
        "",
        "## Enclosure CAD and manufacturing",
        "",
        "The required missing evidence is measured hardware, a revisioned enclosure, a fit check, and inspection results.",
      ].join("\n"),
      tags: ["digital", "photo", "frame"],
      aliases: ["digital photo frame"],
      kind: "outcome",
      coverage: ["display-device-architecture", "local-storage", "verification"],
      routeStatus: "partial",
      reviewedAt: "2026-07-18",
      sources: [{
        title: "Raspberry Pi kiosk mode",
        url: "https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/",
      }],
      links: ["browser-applications"],
    },
    {
      slug: "robotic-arms",
      title: "Robotic arms",
      summary: "A route map across mechanics, controls, calibration, safety, and physical tests.",
      body: [
        "## What this makes possible",
        "",
        "This is a maintained route map, not a complete design recipe.",
        "",
        "## Current coverage and gaps",
        "",
        "The route does not establish an actuator bill of materials, safety certification, calibrated model, or demonstrated payload and repeatability. These remain project-specific evidence gaps.",
      ].join("\n"),
      tags: ["robotic", "arm", "robotics"],
      aliases: ["robotic arm"],
      kind: "outcome",
      coverage: ["mechanism", "controls", "safety", "inspection"],
      routeStatus: "partial",
      reviewedAt: "2026-07-18",
      sources: [{
        title: "OSHA industrial robot safety",
        url: "https://www.osha.gov/otm/section-4-safety-hazards/chapter-4",
      }],
      links: ["actuator-transmission-sizing"],
    },
    {
      slug: "browser-applications",
      title: "Browser applications",
      summary: "Architecture and runtime boundaries for browser-delivered applications.",
      body: "## What this makes possible\n\nBrowser applications.",
      tags: ["web"],
      kind: "method",
      coverage: ["web"],
      reviewedAt: "2026-07-18",
      sources: [{ title: "Web platform", url: "https://www.w3.org/" }],
      links: [],
    },
    {
      slug: "actuator-transmission-sizing",
      title: "Actuator and transmission sizing",
      summary: "Connect joint requirements to actuator and transmission choices.",
      body: "## What this makes possible\n\nActuator sizing.",
      tags: ["robotics"],
      kind: "method",
      coverage: ["actuation"],
      reviewedAt: "2026-07-18",
      sources: [{ title: "MuJoCo", url: "https://mujoco.readthedocs.io/" }],
      links: [],
    },
  ],
};

describe("ProofPage", () => {
  beforeEach(() => {
    vi.mocked(loadWiki).mockResolvedValue(structuredClone(corpus));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders each real runtime assessment outcome-first with sources and explicit gaps", async () => {
    render(<ProofPage />);

    expect(screen.getByRole("heading", { name: "Loading the Possible corpus" })).toBeInTheDocument();
    const photoQuery = await screen.findByRole("heading", {
      name: "“I want to make a digital photo frame”",
    });
    const photoProof = photoQuery.closest("article");
    expect(photoProof).not.toBeNull();

    const photo = within(photoProof as HTMLElement);
    const outcomeHeading = photo.getByRole("heading", { name: "Outcome page" });
    const routeHeading = photo.getByRole("heading", { name: "Route status" });
    expect(
      outcomeHeading.compareDocumentPosition(routeHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(photo.getByRole("link", { name: "Digital photo frame" })).toHaveAttribute(
      "href",
      "/wiki/digital-photo-frame",
    );
    expect(photo.getByText("Partial")).toBeInTheDocument();
    expect(photo.queryByText("Verified")).not.toBeInTheDocument();
    expect(photo.getByRole("list", { name: "Digital photo frame coverage" })).toHaveTextContent(
      "display-device-architecture",
    );
    expect(photo.getByRole("link", { name: "Browser applications" })).toHaveAttribute(
      "href",
      "/wiki/browser-applications",
    );
    expect(photo.getByRole("link", { name: "Raspberry Pi kiosk mode" })).toHaveAttribute(
      "href",
      "https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/",
    );
    expect(photo.getByText(/does not contain a tested device image/i)).toBeInTheDocument();
    expect(photo.getByText(/required missing evidence is measured hardware/i)).toBeInTheDocument();
    expect(photo.getByRole("link", { name: "Agent read JSON" })).toHaveAttribute(
      "href",
      "/agent/read/digital-photo-frame.json",
    );
    expect(photo.getByRole("link", { name: "Related pages JSON" })).toHaveAttribute(
      "href",
      "/agent/related/digital-photo-frame.json",
    );

    const armQuery = screen.getByRole("heading", { name: "“I want to make a robotic arm”" });
    const armProof = armQuery.closest("article");
    expect(armProof).not.toBeNull();
    const arm = within(armProof as HTMLElement);
    expect(arm.getByRole("link", { name: "Robotic arms" })).toHaveAttribute(
      "href",
      "/wiki/robotic-arms",
    );
    expect(arm.getByRole("link", { name: "Actuator and transmission sizing" })).toBeInTheDocument();
    expect(arm.getByText(/does not establish an actuator bill of materials/i)).toBeInTheDocument();
    expect(loadWiki).toHaveBeenCalledTimes(1);
  });

  it("provides a keyboard-operable copy control and a manually copyable agent prompt", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ProofPage />);
    await screen.findByRole("heading", { name: "“I want to make a digital photo frame”" });

    const prompt = screen.getByRole("textbox", { name: "Agent prompt" });
    expect((prompt as HTMLTextAreaElement).value).toContain("https://possible.sh/llms.txt");
    expect((prompt as HTMLTextAreaElement).value).toContain("I want to make a robotic arm");

    const copyButton = screen.getByRole("button", { name: "Copy prompt" });
    copyButton.focus();
    await user.keyboard("{Enter}");

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("https://possible.sh/llms.txt"));
    expect(screen.getByRole("status")).toHaveTextContent("Prompt copied to the clipboard.");
    expect(screen.getByRole("link", { name: "Open llms.txt" })).toHaveAttribute(
      "href",
      "https://possible.sh/llms.txt",
    );
    expect(screen.getByRole("link", { name: "Search index JSON" })).toHaveAttribute(
      "href",
      "/agent/search.json",
    );
  });

  it("has no detectable semantic accessibility violations after the corpus loads", async () => {
    render(<ProofPage />);
    await screen.findByRole("heading", { name: "“I want to make a robotic arm”" });

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
