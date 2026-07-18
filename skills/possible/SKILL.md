---
name: possible
description: Compile ambitious outcomes from reviewed sets of existing Codex skills. Use when someone asks for a Possible pack, Hardware Launch, Software Launch, Open-Source Release, or wants one goal turned into install commands, parallel workstreams, integration order, guardrails, and verification.
---

# Possible

Possible is the recipe, not the ingredient registry. It selects inspectable external skills and compiles them into an outcome contract.

## Use a pack

1. Call `list_packs` when the requested outcome is not exact.
2. Select the narrowest matching pack:
   - `hardware-launch` for a physical product needing a site, film, prototype CAD, and waitlist.
   - `software-launch` for an app needing product work, a launch site, demo film, and deployment readiness.
   - `open-source-release` for a repository needing packaging, documentation, examples, hardened CI, and a release plan.
3. Call `compile_pack` with the chosen slug.
4. Show the user the selected skills, repositories, reviewed revisions, and install commands before installing anything.
5. Explain that reviewed revisions identify the snapshots Possible inspected, while the generated Skills CLI commands resolve external repositories at install time. Inspect the resolved skill contents and disclose material differences or conflicts.
6. Install only when the user asked to install or clearly asked to run the pack. Start a fresh Codex session if the installed skills are not visible.
7. Replace the product-brief placeholder with known facts. Do not fabricate missing facts.
8. Follow the compiled captain workflow. Delegate by independent workstream, not one subagent per skill. Give each workstream isolated ownership and a verifier.
9. Integrate only after workstream receipts return. Use a fresh verification subagent after integration and report passed, failed, skipped, and unproven checks.

## Boundaries

- A pack never authorizes credentials, deployment, DNS changes, email, purchases, spending money, fabrication, outreach, publishing, or collection of real customer data.
- Do not claim customer demand, physical validation, certification, security, compatibility, or production readiness without direct evidence.
- Preserve unrelated user work and obey the repository's local instructions.
- If a named skill is missing, stop and identify it rather than silently approximating it.
- If an external skill conflicts with the user's request, repository instructions, or safety boundary, the higher-priority instruction wins and the conflict must be reported.
