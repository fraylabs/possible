"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { githubUrl } from "./public-content";

export type CopyState = "idle" | "copied" | "failed";
const accountEnabled = process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true";
const navigationItems = [
  ...(accountEnabled ? [{ label: "SAVED", href: "/saved", external: false }] : []),
  { label: "DOCS", href: "/docs", external: false },
  { label: "PUBLISH", href: "/publish", external: false },
] as const;
export function CopyButton({ label, value, onCopied }: { label: string; value: string; onCopied?: () => void | Promise<unknown> }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      void onCopied?.();
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
      <nav className="site-nav" aria-label="Primary">
        <div className="site-nav-inner layout-wide">
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
        </div>
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
    <footer className="site-footer">
      <div className="site-footer-inner layout-wide">
        <a className="wordmark" href="/">possible<span>.sh</span></a>
        <div className="site-footer-links">
          <a href="/#discover">Discover</a>
          <a href="/docs">Docs</a>
          <a href="/publish">Publish</a>
          {accountEnabled ? <a href="/saved">Saved</a> : null}
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        <span>OPEN SOURCE / 2026</span>
      </div>
    </footer>
  );
}

export function SiteShell({ children, className, showFooter = true }: { children: ReactNode; className: string; showFooter?: boolean }) {
  return (
    <main className={`site-shell ${className}`}>
      <SiteNav />
      <div className="site-shell-body">{children}</div>
      {showFooter ? <SiteFooter /> : null}
    </main>
  );
}

export function NotFoundPage() {
  return (
    <SiteShell className="not-found-page">
      <section className="not-found">
        <p className="eyebrow">404 / OUTCOME NOT FOUND</p>
        <h1>This outcome is<br /><em>not here.</em></h1>
        <a className="button-link" href="/#discover">Browse Outcomes <span>→</span></a>
      </section>
    </SiteShell>
  );
}
