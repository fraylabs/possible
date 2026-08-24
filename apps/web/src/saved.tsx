"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useAuthAvailable, useBackendAvailable } from "./backend-provider";
import { fetchDiscoveryOutcomes, type DiscoveryOutcome } from "./discovery-data";
import { SiteShell } from "./shared";

function ConnectedSavedOutcomes() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const ids = useQuery(api.reactions.bookmarks, isAuthenticated ? {} : "skip");
  const [outcomes, setOutcomes] = useState<DiscoveryOutcome[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    void fetchDiscoveryOutcomes().then((entries) => { if (!cancelled) setOutcomes(entries); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const saved = useMemo(() => {
    const selected = new Set<string>(ids ?? []);
    return outcomes.filter((outcome) => outcome.databaseId && selected.has(outcome.databaseId));
  }, [ids, outcomes]);

  if (isLoading) return <p className="saved-status">Loading account…</p>;
  if (!isAuthenticated) return <section className="saved-empty"><h2>Keep your Outcomes together.</h2><p>Sign in with GitHub to save Outcomes across devices. Publishing still requires no account.</p><button type="button" onClick={() => void signIn("github", { redirectTo: window.location.href })}>Continue with GitHub</button></section>;
  return <>
    <div className="saved-account"><span>{saved.length} saved</span><button type="button" onClick={() => void signOut()}>Sign out</button></div>
    {ids === undefined ? <p className="saved-status">Loading saved Outcomes…</p> : saved.length ? <ol className="saved-list">{saved.map((outcome) => <li key={outcome.id}><a href={outcome.href}><span>{outcome.source?.name ?? "Outcome"}</span><h2>{outcome.title}</h2><p>{outcome.summary}</p><strong>Open Outcome →</strong></a></li>)}</ol> : <section className="saved-empty"><h2>No saved Outcomes yet.</h2><p>Use Save on any Outcome to keep it here.</p><a href="/#discover">Browse Outcomes →</a></section>}
  </>;
}

export function SavedOutcomesPage() {
  const available = useBackendAvailable();
  const authAvailable = useAuthAvailable();
  return <SiteShell className="saved-page"><section className="saved-directory layout-reading"><header><span>YOUR ACCOUNT</span><h1>Saved Outcomes</h1></header>{available && authAvailable ? <ConnectedSavedOutcomes /> : <section className="saved-empty"><h2>Accounts are not connected.</h2><p>Configure GitHub authentication in this build or use local CLI bookmarks.</p></section>}</section></SiteShell>;
}
