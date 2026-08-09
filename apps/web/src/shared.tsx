"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicCatalogEntry } from "@possible/packs";
import { githubUrl } from "./public-content";

export type CopyState = "idle" | "copied" | "failed";
export const approvalDisclosure = "Saying yes authorizes the disclosed repo-local outcome work and any listed Skill installation. External actions still require separate approval.";
const statusLabels = {
  listed: "Listed",
  experimental: "Experimental",
  verified: "Verified",
} as const;
export const statusLabel = (status: keyof typeof statusLabels) => statusLabels[status];
export const packStatusLabel = (entry: PublicCatalogEntry) => statusLabel(entry.trust.status);
const navigationItems = [
  { label: "PACKS", href: "/#packs", external: false },
  { label: "DOCS", href: "/docs", external: false },
  { label: "GITHUB", href: githubUrl, external: true },
] as const;
export function CopyButton({ label, value }: { label: string; value: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
    }
  }

  return (
    <button className="copy-button" type="button" onClick={copy} aria-label={label}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
      <span aria-hidden="true">{state === "copied" ? "✓" : "↗"}</span>
    </button>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <>
      <nav aria-label="Primary">
        <a className="wordmark" href="/">possible<span>.sh</span></a>
        <div className="nav-links">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>{item.label}{item.external ? " ↗" : ""}</a>
          ))}
        </div>
        <button
          ref={triggerRef}
          className="nav-menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(true)}
        >
          <span>MENU</span><i aria-hidden="true" />
        </button>
      </nav>

      {menuOpen ? (
        <div className="mobile-nav-layer">
          <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />
          <div id="mobile-navigation" className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <header>
              <span>NAVIGATION</span>
              <button ref={closeRef} type="button" onClick={closeMenu}>CLOSE <i aria-hidden="true">×</i></button>
            </header>
            <ol>
              {navigationItems.map((item, index) => (
                <li key={item.href}>
                  <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} onClick={() => setMenuOpen(false)}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><i aria-hidden="true">↗</i>
                  </a>
                </li>
              ))}
            </ol>
            <footer><span>POSSIBLE.SH</span><strong>MAKE OUTCOMES POSSIBLE.</strong></footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <a className="wordmark" href="/">possible<span>.sh</span></a>
      <strong>AGENT SKILLS PROVIDE CAPABILITIES.<br />OUTCOME PACKS COORDINATE COMPLETE RESULTS.</strong>
      <span>OPEN SOURCE / 2026</span>
    </footer>
  );
}
export function NotFoundPage() {
  return (
    <main>
      <SiteNav />
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This outcome is<br /><em>not here.</em></h1>
        <a className="button-link" href="/#packs">Browse Outcome Packs <span>→</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
