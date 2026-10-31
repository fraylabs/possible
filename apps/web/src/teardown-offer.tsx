// Empty until the payment link is live; the Buy button shows "Opening soon" and stays disabled.
export const TEARDOWN_PAYMENT_LINK = "";

const delivers = [
  ["The teardown.", "About 1,500 words covering channels, the growth engine, funnel and pricing, and how their positioning changed over time. Every fact is cited."],
  ["A channel scorecard.", "Each channel is rated 0–3 on public evidence, with what we saw and where."],
  ["Them vs you.", "Their funnel side by side with yours."],
  ["Steal this playbook.", "5–10 moves ranked for your budget, each with a first step and a number to watch."],
  ["Unknowns, and how to check them.", "What public evidence can't show (ad spend, conversion rates), so you don't mistake a guess for a fact."],
  ["The evidence file.", "Every source URL behind every citation."],
];

const steps = [
  ["Pay and answer three questions", "Which competitor (a website or app store link), what your product is and who you sell to, and what you want to decide."],
  ["An AI analyst does the research", "It collects public evidence with REM (open source, MIT) and writes the report. Every citation is checked before the report is sent."],
  ["Get it by email", "You get the report and the evidence file by email."],
];

const samples = [
  ["How Lovable gets customers", "/outcomes/how-lovable-gets-customers/"],
  ["How Cursor gets customers", "/outcomes/how-cursor-gets-customers/"],
  ["How Granola gets customers", "/outcomes/how-granola-gets-customers/"],
];

const faq = [
  ["Is it written by AI?", "Yes, by an AI analyst agent working from public sources. Every claim links to its evidence so you can verify it."],
  ["Can I order several competitors?", "Order one teardown per competitor."],
  ["What if my competitor is tiny?", "We'll tell you if there's too little public evidence, and refund you."],
];

export function TeardownOffer({ priceUsd }: { priceUsd: number }) {
  return (
    <>
      <section className="agent-section teardown-offer" aria-labelledby="teardown-heading">
        <h2 id="teardown-heading">How does your competitor actually get customers?</h2>
        <p className="agent-note">Send us one competitor. Within 2 business days you get a teardown of every channel they use (paid, SEO and AI search, community, launches, funnel and pricing), every claim linked to its public source, and a ranked list of 5–10 moves for your product.</p>
        <div className="teardown-price">
          <p><strong>US${priceUsd}</strong>, one competitor, one report.</p>
          {TEARDOWN_PAYMENT_LINK
            ? <a className="teardown-buy" href={TEARDOWN_PAYMENT_LINK}>Get a teardown</a>
            : <button className="teardown-buy" type="button" disabled>Opening soon</button>}
          <p className="teardown-guarantee">If we can't find enough public evidence to answer your question, we refund you in full.</p>
        </div>
      </section>

      <section className="agent-section" aria-labelledby="agent-delivers-heading">
        <h2 id="agent-delivers-heading">What you get</h2>
        <ul className="agent-list">{delivers.map(([title, text]) => <li key={title}><strong>{title}</strong> {text}</li>)}</ul>
      </section>

      <section className="agent-section" aria-labelledby="agent-how-heading">
        <h2 id="agent-how-heading">How it works</h2>
        <ol className="agent-steps">{steps.map(([title, text], index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="agent-section" aria-labelledby="teardown-samples-heading">
        <h2 id="teardown-samples-heading">Samples (free to read)</h2>
        <ul className="agent-list">{samples.map(([title, href]) => <li key={href}><a href={href}>{title}</a></li>)}</ul>
      </section>

      <section className="agent-section" aria-labelledby="agent-limits-heading">
        <h2 id="agent-limits-heading">Limits</h2>
        <p className="agent-note">Public evidence only: no logins, no paid ad-library tools, and no spend figures a source doesn't state. Anything we couldn't see is marked unknown, with a link so you can check it yourself.</p>
      </section>

      <section className="agent-section" aria-labelledby="teardown-faq-heading">
        <h2 id="teardown-faq-heading">FAQ</h2>
        <dl className="agent-brief">{faq.map(([question, answer]) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl>
      </section>
    </>
  );
}
