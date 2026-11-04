import paymentLinks from "./payment-links.json" with { type: "json" };
import { RUNS_IN } from "./agents-data";

// The Buy switch: one Stripe Payment Link per agent slug, plus "all" for the bundle. While a link is
// empty its Buy button reads "Opening soon" and stays disabled, and no download page is built for it.
export function paymentLink(slug: string): string {
  return (paymentLinks as Record<string, string>)[slug] ?? "";
}

export function BuyBox({ slug, priceUsd, label, what }: { slug: string; priceUsd: number; label: string; what: string }) {
  const link = paymentLink(slug);
  return (
    <div className="buy-box">
      <p><strong>US${priceUsd}</strong> {what}</p>
      {link
        ? <a className="buy-button" href={link}>{label}</a>
        : <button className="buy-button" type="button" disabled>Opening soon</button>}
      <p className="buy-note">One payment, then you download it. It runs on your own machine, in {RUNS_IN.join(" or ")}, with your own subscription.</p>
      {link ? <p className="buy-terms">By buying, you agree to our <a href="/terms/">Terms</a> and <a href="/refunds/">Refund Policy</a>. Your purchase is sold through Link, a Stripe company, which takes your payment.</p> : null}
      <p className="buy-legal"><a href="/terms/">Terms</a> · <a href="/refunds/">Refunds</a> · <a href="/privacy/">Privacy</a></p>
    </div>
  );
}
