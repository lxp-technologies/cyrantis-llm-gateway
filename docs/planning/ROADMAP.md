# Delivery roadmap

Status: PR00 finalized as documentation only; all implementation slices remain **not started**. The [finalization brief](../pr-00-finalize.md) preserves [ADR-001](../architecture/decisions/ADR-001-control-gateway-separation.md) and splits the previous PR01/PR02/PR04 batches. Those unsuffixed names now denote families, not additional implementation PRs. PR numbers are planning IDs, not existing GitHub PRs.

The [architecture](../architecture/ARCHITECTURE.md), [access matrix](../security/ACCESS-BOUNDARIES.md), [threat model](../security/THREAT-MODEL.md), [BYOK model](DEVELOPER-BYOK.md), [provider parity](../architecture/PROVIDER-PARITY.md) and [quality gates](QUALITY-GATES.md) define acceptance. Each meaningful PR uses the [existing template](../../.github/pull_request_template.md): French behavioral BEFORE/AFTER/example and practical validation, plus technical evidence. No missing security gate is waived by splitting delivery.

## PR00 — Finalize discovery, architecture and engineering planning

Accepted: two deployable APIs, canonical core/TypeORM, one migration owner, minimal SDK, independent PGS, Free baseline security and portable Compose/Caddy deployment. Finalization adds credential ownership/onboarding, smaller slices, explanation governance and explicit verdict semantics. Preserve input briefs and unrelated local work; no app scaffolding, installs, reference edits, provider traffic, commit/push or deployment. See [review/handoff](PR00-REVIEW.md).

## PR01A — Workspace Foundation

**Dependency / BEFORE:** finalized PR00 and authorization to start implementation; currently only documentation exists.

**Scope / proposed AFTER:** one pnpm workspace/lockfile and Turbo graph; strict TypeScript; minimal independent `apps/control-api` and `apps/gateway-api` Nest applications; accessible React/Mantine/Vite `apps/console`; canonical `packages/core` with explicit browser-safe contract/domain boundaries. Introduce only definitions actually consumed. Reserve server persistence/migration ownership in core without dummy business entities, broad re-exports or empty abstractions. Select and record patched compatible exact toolchain pins via the [stack gate](STACK-ASSESSMENT.md).

**Exclusions:** OCI images, Compose/Caddy, infrastructure connection/readiness contracts (PR01B), business persistence, login, keys, provider adapters, inference/Labs, billing and deployment.

**Acceptance/security:** clean frozen install after generating/reviewing the initial lockfile; independent builds/start commands for both APIs and Console; package-to-app imports, dependency cycles, Control/provider coupling and browser server-only imports prohibited. APIs expose no business/diagnostic route; unknown routes return a safe 404. Console displays an honest inert shell, not fabricated account/provider state. No secrets embedded in browser config or artifacts.

**Mandatory verification:** formatting/lint/typecheck/build, actual bootstrap/close and unknown-route HTTP tests for each API, Console render/accessibility smoke and import/browser-bundle boundary checks. Meaningful initial tests; no empty green scripts. CI runs these checks with immutable action pins, read-only default permissions, timeouts, frozen installs and dependency/license/secret review; no deploy/provider secrets. Core changes check every consumer.

**Maintainer scenario:** from a clean checkout, install frozen dependencies, run the checks and start each API separately; verify safe 404s and the Console shell. Stop either API and confirm the other process remains running. Record exact commands in the completed PR; these are not runnable in PR00.

**Rollback:** remove unreleased foundation changes; no business data exists. No container or identity-provider decision blocks this slice; selected toolchain compatibility must still be proven.

## PR01B — Runtime & Deployment Foundation

**Dependency / BEFORE:** PR01A; separate local shells, no deployment environment.

**Scope / proposed AFTER:** independent OCI images for both APIs/Console, Compose and simple Caddy routing, local PostgreSQL, selectable Redis/Valkey, validated external config and secret-file examples, distinct runtime identity/pool configuration, startup/readiness/liveness and bounded shutdown. Dedicated migration job contract with one owner; actual tenant migrations follow in PR02A. Never run automatic migrations or synchronization from an API; never bootstrap it with an owner credential.

**Exclusions:** business schema/login/inference, production deployment, public DNS changes and Kubernetes/Helm/Argo CD manifests. Preserve external database/cache/storage/config seams without adding orchestration code.

**Acceptance/security:** non-root bounded containers where practical; only edge public ports, optional loopback-only developer DB/cache bindings; correct host/prefix routing and trusted-proxy handling. Probes distinguish process health from actual configured dependencies, report no unimplemented schema as verified, and reveal no secrets. SIGTERM stops admission/marks unready, drains within bounds and closes pools. Independent restart must not restart the other app.

