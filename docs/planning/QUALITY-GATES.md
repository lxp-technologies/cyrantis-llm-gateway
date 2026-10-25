# Quality gates and evidence policy

Status: required delivery policy. PR01A adds executable workspace checks and a GitHub Actions workflow; [local evidence](../prs/pr-01/pr-01a-review.md) is distinct from unverified hosted CI execution. The PR template/workflow files do not configure repository branch protection. Later-stage checks below remain planned until their owning slices implement them.

## Gates by stage

| Stage | Required evidence | Blocks completion when |
| --- | --- | --- |
| PR00 docs | Requested artifacts, valid local links, explicit facts/proposals/unknowns, scope/whitespace check and unchanged reference status | Missing artifact, unsupported claim, copied private details or unintended source change |
| PR01A workspace | Compatible patched runtime, frozen install, checks/builds and bootstrap/close/404 tests for both APIs, Console render, core/browser/import/cycle boundaries and CI/dependency/license/secret checks | Placeholder green scripts, unsafe dependency/import or missing required check |
| PR01B runtime | Separate OCI image builds, Compose/Caddy validation and real startup/proxy/probe/shutdown with each cache choice; external config, ACL/TTL smoke and image scans | Shared privileged runtime identity, public DB/cache, unsafe proxy routing or untested lifecycle |
| PR02A persistence | Real PostgreSQL RLS/grants/constraints/pooling and migration serialization/failure; supported schema compatibility | Unsafe role, cross-tenant access or missing real-role evidence |
| PR02B human identity | OIDC/session/CSRF negatives, idempotent private-workspace provisioning, active membership and Console login/logout/switch | Forged identity, implicit membership or duplicate/partial provisioning |
| PR02C inference identity | Developer versus service principal, exact-match auth lookup, browser Gateway token/audience/type and key revocation, cross-app privilege negatives | Auth-index enumeration, scope escalation, credential substitution or missing negative evidence |
| SDK/adapter changes from PR03 | Deterministic shared contracts plus provider-specific payload/error/stream fixtures and explicit unsupported fields | Dropped constraint, invented capability, parser/terminal/cancel regression or untested changed mapping |
| PR04A credentials | Key backend grants/tamper/rotation/restore; owner/use-grant HTTP negatives within and across tenants; no provider calls | Secret exposure, personal-to-service fallback, unauthorized ownership transfer or missing key-security proof |
| PR04B durable admission | Real concurrent DB check/reserve/idempotency and policy races, dispatch/unknown/settlement recovery with controlled IO simulation | Oversubscription, duplicate local settlement, unbounded unknown cost or blind paid replay |
| PR04C coordination | Same Redis/Valkey TTL/atomicity/outage suite, two replicas, fencing and measured revocation/active leases | Local-counter fallback, post-expiry sensitive delivery or unsafe lease recovery |
| PR04D execution | Full non-stream HTTP pipeline and preceding gates with real DB/cache, controlled upstream and denial side effects | Any route can dispatch without authorization/credential/admission/settlement controls |
| PR04E streams/onboarding | HTTP/SSE through proxy, backpressure/abort/drain/unknown usage and personal/workspace/service Console E2E | Separate weakened stream path, leaked browser state or unsupported complete-journey claim |
| UI features | Journey acceptance, keyboard/mobile/announced errors, permission/error/back/resume states, meaningful RTL/Playwright cases | Hidden critical action, client-only access enforcement, secret persistence or unrecoverable flow |
| PGS evidence | Strict versioned consumer/provider contract and tenant/scope/size/deadline failures; deployed E2E before integration claim | Evidence treated as permission, permissive failure fallback or contract drift |
| Hosted release | Validated Compose/Caddy, real startup/migrations/health/SSE, image/dependency/secret scans, restore and compatible rollback; operational owners | Public DB/cache, unsupported image/license, untested recovery or unresolved stop-ship risk |

Tests must exercise actual trust boundaries and behavior, not mirror internal functions or assert merely that mocks were called. Use independently authored fixtures, controlled upstreams and actual dependency instances where semantics matter. Optional paid provider tests cannot substitute for deterministic required suites.

## Intended command contract

PR01A's root format/lint/typecheck/test/build/boundary commands are implemented; see the [development guide](../DEVELOPMENT.md). Commands for PR01B and later slices are **planned** except existing source-build commands. Each owning PR implements its new checks and records actual invocation/results; do not report a future gate as passing.

| Owning slice | Planned command / purpose |
| --- | --- |
| PR01A | `pnpm install --frozen-lockfile`; `pnpm format:check`; `pnpm lint`; `pnpm typecheck`; `pnpm test`; `pnpm build`; `pnpm check:boundaries` |
| PR01B images/infrastructure | `pnpm --filter @cyrantis/control-api build`; `pnpm --filter @cyrantis/gateway-api build`; independent image builds and Compose/proxy/health smoke commands recorded by PR01B |
| PR02A/B/C | `pnpm --filter @cyrantis/control-api test:integration`; `pnpm --filter @cyrantis/gateway-api test:integration`; `pnpm test:persistence` against real PostgreSQL under both runtime roles and the separate migrator |
| PR03 | `pnpm test:contracts` for common provider semantics and mappings |
| PR04A/B | `pnpm test:credentials`; `pnpm test:admission` against actual key permissions and real DB state/concurrency |
| PR04C | `pnpm test:coordination` with Redis/Valkey and two-replica matrix |
| PR04D/E | `pnpm test:execution`; `pnpm test:e2e` for real HTTP/stream boundaries and critical Console journeys |
| Hosted release | `docker compose config`; `caddy validate --config <release Caddyfile>`; startup/smoke/restore/rollback commands documented with release artifacts |

