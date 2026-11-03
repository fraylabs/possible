const assetCandidates = (pathname) => {
  const normalized = pathname.replace(/^\/+/, "");
  if (!normalized) return ["index.html"];
  if (pathname.endsWith("/")) return [`${normalized}index.html`];
  return [normalized, `${normalized}/index.html`, `${normalized}.html`];
};

const requestFor = (request, pathname) => {
  const url = new URL(request.url);
  url.pathname = `/${pathname}`;
  url.search = "";
  return new Request(url, request);
};

// Static assets come back whole, but Safari on iPhone only plays a video it can fetch in byte ranges
// (206). Answer a single "bytes=" range from the whole asset.
export const withRange = async (request, response) => {
  const range = request.headers.get("Range");
  const match = range && response.status === 200 ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;
  if (!match || (!match[1] && !match[2])) return response;
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  let start;
  let end;
  if (match[1]) {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  } else {
    start = Math.max(size - Number(match[2]), 0);
    end = size - 1;
  }
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  if (start >= size || start > end) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.delete("Content-Length");
    return new Response(null, { status: 416, headers });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(request.method === "HEAD" ? null : body.slice(start, end + 1), { status: 206, headers });
};

const worker = {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad Request", { status: 400 });
    }
    if (pathname.includes("..")) return new Response("Bad Request", { status: 400 });

    for (const candidate of assetCandidates(pathname)) {
      const response = await env.ASSETS.fetch(requestFor(request, candidate));
      if (response.status !== 404) return withRange(request, response);
    }

    const notFound = await env.ASSETS.fetch(requestFor(request, "404.html"));
    if (notFound.status === 404) return new Response("Not Found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : await notFound.arrayBuffer(), {
      status: 404,
      headers: notFound.headers,
    });
  },
};

export default worker;
