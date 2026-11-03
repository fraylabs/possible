// The demo film: a buyer runs the Browser Game Maker in their own Claude Code. Silent, so it can autoplay.
export function DemoFilm({ caption }: { caption: string }) {
  return (
    <figure className="demo-film">
      <video src="/media/possible-demo.mp4" poster="/media/possible-demo-poster.png" width={1920} height={1080} autoPlay muted loop playsInline preload="metadata" aria-label={caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
