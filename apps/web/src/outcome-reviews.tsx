"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";

const reviewsEnabled = process.env.NEXT_PUBLIC_OUTCOME_REVIEWS_ENABLED === "true";

interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}

interface ReviewEntry {
  id: string;
  rating: number;
  body: string | null;
  updatedAt: string;
  isMine: boolean;
}

interface SummaryRow {
  average_rating: number;
  review_count: number;
}

interface ReviewRow {
  review_id: string;
  rating: number;
  body: string | null;
  updated_at: string;
  is_mine: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="outcome-review-stars" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => <i data-filled={star <= Math.round(rating) ? "true" : undefined} aria-hidden="true" key={star}>★</i>)}
    </span>
  );
}

async function readReviews(client: SupabaseClient, outcomeId: string): Promise<{ summary: ReviewSummary; reviews: ReviewEntry[] }> {
  const [summaryResult, reviewResult] = await Promise.all([
    client.rpc("get_outcome_review_summaries", { target_outcome_id: outcomeId }),
    client.rpc("get_outcome_reviews", { target_outcome_id: outcomeId, page_size: 20, page_offset: 0 }),
  ]);
  if (summaryResult.error) throw summaryResult.error;
  if (reviewResult.error) throw reviewResult.error;
  const summaryRow = (summaryResult.data?.[0] ?? null) as SummaryRow | null;
  const rows = (reviewResult.data ?? []) as ReviewRow[];
  return {
    summary: {
      averageRating: Number(summaryRow?.average_rating ?? 0),
      reviewCount: Number(summaryRow?.review_count ?? 0),
    },
    reviews: rows.map((row) => ({
      id: row.review_id,
      rating: Number(row.rating),
      body: row.body,
      updatedAt: row.updated_at,
      isMine: row.is_mine,
    })),
  };
}

export function OutcomeReviews({ outcomeId }: { outcomeId: string | undefined }) {
  const client = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>();
  const [summary, setSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!reviewsEnabled || !client || !outcomeId) return;
    const next = await readReviews(client, outcomeId);
    setSummary(next.summary);
    setReviews(next.reviews);
    const mine = next.reviews.find((review) => review.isMine);
    if (mine) {
      setRating(mine.rating);
      setBody(mine.body ?? "");
    }
  }, [client, outcomeId]);

  useEffect(() => {
    if (!reviewsEnabled || !client) {
      setSession(null);
      return;
    }
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    void refresh().catch(() => setNotice("Reviews could not be loaded."));
  }, [refresh]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!client || !email.trim()) return;
    setBusy(true);
    setNotice("");
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    setNotice(error ? error.message : "Check your email for the sign-in link.");
    setBusy(false);
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!client || !outcomeId || rating === 0) {
      setNotice("Choose a star rating first.");
      return;
    }
    setBusy(true);
    setNotice("");
    const { error } = await client.rpc("submit_outcome_review", {
      target_outcome_id: outcomeId,
      review_rating: rating,
      review_body: body.trim() || null,
    });
    if (error) setNotice(error.message);
    else {
      setNotice("Your review is live.");
      await refresh();
    }
    setBusy(false);
  }

  async function deleteReview() {
    if (!client || !outcomeId) return;
    setBusy(true);
    setNotice("");
    const { error } = await client.rpc("delete_outcome_review", { target_outcome_id: outcomeId });
    if (error) setNotice(error.message);
    else {
      setRating(0);
      setBody("");
      setNotice("Your review was removed.");
      await refresh();
    }
    setBusy(false);
  }

  const mine = reviews.find((review) => review.isMine);

  return (
    <section className="outcome-reviews" aria-labelledby="outcome-reviews-heading">
      <header>
        <div>
          <h2 id="outcome-reviews-heading">Reviews</h2>
          <p>{summary.reviewCount === 0 ? "No reviews yet." : `${summary.reviewCount} ${summary.reviewCount === 1 ? "review" : "reviews"}`}</p>
        </div>
        <div className="outcome-review-summary">
          <strong>{summary.averageRating.toFixed(1)}</strong>
          <Stars rating={summary.averageRating} />
        </div>
      </header>

      {reviews.length ? (
        <div className="outcome-review-list">
          {reviews.map((review) => (
            <article key={review.id}>
              <header><Stars rating={review.rating} /><time dateTime={review.updatedAt}>{new Date(review.updatedAt).toLocaleDateString()}</time></header>
              <p>{review.body ?? "Star rating only."}</p>
            </article>
          ))}
        </div>
      ) : null}

      {!reviewsEnabled ? <p className="outcome-review-unavailable">Reviews will open with the database rollout.</p> : null}

      {reviewsEnabled && session === null ? (
        <form className="outcome-review-signin" onSubmit={signIn}>
          <label><span>Sign in to review</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <button type="submit" disabled={busy}>Email sign-in link</button>
        </form>
      ) : null}

      {reviewsEnabled && session ? (
        <form className="outcome-review-form" onSubmit={submitReview}>
          <fieldset>
            <legend>{mine ? "Update your rating" : "Your rating"}</legend>
            <div>{[1, 2, 3, 4, 5].map((star) => <button type="button" aria-pressed={rating === star} aria-label={`${star} ${star === 1 ? "star" : "stars"}`} onClick={() => setRating(star)} key={star}>★</button>)}</div>
          </fieldset>
          <label><span>Review <small>Optional</small></span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} placeholder="What worked? What should someone know before using this prompt?" /></label>
          <div>
            <button type="submit" disabled={busy}>{mine ? "Update review" : "Publish review"}</button>
            {mine ? <button type="button" disabled={busy} onClick={deleteReview}>Delete</button> : null}
          </div>
        </form>
      ) : null}

      {notice ? <p className="outcome-review-notice" role="status">{notice}</p> : null}
    </section>
  );
}
