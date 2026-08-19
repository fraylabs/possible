import type { OutcomeCatalogEntry } from "@possible/catalog";
import { outcomeHref } from "./public-content";

export function OutcomeCard({ entry, priority = false }: { entry: OutcomeCatalogEntry; priority?: boolean }) {
  const { outcome } = entry;
  const preview = outcome.preview;
  const cover = preview?.images?.find((image) => image.cover) ?? preview?.images?.[0];
  const poster = cover ?? (preview?.video ? { src: preview.video.poster, alt: preview.video.caption ?? `${outcome.title} video poster` } : undefined) ?? (preview?.cad?.poster ? { src: preview.cad.poster, alt: preview.cad.caption ?? `${outcome.title} CAD preview` } : undefined);
  const mediaLabels = [preview?.video ? "VIDEO" : undefined, preview?.cad ? "CAD" : undefined].filter(Boolean);

  return (
    <a className={`library-pack-card ${poster ? "has-media" : "is-text-only"}`} data-variant={entry.catalogNumber % 4} href={outcomeHref(entry)}>
      <div className="library-pack-visual" aria-hidden="true">{poster ? <img className="library-pack-cover" src={poster.src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" /> : null}</div>
      <div className="library-pack-copy">
        <header><span>{String(entry.catalogNumber).padStart(2, "0")}</span><span>{mediaLabels.length ? mediaLabels.join(" + ") : "PROMPT"}</span><i>↗</i></header>
        {entry.products.length ? <div className="library-pack-product">USES {entry.products.map(({ name }) => name).join(" + ")}</div> : null}
        <h3>{outcome.title}</h3>
        <p>{outcome.summary}</p>
        <div className="library-pack-fit"><strong>EXACT PROMPT</strong><span>Copy it, adapt the details, and give it to your agent.</span></div>
      </div>
    </a>
  );
}
