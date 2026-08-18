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
      if (response.status !== 404) return response;
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
