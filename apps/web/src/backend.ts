export function convexSiteUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const cloud = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  return cloud ? cloud.replace(/\.convex\.cloud\/?$/, ".convex.site") : undefined;
}

export function outcomeApiUrl(path = ""): string | undefined {
  const site = convexSiteUrl();
  return site ? `${site}/api/outcomes${path}` : undefined;
}
