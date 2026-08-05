# Fold — outcome brief

## Promise

Create one polished browser-game loop: steer a paper plane through storm gates, score a point for every clean pass, crash on contact, and retry immediately.

## Player contract

- Understand the goal within five seconds.
- Steer with pointer, touch, WASD, or arrow keys.
- Pause with `P` or the visible control.
- Mute procedural feedback with the visible sound control.
- See explicit ready, playing, paused, and game-over states.

## Scope

Three.js rendering, procedural geometry, deterministic state rules, responsive HUD, scoring, increasing speed, collision, pause, mute, WebGL fallback, and restart.

## Non-scope

Accounts, analytics, multiplayer, an economy, a level editor, paid assets, third-party models, external textures, or deployment beyond the approved Possible site publish.

## Acceptance checks

- A player can start, steer, score, crash, pause, mute, and retry.
- Pointer, touch-sized pointer input, and keyboard controls share the same steering state.
- No third-party game assets are required.
- The production TypeScript and Vite build succeeds.
