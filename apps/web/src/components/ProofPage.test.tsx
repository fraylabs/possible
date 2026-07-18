import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadWiki, type WikiCorpus } from "@possible/knowledge";
import { ProofPage } from "./ProofPage";

vi.mock("@possible/knowledge", async (importOriginal) => {
  const runtime = await importOriginal<typeof import("@possible/knowledge")>();
  return { ...runtime, loadWiki: vi.fn(runtime.loadWiki) };
});

const corpus: WikiCorpus = {
  pages: [
    {
      slug: "digital-photo-frame",
      title: "Digital photo frame",
      summary: "A field guide to the browser, storage, device, and enclosure concerns.",
      body: "This guide describes the subject without selecting or validating a project design.",
      tags: ["digital", "photo", "frame"],
      aliases: ["digital picture frame"],
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
      summary: "A field guide to mechanics, controls, calibration, safety, and physical tests.",
      body: "This guide teaches the major subjects involved in robotic arms.",
      tags: ["robotics", "manipulator"],
      aliases: ["robotic arm", "robot arm"],
      reviewedAt: "2026-07-18",
      sources: [{ title: "MuJoCo overview", url: "https://mujoco.readthedocs.io/en/stable/overview.html" }],
      links: ["browser-applications"],
    },
    {
      slug: "browser-applications",
      title: "Browser applications",
      summary: "Related reading about interactive browser software.",
      body: "A source-backed field guide.",
      tags: ["browser"],
      reviewedAt: "2026-07-18",
      sources: [{ title: "MDN", url: "https://developer.mozilla.org/" }],
      links: [],
    },
  ],
};

describe("retrieval examples", () => {
  beforeEach(() => {
    vi.mocked(loadWiki).mockResolvedValue(structuredClone(corpus));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows real guide retrieval with sources and related reading only", async () => {
    render(<ProofPage />);

    const photoHeading = await screen.findByRole("heading", { name: "“digital photo frame”" });
    const photo = photoHeading.closest("article");
    expect(photo).not.toBeNull();
    const photoArticle = within(photo as HTMLElement);

    expect(photoArticle.getByRole("link", { name: "Digital photo frame" })).toHaveAttribute(
      "href",
      "/wiki/digital-photo-frame",
    );
    expect(photoArticle.getByRole("link", { name: "Raspberry Pi kiosk mode" })).toHaveAttribute(
      "href",
      expect.stringContaining("raspberrypi.com"),
    );
    expect(photoArticle.getByRole("link", { name: "Browser applications" })).toHaveAttribute(
      "href",
      "/wiki/browser-applications",
    );
    expect(photoArticle.getByText(/Related guides provide context/i)).toBeInTheDocument();

    expect(await screen.findByRole("link", { name: "Robotic arms" })).toHaveAttribute(
      "href",
      "/wiki/robotic-arms",
    );
    expect(loadWiki).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Bundled corpus examples")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/\bpublished\b/i);
    expect(screen.queryByText(/route status|verified route|partial route/i)).not.toBeInTheDocument();
  });

  it("copies an agent prompt that preserves the reading boundary", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ProofPage />);
    await screen.findByRole("heading", { name: "“robotic arm”" });

    const prompt = screen.getByRole("textbox", { name: "Agent prompt" });
    expect((prompt as HTMLTextAreaElement).value).toContain("not as a project planner");
    expect((prompt as HTMLTextAreaElement).value).toContain(`${window.location.origin}/llms.txt`);
    expect((prompt as HTMLTextAreaElement).value).toContain("Require schema version 2");
    expect((prompt as HTMLTextAreaElement).value).not.toContain("https://possible.sh/llms.txt");
    expect((prompt as HTMLTextAreaElement).value).toContain("bundled guide index");
    expect((prompt as HTMLTextAreaElement).value).not.toMatch(/\bpublished\b/i);
    expect((prompt as HTMLTextAreaElement).value).toContain("link adjacency and display order as related reading");
    expect((prompt as HTMLTextAreaElement).value).toContain("conditional sequence stated in prose");

    await user.click(screen.getByRole("button", { name: "Copy prompt" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`${window.location.origin}/llms.txt`));
    expect(screen.getByRole("status")).toHaveTextContent("Prompt copied to the clipboard.");
  });

  it("renders a clear corpus failure without fabricating retrieval", async () => {
    vi.mocked(loadWiki).mockRejectedValueOnce(new Error("offline"));
    render(<ProofPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
    expect(screen.queryByRole("heading", { name: "“robotic arm”" })).not.toBeInTheDocument();
  });

  it("has no detectable semantic accessibility violations", async () => {
    render(<ProofPage />);
    await screen.findByRole("heading", { name: "“robotic arm”" });

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
