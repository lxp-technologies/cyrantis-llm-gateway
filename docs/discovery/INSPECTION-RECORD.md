# PR00 inspection record

Inspection date: 2026-10-25. These are local working-tree observations, not claims about GitHub `main` or a deployed service. The review sampled implementation paths; it was not a complete code, license, dependency, or security audit.

## Repository snapshots

| Reference | Local repository | Branch | HEAD | Initial status |
| --- | --- | --- | --- | --- |
| LXP | `C:/Data/Workspace/TypeScript/lxp-llm-gateway` | `feature/provider-token-improvement` | `26b15b0` | Clean |
| PGS | `C:/Data/Workspace/TypeScript/presence-grounding-service` | `feature/evaluator-gateway-adapter` | `c4bf25c` | Clean |
| WEB | `C:/Data/Workspace/TypeScript/public-website` | `feature/pr9` | `9384713` | Clean |

Destination: existing `C:/Data/Workspace/cyrantis/cyrantis-llm-gateway`, branch `chore/init`. At the first discovery pass its changes included modified `.gitignore`, staged/modified `documentation/pr-00-init-discovery.md`, and untracked `.idea/`. At this architecture revision, the input briefs are `docs/pr-00-discovery-architecture-plan.md` and `docs/pr-00-adr-update.md`; the latter was already staged/modified, and `docs.zip` and the earlier planning artifacts were also present. Preserve those input briefs and unrelated local changes. `projects/` exists and is ignored; no application files were found there during the initial directory inspection.

Git required a command-local `-c safe.directory=<absolute repository path>` due to the sandbox user differing from the repository owner. No global Git configuration was changed.

## Evidence references

Paths below are relative to the matching reference repository. Numbered references are used in the assessments. Some large files were read in selected ranges or searched for relevant symbols; this list does not imply every line was reviewed.

