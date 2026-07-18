## Technical handoff

### Architecture decision

Use React Three Fiber over Three.js’s stable WebGL renderer, with WebGL2 as the real-time baseline. Do not make WebGPU part of V1; it adds compatibility risk without helping this modest product scene. Keep the renderer behind a replaceable `ProductViewer` boundary so direct Three.js remains an escape hatch if the representative spike exposes React lifecycle or frame-loop problems.

Support the latest two stable desktop Chrome, Edge, Firefox, and Safari releases; current and previous iOS Safari; and current Android Chrome, Firefox, and Samsung Internet. Devices that cannot create or retain a WebGL2 context receive the full non-3D experience.

### Implementation shape

- Keep configuration in ordinary serializable React state: `{ enclosureColor, standStyle }`. Native HTML controls own that state; the scene only renders it. Derive the textual summary from the same state so visual and accessible output cannot diverge.
- Represent stand styles as alternative meshes and colors as validated material variants. Use one production-like GLB, compressed with Meshopt or Draco, KTX2-compressed textures, baked lighting/AO, and no expensive real-time shadows. Cap device pixel ratio at 1.5 on mobile.
- Lazy-load the viewer after the controls and static preview are usable. Use an on-demand frame loop: render when configuration, camera, size, or controls change, then stop. Pause while offscreen or when the document is hidden; dispose GPU resources on unmount.
- Constrain orbit controls to useful azimuth, elevation, and zoom ranges. Support pointer and touch gestures, but also provide visible native buttons for rotate left/right/up/down, zoom in/out, and reset view.
- Keep the canvas out of the accessibility tree because every operation has an HTML equivalent. Present a persistent summary such as “Blue enclosure with pedestal stand,” with a polite live region for selector changes. Use text labels rather than color alone, visible focus, adequate contrast, and touch targets of at least 44 CSS pixels.
- Ship a pre-rendered responsive image for every selectable configuration. Show it initially and retain it if WebGL capability checks fail, the 3D chunk or model fails, or the context is lost. The selectors, camera-equivalent static views, textual summary, and purchase flow must continue to work. Offer a non-blocking “Retry 3D” action.

### Architecture-commit spike

Build one throwaway vertical slice using the actual complexity: all colors and stands, production-like geometry and textures, loading UI, orbit/zoom, textual summary, and static fallback. A cube demo is not representative evidence.

Commit to the architecture only if the production build passes these checks:

1. **Correctness:** every allowed configuration maps to the right mesh, material, static image, and exact summary. Invalid values resolve safely. Selection persists through viewer failure, resize, and fallback transitions.
2. **Browser/device matrix:** run the complete route on at least one mid-range Android phone, one current iPhone, and desktop representatives from every supported engine. Verify cold load, rotate, pinch/zoom, buttons, orientation changes, background/restore, resize, and route unmount/remount with no console or asset errors.
3. **Accessibility:** automated axe checks plus keyboard-only testing; VoiceOver on iOS/Safari, TalkBack on Android/Chrome, and NVDA on Windows/Firefox or Chrome. Confirm control names/order, focus visibility, live-summary behavior, zoom alternatives, reduced-motion behavior, and full fallback usability.
4. **Failure injection:** block WebGL, force context loss, return 404s for the renderer chunk, GLB, and textures, and simulate decoder failure. Each case must expose the static preview and working configuration controls without an error loop or blank region.
5. **Performance gates:** incremental 3D JavaScript no more than 250 KiB Brotli; complete viewer assets no more than 1.5 MiB compressed; controls/LCP within 2.5 seconds and 3D usable within 5 seconds on the reference phone at 4 Mbps/100 ms RTT. During continuous orbit, require p95 frame time at or below 33 ms on the phone and 16.7 ms on the reference desktop, with no long tasks caused by a selector change.
6. **Lifecycle and stability:** no monotonic memory growth over 20 mount/unmount cycles; context loss recovers or falls back; repeated variant changes do not recreate textures/materials; hidden tabs stop rendering.
7. **Visual acceptance:** fixed-camera screenshots for every configuration at desktop and mobile aspect ratios, checked for clipping, incorrect materials, lighting regressions, and fallback parity.

If only asset or frame budgets fail, optimize geometry, textures, lighting, and DPR and rerun the same spike. If React integration remains the measured cause after those fixes, retain the interface and implement its internals with direct Three.js.

Basis: Possible’s *3D renderer selection*, *3D web experiences*, *3D runtime verification*, *React Three Fiber*, and *Three.js* guides (all reviewed 2026-07-17), supported by [Three.js fundamentals](https://threejs.org/manual/en/fundamentals.html), [Three.js WebGPU renderer guidance](https://threejs.org/manual/en/webgpurenderer.html), and the [React Three Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction), support a conservative WebGL baseline and representative-scene verification. Possible returned no directly relevant accessibility, mobile-budget, or progressive-enhancement guide; those acceptance details above are project-specific recommendations.
