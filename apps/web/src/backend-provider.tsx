"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const BackendAvailable = createContext(false);
const AuthAvailable = createContext(false);

export function useBackendAvailable() {
  return useContext(BackendAvailable);
}

export function useAuthAvailable() {
  return useContext(AuthAvailable);
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  const authAvailable = process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true";
  const client = useMemo(() => url ? new ConvexReactClient(url) : null, [url]);
  if (!client) return <BackendAvailable.Provider value={false}><AuthAvailable.Provider value={false}>{children}</AuthAvailable.Provider></BackendAvailable.Provider>;
  return <BackendAvailable.Provider value><AuthAvailable.Provider value={authAvailable}><ConvexAuthProvider client={client}>{children}</ConvexAuthProvider></AuthAvailable.Provider></BackendAvailable.Provider>;
}
