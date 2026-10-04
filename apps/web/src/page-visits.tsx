"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { convexSiteUrl } from "./backend";
import { validReferrerHost, validUtm, validVisitPath } from "../../../convex/visitValidation";

export function visitPayload(url: URL, referrer: string, privacy: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  if (url.origin !== "https://possible.sh" || privacy.doNotTrack === "1" || privacy.globalPrivacyControl) return null;
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (!validVisitPath(path)) return null;
  let referrerHost = "";
  try {
    const source = new URL(referrer);
    if (["http:", "https:"].includes(source.protocol) && validReferrerHost(source.hostname)) referrerHost = source.hostname;
  } catch { /* Direct visits have no referring site. */ }
  const utm = (key: string) => {
    const value = url.searchParams.get(key) ?? "";
    return validUtm(value) ? value : "";
  };
  return { path, referrerHost, utmSource: utm("utm_source"), utmMedium: utm("utm_medium"), utmCampaign: utm("utm_campaign") };
}

export function PageVisits() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    const site = convexSiteUrl();
    const payload = visitPayload(new URL(window.location.href), document.referrer, navigator as Navigator & { globalPrivacyControl?: boolean });
    if (!site || !payload || previousPath.current === payload.path) return;
    previousPath.current = payload.path;
    void fetch(`${site}/api/visits`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
      credentials: "omit", referrerPolicy: "no-referrer", keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
