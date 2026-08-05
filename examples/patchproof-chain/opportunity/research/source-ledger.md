# Dated source ledger

**Research date:** 2026-07-22  
**Mode:** accessible public evidence; no outreach or account access

The ledger records what each source can support and what it cannot. Product pages establish competitor capabilities, not demand. Community and survey evidence is directional and does not prove willingness to pay.

| ID | Source and date | Evidence used | Limits / bias |
|---|---|---|---|
| S01 | [Stack Overflow 2025 Developer Survey — AI](https://survey.stackoverflow.co/2025/ai), fielded 2025-05-29 to 2025-06-23 | Among survey respondents, 66% cited AI answers that were almost right as a frustration, 45% cited added debugging time, and 75% would still ask a person when they did not trust an AI answer. | Stack Overflow recruited mainly through its own channels; not a representative market-sizing sample. |
| S02 | [Stack Overflow survey methodology](https://survey.stackoverflow.co/2025/methodology/), 2025 | 49,009 retained responses from 177 countries; documents recruitment and selection bias. | Methodology context only. |
| S03 | [GitHub status checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks), retrieved 2026-07-22 | Checks expose pass/fail states, but skipped jobs are treated as success and checks depend on configured external processes. | Describes GitHub behavior, not user dissatisfaction. |
| S04 | [GitHub Copilot agent sessions](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents), retrieved 2026-07-22 | Copilot retains session logs, links commits to sessions, and can answer what changed and was validated; local session querying depends on cloud sync being enabled. | Product documentation; establishes an incumbent capability and boundary. |
| S05 | [Agentwatch](https://agentwatch.run/), retrieved 2026-07-22 | Competing product records agent actions out of band and compares claims with actions. | Vendor claim; no independent adoption or accuracy evidence collected. |
| S06 | [PipeLab action receipts](https://pipelab.org/learn/agent-action-receipts/), published 2026-05-21 | Competing approach signs hash-chained action receipts captured through an MCP proxy. | Vendor-authored; enterprise/security orientation is inferred from its stated workflow. |
| S07 | [h5i](https://h5i.dev/), retrieved 2026-07-22 | Competing approach records prompts, commands, logs, reviews, and verifier results in versioned workspaces. | Vendor-authored; feature existence only. |
| S08 | [GitHub README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), retrieved 2026-07-22 | GitHub says a README is often the first repository item visitors see and should explain usefulness and getting started. | Normative guidance, not proof that docs are stale. |
| S09 | [GitHub community profiles](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories), retrieved 2026-07-22 | GitHub checks whether recommended files such as README, LICENSE, and CONTRIBUTING exist. | Mostly presence checks; does not validate cross-file truth. |
| S10 | [npm package.json documentation](https://docs.npmjs.com/files/package.json/), retrieved 2026-07-22 | npm defines license metadata and includes README/LICENSE in packages, creating cross-file contracts worth checking. | Specification evidence, not frequency of mismatch. |
| S11 | [Next.js environment-variable guide](https://nextjs.org/docs/app/guides/environment-variables), updated 2026-03 | Public-prefixed values are inlined at build time and runtime behavior differs; setup truth spans code, docs, and deployment context. | Framework-specific. |
| S12 | [Vite environment-variable guide](https://vite.dev/guide/env-and-mode), retrieved 2026-07-22 | `VITE_` values are client-exposed and mode-specific files have precedence rules. | Framework-specific. |
| S13 | [Driftless](https://driftlessx.dev/), retrieved 2026-07-22 | A current competitor analyzes repository files to generate and update README content. | Vendor claims; strong overlap makes generic README drift a crowded entry point. |
| S14 | [EnvDrift](https://envdrift.tinyship.ai/), retrieved 2026-07-22 | A current competitor scans code, docs, CI, and environment configuration for mismatches. | Vendor claims; directly crowds a narrow environment-drift product. |
| S15 | [RepoReady](https://claudeers.com/repo-ready), retrieved 2026-07-22 | A current CLI checks agent instructions, validation commands, README quality, CI, and safety. | Aggregator page, not independent adoption evidence; substantial overlap with repository-readiness scoring. |
| S16 | [OpenAPI examples issue in Swagger UI](https://github.com/swagger-api/swagger-ui/issues/9045), opened 2023-07-20 | A concrete example shows version-dependent mismatch between an OpenAPI example and its rendered documentation; the issue received multiple reactions. | One tool/version issue, not market size. |
| S17 | [IBM service-validator](https://github.com/IBM/service-validator), retrieved 2026-07-22 | Existing tooling validates an implementation against OpenAPI and uses examples to generate requests. | Mature alternative narrows whitespace. |
| S18 | [OpenAPI schema discussion](https://github.com/OAI/OpenAPI-Specification/issues/4870), opened 2025-08-14 | Maintainers discuss that schemas cannot cover every prose constraint and may conflict with the specification. | Standards-maintainer discussion, not user demand. |
| S19 | [GitHub-hosted runners](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job), retrieved 2026-07-22 | Standard jobs execute on fresh runner instances, creating a real environment boundary from a developer laptop. | Platform fact only. |
| S20 | [`act`](https://github.com/nektos/act), release 0.2.88 on 2026-05-01 | Mature tool runs GitHub Actions locally for faster feedback. | Strong incumbent; local execution does not perfectly prove hosted parity. |
| S21 | [`actionlint`](https://github.com/rhysd/actionlint/blob/main/README.md), retrieved 2026-07-22 | Mature static checker catches GitHub Actions syntax, expression, action-input, shell, and security errors. | Strong incumbent; addresses workflow files rather than full runtime parity. |

## Evidence quality summary

- **High confidence:** developers rely on configured checks but the meaning of “pass” is bounded; AI-assisted work creates a trust and debugging burden among the surveyed population; mature point tools already cover repository hygiene, OpenAPI checks, and GitHub Actions syntax/local execution.
- **Medium confidence:** a low-friction, vendor-neutral completion receipt could help reviewers connect an agent’s claims to supplied evidence.
- **Low confidence:** willingness to pay, preferred workflow, and whether users want a standalone browser tool. These require direct user tests.
