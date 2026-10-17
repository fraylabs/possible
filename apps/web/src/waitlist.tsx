"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { convexSiteUrl } from "./backend";
import { validUtm } from "../../../convex/visitValidation";

type WaitlistStatus = "idle" | "sending" | "joined" | "invalid" | "error";

export function WaitlistForm({ agent = "" }: { agent?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const site = convexSiteUrl();
    if (!site) return setStatus("error");
    const utmSource = new URL(window.location.href).searchParams.get("utm_source") ?? "";
    setStatus("sending");
    try {
      const response = await fetch(`${site}/api/waitlist`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), agent, source: validUtm(utmSource) ? utmSource : "" }),
        credentials: "omit", referrerPolicy: "no-referrer",
      });
      setStatus(response.ok ? "joined" : response.status === 400 ? "invalid" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "joined") return <p className="waitlist-message" role="status">You're on the list. We'll email you when hiring opens.</p>;
  return (
    <form className="waitlist" onSubmit={submit}>
      <div className="waitlist-row">
        <input type="email" name="email" aria-label="Email address" placeholder="you@example.com" autoComplete="email" required maxLength={254}
          value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Joining…" : "Join the waitlist"}</button>
      </div>
      {status === "invalid" ? <p className="waitlist-error" role="alert">That email address doesn't look right. Check it and try again.</p> : null}
      {status === "error" ? <p className="waitlist-error" role="alert">We couldn't add you right now. Try again shortly.</p> : null}
      <p className="waitlist-note">We'll only email you about hiring opening. No sharing, unsubscribe anytime.</p>
    </form>
  );
}
