import type { PublicCatalogEntry } from "@possible/packs";
import { getPackShowcase, packHref } from "./public-content";

export function LibraryPackCard({ entry, priority = false }: { entry: PublicCatalogEntry; priority?: boolean }) {
  const { pack } = entry;
  const showcase = getPackShowcase(entry);
  const cover = showcase?.images?.find((image) => image.cover) ?? showcase?.images?.[0];
  const poster = cover ?? (showcase?.video ? { src: showcase.video.poster, alt: showcase.video.caption ?? `${pack.name} video poster` } : undefined) ?? (showcase?.cad?.poster ? { src: showcase.cad.poster, alt: showcase.cad.caption ?? `${pack.name} CAD preview` } : undefined);
  const mediaLabels = [showcase?.video ? "VIDEO" : undefined, showcase?.cad ? "CAD" : undefined].filter(Boolean);

  return (
    <a className={`library-pack-card ${poster ? "has-media" : "is-text-only"}`} data-variant={entry.catalogNumber % 4} href={packHref(entry)}>
      {poster ? <div className="library-pack-visual" aria-hidden="true"><img className="library-pack-cover" src={poster.src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" /></div> : null}
      <div className="library-pack-copy">
        <header><span>{String(entry.catalogNumber).padStart(2, "0")}</span><span>{mediaLabels.length ? mediaLabels.join(" + ") : "OUTCOME"}</span><i>↗</i></header>
        {entry.products.length ? <div className="library-pack-product">FOR {entry.products.map(({ name }) => name).join(" + ")}</div> : null}
        <h3>{pack.name}</h3>
        <p>{pack.promise}</p>
        <div className="library-pack-fit"><strong>{pack.expectations?.length ? "FINISHED WHEN" : "DIRECT OUTCOME"}</strong><span>{pack.expectations?.[0] ?? "One exact prompt, ready to copy and run."}</span></div>
      </div>
    </a>
  );
}