**Mandatory verification:** build each image independently; `docker compose config`, `caddy validate`, real startup/proxy/probe/invalid-config/shutdown tests for Redis and Valkey selections; ACL/connectivity/TTL smoke for operations introduced here, no claim of financial coordination yet. Test streaming/disconnect through Caddy using a controlled test fixture, not a production provider endpoint. Check API images exclude migrator credentials, configuration contains no real secrets, and dependency/image/license scans pass. Record commands/configs/digests.

**Maintainer scenario / rollback:** start Compose with each cache choice, inspect healthy independent services and restart Gateway while Control remains available. Stop containers preserving any named volumes; no blanket volume deletion. Production hardening/restore proof remains PR09.

## PR02 — Identity and Tenant Isolation (three slices)

No publicly usable business endpoint before its authentication and persistence gates are complete. Schema changes always update canonical core, explicit grants and supported image/schema combinations.

### PR02A — Persistence roles, tenant context and migrations

**Dependency / BEFORE:** PR01B; no tenant schema or proven runtime grants.

**Scope / AFTER:** canonical minimal tenant/user/membership definitions, one migration history/executor and lock, explicit Control/Gateway grants, transaction-scoped TypeORM manager/context, forced RLS and tenant-composite constraints. Do not create future media/billing tables. No public identity workflow or default production users.

**Acceptance/security/checks:** real PostgreSQL tests under both non-owner/non-superuser/NOBYPASSRLS identities: A/B CRUD/RETURNING/FK/pooling, rollback/cancel/error context reuse, missing-context denial, forbidden DDL/TRUNCATE/role escalation and cross-family writes. Review generated SQL and view/function rights. Test concurrent migrators/failure and incompatible readiness. At the first schema, prove bootstrap and rejection of unsupported versions; from the next evolution test all supported old/new app combinations rather than inventing a nonexistent previous release.

**Maintainer scenario / rollback:** run the dedicated migration and role-negative suite against an isolated database; observe forbidden SQL rejected with unchanged state. Expand/contract only; no automatic destructive down migration.

### PR02B — Human identity and private workspace onboarding

**Dependency / BEFORE:** PR02A; persistence is internal, no sign-in.

**Scope / AFTER:** external OIDC Authorization Code + PKCE, server-held refresh material and secure Control session/CSRF; active membership and default-deny role policies. Idempotently provision one private workspace for a verified individual, as [BYOK onboarding](DEVELOPER-BYOK.md) specifies. Minimal Console sign-in/workspace/logout, no team wizard or provider forms.

**Acceptance/security/checks:** select IdP/session integration before coding; validate issuer/audience/nonce/state/time, session fixation/rotation/logout, CSRF/origin/proxy denial, no membership/default-policy denial, and concurrent/failed provisioning. No implicit email-domain membership. Real DB-role HTTP tests and controlled OIDC integration; Playwright sign-in/switch/logout. Production IdP account configuration remains explicitly unverified if only fixtures were exercised.

**Maintainer scenario / rollback:** sign in twice and observe one private workspace; a second account sees none of the first account's data. Disable login safely without deleting identities; preserve session/key compatibility on rollback.

### PR02C — Developer/service identity and Gateway authorization

**Dependency / BEFORE:** PR02B; browser administration exists, no inference credentials.

**Scope / AFTER:** Control issues/revokes user-bound developer API keys and distinct service-only keys; show secret once, store verifiers. Gateway independently verifies exact-match lookup, tenant, owner/principal type, current membership/status and scopes. Add purpose/audience-bound browser Gateway token issuance, verification and signing-key rollover. No paid execution, provider secrets or permanent test-only diagnostic routes.

**Acceptance/security/checks:** isolate pre-auth lookup and narrowly grant any security-definer function; no all-tenant index enumeration. Real HTTP authorization harness tests wrong token purpose/audience/algorithm, unknown keys, revoked memberships, scope escalation, inference key at admin routes and human key at service-only boundaries. Verify Gateway cannot mint/modify keys or access Control session/signing secrets; test cookie stripping, CSRF and safe one-time display. Test both roles and tenant A/B; ownership primitives anticipate personal BYOK without a provider table yet.

**Maintainer scenario / rollback:** issue, rotate and revoke a scoped developer key; use the test harness to observe allowed authorization and immediate new-request denial after revocation. Disable issuance without broad fallback or deleting audit/history.

## PR03 — Minimal Provider SDK and native/aggregator contract proof

