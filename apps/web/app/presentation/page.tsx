import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Visual explainer",
  description: "A coded presentation explaining Possible.sh, Outcome Packs, agent skills, and the $possible skill.",
  path: "/presentation",
});

export default function PresentationPage() {
  return (
    <main style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: "#111" }}>
      <iframe
        src="/presentation/possible.html"
        title="Possible.sh visual explainer"
        allow="fullscreen"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />
    </main>
  );
}