Select scanner tooling and blocking policy in PR01A, extending it to images/infrastructure in PR01B; scan exact lockfiles and immutable artifacts, review dependency licenses and provenance, and update findings before release. Do not equate an audit exit code with a complete security review. Critical security vulnerabilities, unauthorized cross-tenant access, unresolved secret exposure, unsafe financial admission and missing mandatory security validation cannot be accepted by risk documentation. Other findings require assessed exploitability, a named owner and explicit non-blocking disposition; never label an unresolved blocking finding residual risk. No invented scanner output or coverage percentage thresholds.

## CI and release design

- Separate format/lint/typecheck, unit/contracts, real PostgreSQL, Redis/Valkey matrix, E2E and supply-chain jobs with appropriate timeouts and concurrency cancellation. Keep all required checks blocking; coverage is informative unless a justified policy makes it a gate.
- Use job-local least-privilege permissions and reviewed immutable action SHAs. No deploy/provider secrets for fork/untrusted PR code; avoid privileged `pull_request_target` execution of untrusted checkout. Do not cache secrets or sensitive artifacts.
- Frozen dependency installs, explicit lifecycle/build policy and reproducible images; attach commit/build provenance, dependency manifest/SBOM where appropriate, and scanner dispositions to releases.
- Separate build identity, artifact promotion, database migration credentials and deployment approval. Branch protection and remote configuration require explicit authorized hosting changes.
- Test migrations from a realistic prior schema; compatible code rollback is distinct from restoring a database. Real restore drill including encryption-key versions/object storage and expected data-loss window is release evidence.
- Build/publish/promote each app image independently. Core changes trigger every consumer's checks, including browser-safe bundle inspection. Record the embedded core/schema compatibility range; sharing a lockfile does not prove runtime compatibility.
- Only one dedicated migration job receives DDL credentials. Test serialization/failure and the declared `(Control, Gateway)`, `(Control+1, Gateway)`, `(Control, Gateway+1)` and `(Control+1, Gateway+1)` combinations against expanded schema before claiming independent rollout. Include role/grant and token/key-version changes, then contract obsolete schema only after old images retire.

## Review and completion

Every meaningful implementation PR uses `pr-explainer` for a concise French planning BEFORE and completed AFTER, one concrete example, three takeaways and an executable maintainer validation scenario with expected results. `architecture-pr-review` supplies the separate engineering evidence through the [PR template](../../.github/pull_request_template.md). Documentation-only explanations describe decisions, not imaginary runtime changes.

Every implementation PR supplies proportional BEFORE/AFTER, affected contracts and trust boundaries, alternatives, negative tests, executed commands/results, compatibility, deployment/rollback, deferred work and risks with owner. Add ADRs for durable architectural decisions. Mark not-applicable checks with reasons; missing execution is UNVERIFIED, not a pass.

Verdicts apply only to the stated scope:

- **READY:** all mandatory checks passed.
- **READY WITH DOCUMENTED RISK:** mandatory checks passed and only explicitly accepted, non-blocking residual risks remain with owner/disposition.
- **BLOCKED:** mandatory controls failed or blocking vulnerabilities remain.
- **UNVERIFIED:** evidence is insufficient to approve, including missing mandatory validation.

Risk documentation cannot waive the stop conditions above. A docs-only PR can be ready for documentation review while its application design remains unverified. Never mark an implementation PR complete with required tests missing/failing. Never claim production readiness, ASVS conformance or certification solely from these documents.

## Security boundary evidence

Use the [access matrix](../security/ACCESS-BOUNDARIES.md) as executable grant-test input: Gateway cannot create users, mint keys, alter routes/plans or mutate credentials; Control cannot alter Gateway reservation/settlement state; neither runtime can migrate, escalate roles or rewrite final audit/usage records. Inspect actual role ownership, defaults, view/function rights and permissive RLS policy combinations. Test auth-index enumeration and tenant-context bypass attempts; document the limits of application-controlled RLS under runtime compromise.

Same-tenant ownership matters alongside A/B isolation: another member/admin/service must not use a personal BYOK secret, and services use only explicitly assigned workspace credentials. Test lists/counts/reports, user-bound developer versus service-only keys, account/membership revocation and resumed jobs. See the [BYOK model](DEVELOPER-BYOK.md).

Before inference, prove the selected key backend actually denies Control decrypt and Gateway key administration; a symmetric shared root key is not proof. Test metadata binding, version rotation, restore and logs/errors. Browser tests cover Control cookies versus Gateway tokens, CSRF, token substitution/audience/algorithm confusion and tenant switching. Measure durable revocation/pre-dispatch ordering and active lease expiry under dependency loss/scheduler delays. Test unknown upstream acceptance without replay and lease expiry without assuming remote work stopped.

PR00 executed documentation checks only. PR01A's real HTTP/process, React and supply-chain results belong to its linked review; it adds no database/provider/container validation. Gates become executable in their owning slices; planned script names are not passing evidence.