**Dependency / BEFORE:** PR01A for offline packages; no provider implementation. Runtime composition is not exposed until PR04D after the full PR02 family.

**Scope / AFTER:** framework-independent provider-neutral ports/events/capabilities/errors; OpenAI and OpenRouter adapters with bounded injectable transport. Gateway composition alone maps core public DTOs into SDK contracts; no core/SDK cycle. Static supported/unsupported/unknown metadata; reject unsupported fields before IO. Independently authored fixtures, no copied legacy implementation.

**Exclusions:** dynamic plugins, all legacy providers, media/audio, automatic tool execution, full OpenAI facade or paid CI. Tools/JSON/reasoning remain explicit unsupported states until mapped/tested. NanoGPT follows in PR05.

**Acceptance/security/checks:** shared normalized stream/non-stream semantics and provider-owned payload mappings; output bounds, one local terminal outcome, split UTF-8/SSE, malformed/truncated/oversized frames, abort/late success, 429/5xx, total/idle deadlines, redaction and safe origin/header restrictions. No automatic retry after output or ambiguous submission; cancellation cannot guarantee upstream billing stopped. No tenant/entity/HTTP-app imports in adapters.

**Maintainer scenario / rollback:** run identical contract fixtures through native and aggregator adapters, observe equivalent supported outcomes and explicit unsupported errors. Internal package rollback has no data effect; no live provider traffic required.

## PR04 — BYOK, admission and execution (five slices)

Authorization/service identity belongs to PR02C, not a second authentication implementation. Each slice is internal until prerequisites pass. **No usable provider execution route before PR04D; no complete onboarding claim before PR04E; no public production release before PR09.** Paid staging smoke requires separately authorized keys/budget. Carry all preceding security gates forward.

### PR04A — Credential lifecycle and secure storage

**Dependency / BEFORE:** PR02C; no provider credentials.

**Scope / AFTER:** Control personal/workspace BYOK create/replace/revoke with immutable scope/owner, masked metadata and explicit use grants; minimal route binding. Gateway exact authorized resolution/decryption tested internally, never a decrypt endpoint. Select production key backend with separate wrap/unwrap permissions; versioned authenticated metadata includes tenant/provider/credential/scope/owner.

**Acceptance/security/checks:** real same-tenant owner/admin/service and cross-tenant HTTP negatives before decrypt; no fallback/transfer; key-service permission denials, tamper/metadata binding, rotation overlap and key-aware restore; no secrets in logs/errors/browser artifacts. Choose/test backend before real secrets; a shared symmetric-key shortcut does not satisfy encrypt-only Control. No provider IO or paid connectivity test in this slice.

**Maintainer scenario / rollback:** create/revoke a controlled test credential, observe metadata only and denial for another principal. Disable lifecycle safely; retain ciphertext/key versions and restore compatibility.

### PR04B — Durable admission and usage state

**Dependency / BEFORE:** PR04A; protected credentials but no execution/admission.

**Scope / AFTER:** atomic PostgreSQL check/reserve, scoped idempotency/payload binding, fixed-precision price/version provenance, dispatch/unknown/settled states, append-only settlement and recovery. Control policy changes share the admission lock/version protocol. No provider IO; deterministic controlled dispatch simulation only.

**Acceptance/security/checks:** real parallel reservation/policy-update tests, changed-payload/replay denial, at-most-one local dispatch claim/settlement, crash before/after possible dispatch, recovery/fencing/CAS, uncertain cost retained and no blind replay. Unknown price cannot pass a hard monetary ceiling. Gateway cannot edit policies/prices; Control cannot rewrite settlement. No transaction held over simulated remote IO.

**Maintainer scenario / rollback:** race requests at a small test budget; observe bounded admission and an unknown reservation retained after simulated ambiguous failure. Disable new admission; preserve outstanding reservations/history and compatible schema.

### PR04C — Distributed coordination and active authorization

**Dependency / BEFORE:** PR04B; durable accounting, no distributed execution gate.

**Scope / AFTER:** Redis/Valkey rate/concurrency operations with separate ACLs, two-replica admission coordination, current-state pre-dispatch authorization and bounded active-work leases. Integrate with durable ownership; no new queue framework or local-counter fallback.

**Acceptance/security/checks:** identical Redis/Valkey TTL/atomicity/restart/outage suite; two replicas, credential/membership/policy revocation races, expired/stalled lease, lost DB/cache/key service and delayed finalizer. Expired coordination lease does not prove upstream stopped; unknown work retains conservative accounting. Measure proposed token/lease bounds before use. No provider endpoint yet.

