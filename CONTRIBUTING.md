# Contributing to Possible

Possible publishes six stable Outcome Packs: Hardware Launch, Robot Prototype, Playable Web Game, Web Presentation, Software Opportunity Discovery and Developer Project Launch. Additional packs remain experimental in the registry and are not part of the primary catalog. Contributions may improve either group, but a pack becomes stable only after a preserved end-to-end run and independent verification.

A pack contribution must:

- state one user outcome and explicit non-scope;
- name every external skill, repository, and reviewed revision;
- group skills into independent workstreams with isolated ownership;
- define captain integration order and a fresh verification pass;
- preserve approval gates for external actions;
- generate deterministic install commands and one runnable prompt; and
- include tests for sources, required skills, outputs, guardrails, and proof.

Do not add a pack merely to grow a catalog. Every pack must prove a complete outcome contract. Do not call an upstream revision pinned unless the installer actually resolves that revision.

Run `npm run check` before handing off a change.