| ID | Inspected artifacts | Evidence used |
| --- | --- | --- |
| L1 | `AGENTS.md`, root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` importer entries; Gateway, Console, and OpenAI adapter manifests | Workspace, versions, package boundaries and scripts |
| L2 | `packages/provider-sdk/src/index.ts`, `provider-testkit.ts`, `image-reference-utils.ts`; `packages/contracts/src/index.ts` | Adapter surface, byte streams, content types, field mapping obligations, SSRF helpers |
| L3 | `packages/provider-{openai,anthropic,google,openrouter,nanogpt}/src/index.ts`; Google image catalog header; capabilities/class declarations across the other adapter entrypoints; OpenRouter test cases | Native/aggregator chat and media differences, output limits, JSON and reasoning mapping |
| L4 | `apps/gateway-api/src/gateway/{gateway.module,provider-registry.service,provider-registry-bootstrap.service,gateway.service,provider-credential.service,tenant-policy.service}.ts` | Composition, fallback, credentials, policy admission and reservations |
| L5 | `apps/gateway-api/src/auth/gateway-auth.service.ts`, `security/encryption.service.ts`, `persistence/tenant-rls.service.ts`; RLS migration `1713000000010-EnableByokCredentialRowLevelSecurity.ts`; RLS declarations in other migrations | Auth paths, encrypted secret resolution, RLS context and policy coverage candidates |
| L6 | `apps/gateway-api/src/evaluations/{evaluation.controller,evaluation.service}.ts`; `openai-compatible/openai-compatible.controller.ts`; related test declarations | Evaluation auth/scopes, OpenAI facade and stream handling |
| L7 | `apps/admin-web/src/app/router.tsx`, navigation declarations in `components/app-shell-layout.tsx`; page sizes; Gateway and adapter test declarations | Labs/navigation, complexity indicators, available tests rather than executed coverage |
| L8 | `infra/compose/docker-compose.vps.yml`, `infra/proxy/caddy/lxp-gateway.Caddyfile.example`, `.github/workflows/backend-build.yml`, Gateway `main.ts` | Compose topology, health/migrations, proxy, CI and validation/CORS defaults |
| L9 | Root `LICENSE`, OpenAI adapter manifest; repository-wide LICENSE/NOTICE filename search; latest commit metadata | Apache 2.0 identification; limited provenance evidence, not reuse clearance |
| L10 | Both `apps/{admin-api,gateway-api}/src/persistence/entities/tenant-policy.entity.ts` and `persistence/tenant-rls.service.ts`; database credential aliases in `infra/compose/docker-compose.vps.yml` | Follow-up review: differing video policy fields, transaction-local tenant context/advisory lock, repeated runtime/migration connection settings; deployed grants unverified |
| P1 | Root/API `package.json`, Prisma schema header, migration directory inventory, root README/docs file inventory | Workspace ecosystem, contracts and persistence structure |
| P2 | `apps/api/src/evaluation/{lxp-llm-gateway-evaluation.provider,environment-evaluation-gateway-credential.resolver,evaluation.service}.ts`; adapter tests sampled | Bounded remote transport, tenant key lookup, failure categories, sealed configuration |
| P3 | `packages/contracts/src/index.ts` evaluation schemas; `openapi/openapi.yaml` header; `docs/architecture/remote-evaluation-provider.md` | Schema/profile versions, strict evidence, API version and stated deployment gap |
| P4 | `apps/api/src/security/authorization.guard.ts`, `persistence/prisma.service.ts`, runtime/capability decision service symbols; runtime migration sampled; application-role integration test declarations | Default-deny audience policy, transaction-local tenant context, separate decisions and expiry |
| P5 | `.github/workflows/ci.yml`, `apps/api/test` inventory | Real PostgreSQL role test setup, immutable action pins, test and boundary-check commands |
| W1 | Root/web `package.json`, lockfile importer entries, `README.md` | Static workspace and declared tooling; README not treated as runtime proof |
| W2 | `apps/web/src/routing/route-registry.ts`, `routes/llm-gateway-page.tsx`, typed `content/products-content.ts`, `content/en/{products,product,docs}.ts` excerpts/searches | Existing Gateway/PGS routes and editorial boundaries |
| W3 | `apps/web/src/routes/product-catalog-pages.test.tsx`, `.github/workflows/ci.yml`, `seo/metadata.ts`, `components/site-header.tsx`; UI/source inventory | Tests present, localized navigation and client metadata, CI baseline |

Only LXP had a repository `AGENTS.md` in the reference searches. No ancestor `AGENTS.md` was found in the tested workspace ancestry. Tests, migrations, provider traffic, builds, Docker, database behavior, browser flows, and restore drills were **not executed** in the reference repositories.

## Release research and limitations

Read public npm `latest` metadata for Nest, React, Mantine, Vite, TypeScript, pnpm, Turbo, and TanStack Query. Read official Node release/security information, Nest/Vite migration requirements, PostgreSQL RLS documentation, OWASP baselines, and Vite/Valkey advisory indexes. See the [stack assessment](../planning/STACK-ASSESSMENT.md) for links and exact observations.

Local Node reported `v22.23.2`; readable root TypeScript packages in LXP and WEB reported `5.9.3`. Several linked `node_modules` package files were inaccessible to the sandbox; those installed versions remain unverified. Manifests and lockfiles are distinct evidence from installed versions. No dependency installation or reference-repository test commands were used.

No complete transitive advisory or license scan, provider documentation certification, provider credentialed test, VPS inspection, DNS verification, or legal review was performed. Uncertain capabilities remain unknown or adapter-only observations.

## Architecture revision review

Read both PR00 input briefs and every Markdown document in `docs/`, plus repository instructions, README and PR template. The update supersedes the initial single-API recommendation; source briefs remain unchanged. Active plans now use two apps, canonical core/TypeORM definitions, separate runtime grants and a dedicated migration job. Reference evidence L10 was inspected read-only to substantiate entity drift and configuration reuse, not inferred from prior plans.

Checked primary guidance on [PostgreSQL RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html), [security-definer functions](https://www.postgresql.org/docs/18/sql-createfunction.html), [TypeORM migrations](https://v0.typeorm.io/docs/migrations/setup/), [transaction managers](https://orkhan.gitbook.io/typeorm/docs/transactions), [JWT best practices](https://www.rfc-editor.org/rfc/rfc8725.html), [secrets lifecycle](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) and [probe semantics](https://kubernetes.io/docs/concepts/workloads/pods/probes/). These support design constraints, not an executed Cyrantis compliance result. The initial package-release observations were not revalidated as a new dependency matrix during this architecture pass.

New controls, suggested token/lease bounds and key-service choice are design proposals requiring implementation evidence. Checks from that revision are superseded by the latest finalization results recorded in [PR00 review](../planning/PR00-REVIEW.md). No reference tests, installs, provider calls, migrations, app code or deployment were performed in this revision.

## Focused PR00 finalization

Read `docs/pr-00-finalize.md`, current repository guidance/template and the installed `pr-explainer` skill with architecture/security/tenant/enterprise/UX guidance. Reviewed the complete current docs set, retaining the three input briefs unchanged. This pass preserves accepted topology; it refines PR sizes, French PR explanations, individual BYOK ownership and review verdicts. No new reference-source audit or claim of independent third-party validation is made.

The source workspace started this pass on `chore/init` with modified `.gitignore`, staged/modified ADR/finalization briefs, staged discovery brief, untracked authored documentation/template and `docs-v2.zip`. Preserve unrelated content and index state. Rechecked primary [PostgreSQL RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) and [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) guidance for tenant/owner boundaries; package versions were not refreshed or installed. Validation commands/results and explicitly unrun runtime checks are in the [French final report](../planning/PR00-REVIEW.md).
