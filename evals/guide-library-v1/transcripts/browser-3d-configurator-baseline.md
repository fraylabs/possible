## Recommended architecture

Use Three.js through `@react-three/fiber`, with selected helpers from `@react-three/drei`. Keep WebGL2 as the production rendering baseline; do not make WebGPU the primary path yet. Pin the renderer versions after validation rather than tracking floating releases.

Treat configuration as ordinary React application state, independent of the renderer:

```ts
type Configuration = {
  enclosureColor: ColorId;
  standStyle: StandStyleId;
};
```

The option controls, 3D scene, textual summary, analytics events, and fallback preview must all derive from this single state. The renderer must never become the source of truth. Put catalog labels, allowed combinations, material mappings, and asset references in one typed configuration table.

## Rendering and assets

- Author the product as glTF/GLB. Use a shared enclosure mesh and interchangeable stand meshes where practical, rather than one complete model per combination.
- Give configurable materials and attachment nodes stable exported names, then validate those names during the asset build.
- Compress geometry with Meshopt and textures with KTX2/Basis after measuring decoder cost. Keep a plain compatible asset available during the spike so compression failures are distinguishable from rendering failures.
- Clone configurable materials before changing color; do not mutate a shared imported material accidentally.
- Use baked lighting or a simple environment map, one key light if needed, and no post-processing. Avoid real-time shadows unless representative-device measurements justify them.
- Cap device pixel ratio, initially at `Math.min(devicePixelRatio, 1.5)`, lower quality while the camera is moving if necessary, pause rendering when offscreen or when the page is hidden, and dispose of GPU resources on unmount.
- Use constrained orbit controls: horizontal rotation, limited vertical orbit and zoom, no pan, sensible initial framing, and reset-view support. Support mouse, touch gestures, keyboard-accessible rotate/zoom buttons, and orientation changes.
- Lazy-load the entire 3D implementation and model after the product controls and summary are usable. Show a correctly sized poster placeholder to prevent layout movement.

## Accessibility and useful degradation

Keep the canvas out of the accessibility tree and expose the experience through semantic HTML. Use native buttons, radio groups, or selects for the options, with visible focus and adequate touch targets. Place a concise summary beside the viewer, for example: “Configured with a graphite enclosure and pedestal stand.” Update it from the same configuration state and announce deliberate option changes through a polite live region without announcing every camera movement.

Provide explicit Rotate left, Rotate right, Zoom in, Zoom out, and Reset view controls. Respect reduced-motion preferences by disabling animated transitions and automatic rotation.

Run a WebGL2 capability check before downloading renderer code. Also handle model-load errors, decoder failures, WebGL context loss, render exceptions, and an interaction-readiness timeout. In every such case, retain fully functional selectors and the textual summary, and replace the canvas with a pre-rendered image for the selected combination. If maintaining every image combination is impractical, use one image per stand style plus a clear color swatch and label. The fallback is a supported presentation, not an error page.

## Representative checks before committing

Build a disposable vertical slice using the real heaviest expected model, every color, and every stand style. Do not approve the architecture using placeholder geometry alone.

Acceptance checks:

- Verify current stable Chrome, Edge, Firefox, and Safari on desktop; current Chrome on Android and Safari on iOS. Include at least one ordinary 4 GB Android phone, one recent non-Pro iPhone, and an integrated-GPU laptop. Emulation supplements but does not replace physical-device testing.
- On a throttled Fast 4G profile, require the non-3D controls and summary to remain usable immediately, LCP at or below 2.5 seconds, no layout shift from viewer activation, and an interactive model within 5 seconds for the representative asset. Set the final asset and lazy-chunk budgets from the measured spike; an initial target is a compressed model package no larger than 3 MB.
- Require at least 30 fps during orbit on the weakest target phone, no repeatable multi-second main-thread stall, stable memory across ten mount/unmount cycles, and acceptable thermals during five minutes of interaction.
- Test every configuration transition, rapid option changes during loading, resize and orientation changes, zoom limits, camera reset, background/foreground transitions, and WebGL context loss and restoration.
- Force each degradation route: no WebGL2, failed model request, failed decoder, render exception, context loss, and slow-load timeout. Each must preserve selection, summary, and a meaningful static preview.
- Run unit tests for configuration-to-asset/material/summary mappings, including invalid IDs and unsupported combinations. Use browser tests for controls and fallback behavior; use a small set of deterministic screenshots for geometry and material regressions.
- Complete keyboard-only testing, automated accessibility checks, and manual VoiceOver and NVDA checks. Confirm focus order, labels, live-region behavior, contrast, touch target size, zoom at 200%, and reduced-motion behavior.

Commit to React Three Fiber only if this slice passes the device, performance, resilience, and accessibility gates without renderer-specific workarounds leaking into product state. If bundle or scheduling overhead is the only miss, retain the same state and asset contracts and test a thin direct-Three.js adapter. No repository edits or deployment are included in this handoff.