**Maintainer scenario / rollback:** revoke a test principal while simulated work streams; observe delivery cease within the tested lease boundary and unavailable coordination reject new work. Disable admissions; do not erase durable state to recover.

### PR04D — First bounded non-stream Gateway execution

**Dependency / BEFORE:** PR03 + PR04A/B/C and full PR02; all safeguards exist in internal tests.

**Scope / AFTER:** compose verified authorization, credential resolution, atomic admission, adapter execution and durable usage into one bounded chat/model path. Supported route/control restrictions enforced before IO; no hidden rerouting. This is the first usable inference API, initially internal staging.

**Acceptance/security/checks:** full real-DB/cache HTTP pipeline against controlled upstream, no provider side effects after any denial, timeout/disconnect/crash/ledger failure and unknown usage, safe errors/egress and exact credential binding. Current key/policy check before dispatch. Execute using user-bound personal and explicitly assigned workspace/service credentials; reject all mismatches. Provider-reported, estimated and unavailable usage remain distinct.

**Maintainer scenario / rollback:** execute one bounded test request, inspect attributed settlement, then revoke key and repeat: denied without dispatch. Disable execution without destroying credentials/ledger or blindly replaying uncertain requests.

### PR04E — Streaming and complete Developer Free journey

**Dependency / BEFORE:** PR04D; bounded non-stream path, no complete first-run Console experience.

**Scope / AFTER:** normalized HTTP/SSE stream serialization with backpressure/size limits, disconnect/drain/lease cancellation; accessible connect-key -> scoped quickstart or Lab -> usage -> revoke journey. Reuse the same authorization/admission/settlement pipeline, not parallel streaming rules.

**Acceptance/security/checks:** end-to-end HTTP/SSE through Caddy, split frames/slow client/abort/late success and exactly one local terminal outcome; two-replica restart and unknown settlement recovery. Playwright personal onboarding, developer/service distinction, same-tenant and cross-tenant denial, rotation/revocation, errors/back/tenant switch and keyboard/mobile accessibility. Mandatory upstream controlled; no real key in browser persistence. A lost response never triggers automatic paid rerun.

**Maintainer scenario / rollback:** connect a controlled provider, run/cancel, inspect honest usage state, revoke and observe denial. Disable streaming/Labs while preserving compatible non-stream execution and records. Live provider smoke remains separately authorized and recorded.

## Subsequent phases — refine with evidence

| PR / objective | Dependencies | Scope / exclusions | Acceptance and mandatory evidence |
| --- | --- | --- | --- |
| PR05: NanoGPT and OpenAI-compatible subset | PR04E | Third adapter, models/chat facade and scoped Open WebUI integration; no full API or trusted-header claim | Shared parity/payload/HTTP/SSE contracts; staging integration, explicit gaps |
| PR06: Image Lab | PR04E + selected adapter | Generate/edit and authorized external object storage/history; no persistent container-local uploads | Provider contracts; upload/SSRF/download/retention, same-tenant owner and A/B isolation, replica asset access and E2E |
| PR07: Video Lab | PR06 | Durable bounded jobs/progress/cancel/reload; worker only if justified | Recovery/replay/fencing/lease expiry and uncertain costs; reauthorize durable principal/credential before resume and delivery |
| PR08: Evaluation/PGS | PR04E + evaluator controls | Gateway evidence; Control dedicated service/config; no PGS policy engine | Versioned 64 KiB consumer/provider fixtures, service-only/scope/tenant/deadline negatives, deployed E2E; Intent != Permission |
| PR09: Hosted release | All included features | Harden PR01B foundation; monitoring/egress/migration/restore/incident runbooks; no automatic on-prem commitment | Independent image rollout, saturation/drain/SSE, role/schema/key compatibility, scans and key-aware restore/rollback with named owners |
| PR10: Offers/admin | PR04E + product decisions | Control owns plans/trial/licensing; Gateway enforces effective limits; no speculative billing engine | Trial/extension/expiry/downgrade; Free security invariants, approved prices/consent before money movement |
| WEB: Public identity/docs | Verified features + approved copy | Separate website PRs, bilingual branding/docs/account links | Accessibility/routes/metadata and release-claim review; legal/privacy/price approval |
| Later: Optional on-prem/HA/audio/providers | Demonstrated demand | Portable interfaces already planned; no speculative orchestration | New deployment/contract/isolation evidence before claims |

Later slices must receive the same BEFORE/AFTER, denial tests, practical validation and rollback detail before implementation; split them further when scope is concrete. Operational work may begin early for staging, but text staging does not complete media/evaluation or release gates. No deadlines, prices, SLOs or certification are implied.
