"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useAuthAvailable, useBackendAvailable } from "./backend-provider";

function ConnectedOutcomeReactions({ outcomeId, likeCount }: { outcomeId: string; likeCount: number }) {
  const id = outcomeId as Id<"outcomes">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const state = useQuery(api.reactions.viewerState, { outcomeId: id });
  const toggleLike = useMutation(api.reactions.toggleLike);
  const toggleBookmark = useMutation(api.reactions.toggleBookmark);

  async function authenticateOr(run: () => Promise<unknown>) {
    if (!isAuthenticated) {
      await signIn("github", { redirectTo: window.location.href });
      return;
    }
    await run();
  }

  const visibleLikes = state?.likeCount ?? likeCount;
  return <div className="outcome-reactions" aria-label="Outcome reactions">
    <button type="button" aria-pressed={state?.liked ?? false} disabled={isLoading} onClick={() => void authenticateOr(() => toggleLike({ outcomeId: id }))}>★ {visibleLikes}</button>
    <button type="button" aria-pressed={state?.bookmarked ?? false} disabled={isLoading} onClick={() => void authenticateOr(() => toggleBookmark({ outcomeId: id }))}>{state?.bookmarked ? "Saved" : "Save"}</button>
  </div>;
}

export function OutcomeReactions(props: { outcomeId: string | undefined; likeCount: number }) {
  const available = useBackendAvailable();
  const authAvailable = useAuthAvailable();
  if (!available || !authAvailable || !props.outcomeId) return props.likeCount > 0 ? <span className="outcome-like-count">★ {props.likeCount}</span> : null;
  return <ConnectedOutcomeReactions outcomeId={props.outcomeId} likeCount={props.likeCount} />;
}
