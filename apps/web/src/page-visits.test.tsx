import { describe, expect, it, vi } from "vitest";
import { visitPayload } from "./page-visits";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("Page-view privacy", () => {
  it("sends only a known path, referring hostname and three bounded UTMs", () => {
    const payload = visitPayload(new URL("https://possible.sh/docs/?utm_source=test&utm_medium=social&utm_campaign=oct-4&id=secret#private"), "https://example.com/private?email=secret", {});
    expect(payload).toEqual({ path: "/docs", referrerHost: "example.com", utmSource: "test", utmMedium: "social", utmCampaign: "oct-4" });
  });
  it("skips localhost, previews, unknown routes, DNT and GPC", () => {
    for (const url of ["http://localhost:3000", "https://preview.pages.dev", "https://possible.vercel.app", "https://possible.sh/unknown", "https://possible.sh.evil.com", "http://possible.sh"]) expect(visitPayload(new URL(url), "", {})).toBeNull();
    expect(visitPayload(new URL("https://possible.sh"), "", { doNotTrack: "1" })).toBeNull();
    expect(visitPayload(new URL("https://possible.sh"), "", { globalPrivacyControl: true })).toBeNull();
  });
  it("discards invalid UTMs and referrers including IPs", () => {
    for (const referrer of ["", "not-a-url", "http://127.0.0.1/private", "file:///secret"]) expect(visitPayload(new URL("https://possible.sh/?utm_source=person%40example.com&utm_campaign=" + "x".repeat(65)), referrer, {})).toEqual({ path: "/", referrerHost: "", utmSource: "", utmMedium: "", utmCampaign: "" });
  });
});
