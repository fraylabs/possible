import { describe, expect, it } from "vitest";
import worker from "../sites-worker.mjs";

const bytes = new Uint8Array(Array.from({ length: 100 }, (_, i) => i));
const env = {
  ASSETS: {
    fetch: async (request: Request) =>
      new URL(request.url).pathname === "/media/film.mp4"
        ? new Response(bytes, { headers: { "Content-Type": "video/mp4", "Content-Length": "100" } })
        : new Response("Not Found", { status: 404 }),
  },
};
const get = (range?: string) =>
  worker.fetch(new Request("https://possible.sh/media/film.mp4", { headers: range ? { Range: range } : {} }), env);

describe("sites worker byte ranges", () => {
  it("returns the whole file without a Range header", async () => {
    const response = await get();
    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBe(100);
  });

  it("returns 206 with the asked bytes", async () => {
    const response = await get("bytes=0-1");
    expect(response.status).toBe(206);
    expect(response.headers.get("Content-Range")).toBe("bytes 0-1/100");
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([0, 1]);
  });

  it("handles open-ended and suffix ranges", async () => {
    expect((await get("bytes=98-")).headers.get("Content-Range")).toBe("bytes 98-99/100");
    const suffix = await get("bytes=-3");
    expect(suffix.headers.get("Content-Range")).toBe("bytes 97-99/100");
    expect([...new Uint8Array(await suffix.arrayBuffer())]).toEqual([97, 98, 99]);
  });

  it("returns 416 past the end", async () => {
    const response = await get("bytes=200-");
    expect(response.status).toBe(416);
    expect(response.headers.get("Content-Range")).toBe("bytes */100");
  });
});
