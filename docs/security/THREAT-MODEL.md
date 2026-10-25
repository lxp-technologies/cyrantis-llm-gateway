# Initial threat model and security test matrix

Status: design assessment, not an executed security audit. Owners are delivery roles to assign when work starts: Control owner, Gateway owner, platform owner and product owner. The [access/failure matrix](ACCESS-BOUNDARIES.md) defines app-specific grants and identity controls under accepted ADR-001. All implementation controls below are **planned and unverified in Cyrantis**.

Reference baselines: [OWASP ASVS 5.0](https://owasp.org/projects/asvs) and [OWASP API Security Top 10 2023](https://owasp.github.io/www-project-api-security/). Use them to select verifiable requirements, not to claim certification. PostgreSQL [row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) supplements application authorization; owners/superusers/BYPASSRLS privileges require particular attention.

## Assets, actors and trust boundaries

Assets: provider credentials/encryption keys, API/session/signing credentials, tenant configuration/membership, prompts and model output, media objects, audit/provenance, quota reservations and charge records. Treat content and provider output as untrusted even when authenticated transport succeeds.

Actors: anonymous callers, authenticated users in A/B, dual-membership users, tenant admins, service accounts, explicitly privileged operators, external providers/aggregators, PGS, and deployment/CI identities. A provider or PGS service identity has no implicit control-plane permission. Compromised tenant admins remain unable to access other tenants.

Trust crossings: browser -> Caddy -> Control session/admin authorization; browser/service/PGS -> Gateway independent authentication/execution authorization; each API -> its separately granted transaction/RLS database role; Control -> credential encryption, Gateway -> authorized decryption -> external provider; each API -> ACL-scoped Redis/Valkey; media -> external storage; dedicated deployment/migration identities -> images/schema/secrets. Control signing/session secrets and migration credentials never belong to Gateway. Shared schema/core does not make the two runtimes mutually trusted. Future workers must re-establish tenant authority from durable server-owned job identity rather than accepting a mutable queue field.

## Threat register

| ID | Concrete misuse / relevant API risk | Required control and failure behavior | Owner / slice |
| --- | --- | --- | --- |
| T1 | Swap object/credential/job IDs, request B's list/count/export from A (API1) | Active authenticated tenant, object predicates and permission check, tenant-aware joins/FKs and RLS; deny without revealing existence or side effects | API / PR02 onward |
| T2 | Forged issuer/audience/tenant hint, expired session, revoked M2M key (API2) | Strict verified principal, active membership/tenant-bound key, revocation, bounded session lifetime; fail closed on required auth dependency failure | API / PR02 |
| T3 | Mass assign `tenantId`, owner, role, plan or key scopes (API3/API5) | Separate public DTOs and server-owned properties; explicit function/field policies; reject unknown privileged input | API / PR02 onward |
| T4 | Concurrent/replayed requests exceed quotas or double charge (API4/API6) | Atomic check/reserve, tenant/payload-bound idempotency, bounded concurrency/body/output/time, conservative unknown-usage recovery; cache cannot authorize spending | API / PR04 |
| T5 | Provider base/media URL reaches loopback, metadata or internal network; redirect/DNS rebound (API7) | Allowlisted provider origins initially; reject credentials/unexpected schemes/ports/headers; validate DNS/redirect destinations and enforce safe connection/egress policy; bound downloads | API/platform / PR03-04, media slice |
| T6 | Provider key exposed in logs/errors/browser/backup or after revocation (API8) | Authenticated encryption with key versions and bound tenant/provider/credential metadata; protected key ring, one-way key display, redaction, encrypted backups and rotation; no plaintext retrieval endpoint, plaintext limited to authorized input/execution | API/platform / PR04 |
| T7 | Raw provider error/tool output becomes authority or injection (API10) | Strict response schemas, safe errors, bounded UTF-8/SSE parsers, escaped/sanitized UI; tools not automatically executed; evaluator evidence never grants permission | API / PR03 and evaluation slice |
| T8 | CSRF/session theft, spoofed proxy/identity headers, permissive CORS (API2/API8) | Same-origin session boundary, secure HttpOnly cookies, CSRF on mutations, exact origins, explicitly trusted proxies; strip untrusted identity headers | API/platform / PR02 and release |
| T9 | Pooled DB context, cache collisions, stream/worker/blob leakage crosses tenants (API1/API8) | Same-transaction tenant context, non-owner NOBYPASSRLS role, scoped cache/storage, immutable authorized job identity and download checks; close old streams on context loss | API / all tenant slices |
| T10 | Stale PGS evidence, malformed authority fields, wrong tenant or unavailable PGS increases access | Strict profile/evidence contract, independent PGS/host decisions and expiry/provenance; required decision failure cannot increase permission | API/PGS integrator / evaluation slice |
| T11 | Mutable action/image or hostile PR gains release secrets (API8/API9) | Immutable reviewed pins, locked installs, job-local least privilege, untrusted PR isolation, dependency/license/secret/image scans, separate release identity | Platform / PR01 and release |
| T12 | Sensitive telemetry or audit tampering; deleted data survives uncontrolled retention | Content logging off by default, bounded metadata/permissions/retention, append-only runtime grants and controlled maintenance deletion/export, key-aware backup/restore; runtime attribution not supplied by payload | API/platform/product / PR04 and release |
| T13 | Gateway compromise changes users, routes or plans; either runtime gains DDL; broad auth lookup enumerates tenants | Separate non-escalatable DB roles and named grants; narrow auth index/function, protected migrator; test prohibited operations. App-controlled RLS cannot isolate arbitrary malicious runtime code | Control/Gateway/platform / PR02 |
| T14 | Stale authorization/policy, expired lease or ambiguous dispatch permits excess work/paid replay | Durable pre-dispatch checks and ordered policy/admission updates; bounded current-state authorization leases; fencing/CAS, unknown reservation/reconciliation; no positive auth cache in V1 | Control/Gateway / PR04 |
| T15 | Core/server import leaks persistence/secrets into Console; mixed app versions misinterpret schema/token | Explicit exports/import checks and browser artifact inspection; expand/contract, token/key version compatibility, dedicated locked migration and tested app/schema combinations | API/platform / PR01 onward |

For tenant payloads, RLS with an application-set variable protects against missing predicates and untrusted request input; it does not prevent a compromised runtime selecting another tenant context within its granted data families. Separate grants reduce administrative blast radius, not all cross-tenant compromise risk. Stronger isolation would need a new design. Shared VPS/database/cache also remain common failure domains.

API9 inventory is addressed by versioned route schemas, explicit public endpoints and release-specific supported capabilities. Inventory must include compatibility/debug/admin surfaces, not only the primary API.

## Tenant and authorization test matrix

Use test tenants A and B, distinct users/keys/credentials/resources and a dual-membership user with A active. Assert response, database state, decrypted credential calls, dispatch count, usage/reservations and telemetry after denial. Mocks alone cannot prove RLS, pooling, cache or concurrent admission.

| Scenario | Expected denial or constrained result | Required proof |
| --- | --- | --- |
| Anonymous or invalid/wrong-audience JWT | 401; no tenant work | HTTP boundary and unchanged state |
| Valid principal without required membership/scope | 403; no provider call | Scope/function tests for user/admin/service and unknown endpoint policy |
| A reads/changes/deletes B ID | Non-revealing denial/not-found; B unchanged | GET/PATCH/DELETE, credentials/routes/jobs/assets |
| A lists/searches/counts/exports B data | B rows, counts and metadata absent | Query/pagination/export plus aggregate/error cases |
| Dual membership, active A, B resource supplied | Reject until explicit authorized switch | Tenant context and query-cache/stream invalidation |
| Same-tenant member/admin/service targets another user's personal BYOK | Denied before decrypt/dispatch; no personal list/count/report leakage | Owner/use-grant tests, immutable scope/owner, no service-to-personal fallback |
| User-bound developer key targets service-only evaluation | Denied even with a requested scope; no implicit service identity | Explicit principal-type and route-policy HTTP negatives |
| Concurrent verified sign-in/default workspace provisioning | One private workspace with valid owner; no partial or inferred organization membership | Idempotent transaction/uniqueness and failure/retry tests |
| A admin or service key targets B | Denied despite admin role/valid signature | Object and function checks before secret decryption |
| Body/path/query/header forges tenant/owner/role/plan | Rejected; no authority change | Privileged-field/mass-assignment tests |
| Revoked/expired key or membership | New work denied; active-work revocation policy explicitly tested | Chat/media/evaluation and cache invalidation; bounded lease policy |
| No DB tenant context; A then B reuse same connection | No data/context inheritance; default deny | Real PostgreSQL app role, transactions, commit/rollback/cancel/error reuse |
| SELECT/INSERT/UPDATE/DELETE/RETURNING and cross-tenant FK | Reads/writes constrained; no invalid relationship | Real RLS USING/WITH CHECK, tenant unique constraints, deployed pool mode |
| Runtime role privilege probe | Non-owner, non-superuser, NOBYPASSRLS; no DDL/escalation or unauthorized family writes | Test both real identities, SET ROLE/membership, schema/default grants, views/functions and RLS policy composition |
| Gateway attempts user/key/route/plan mutation; Control alters settlement | Denied despite valid tenant context | Actual SQL privilege negatives and unchanged state, not mocked service checks |
| Pre-auth lookup enumerates keys/tenants or abuses function search path | Exact presented credential only; no arbitrary table read or elevated execution | Restricted auth-index access, function grants/owner, input bounds and misuse tests |
| Browser cookie/Control token used at Gateway; inference key at Control | Reject wrong credential purpose/audience | Real edge cookie stripping, signature/type/algorithm/issuer/audience and route policies |
| Policy/revocation concurrent with admission or active work | Durable ordering and measured lease-bound stop; upstream cost can remain | Two replicas, stalled scheduler, DB/cache loss and no post-expiry sensitive delivery |
| Old/new Control/Gateway with expanded schema | Supported combinations work; incompatible image fails readiness | Migration lock/failure and image/schema/grant/key-version matrix |
| A cache key collision, stale context, TTL/restart | No B data or fallback; safe rate/concurrency failure | Same critical suite against Redis and Valkey |
| Forged job tenant or object/download grant | Denied at worker/read boundary | Durable job lookup, signed grant expiry/audience, storage authorization |
| Parallel requests/replay near limit | B unaffected; A never exceeds reserved bound | Real concurrent DB/cache tests, duplicate payload and changed-payload replay |
| Stream abort/error/late provider response | One terminal state; no B/private content; conservative usage | Parser/cancel/finalizer and full HTTP stream tests |

## Other mandatory negative evidence

- Egress: controlled redirect chains and public-to-private DNS cases, IPv4/IPv6/encoded destinations, metadata hosts, oversized/chunked bodies and unsafe MIME. Test the connection destination, not only a parsed string.
- Credentials: encrypted round trip/tamper rejection, metadata binding, rotation overlap and key-aware restore, retired key rejection, wrong-tenant lookup, no fallback, no raw key in errors/logs/traces/HTTP. Test key-service permissions: Control wrap but not unwrap, Gateway unwrap but not key administration. Shared symmetric key possession cannot enforce that separation.
- Sessions: CSRF, fixation, login/logout/rotation, expiry and proxy spoofing. UI hiding controls does not satisfy authorization.
- Provider output: malformed JSON/schema/signals/tool arguments, truncated SSE, duplicate finish and late success, untrusted markup and provider errors containing injected secrets.
- Financial failures: lost connection after provider acceptance, ledger failure after inference, timeout without usage, reservation recovery, two replicas, exhausted cache/DB and retry storms. Unknown execution retains conservative reservation; lease expiry alone never proves upstream stopped. Assert one local settlement/dispatch claim, not exactly-once upstream execution.
- Operations: independent restarts, Gateway saturation without exhausting Control pools, graceful stream drain, startup/readiness versus liveness, and external assets across replicas. Network segmentation alone is not an outbound SSRF allowlist.

Implementation ownership follows the [split roadmap](../planning/ROADMAP.md): PR02A persistence, PR02B human identity, PR02C developer/service verification; PR04A credential ownership/storage, PR04B durable admission/usage, PR04C distributed authorization, PR04D non-stream execution and PR04E streams/Console. PR01A establishes source/CI boundaries; PR01B proves runtime/image/proxy boundaries. Family labels in the register refer to these slices, not larger duplicate PRs.

## Open decisions and release blockers

Assign risk owners and identity provider; validate the proposed session/token and bounded active-work lease design, select/test key storage/rotation backend, prompt/media retention, egress exception policy, incident response and recovery objectives before production. No public custom endpoint setup until SSRF and operational controls are proven. No claim of a hard monetary cap without conservative reservation and reliable pricing.

Stop release for credible unmitigated cross-tenant exposure, unauthorized function/property access, secrets leakage, unsafe financial admission, destructive migration or unbounded sensitive output. Security controls apply to Free and paid plans alike. Critical vulnerabilities and missing mandatory security validation cannot be accepted through risk documentation. Required test gaps prevent approval; this document does not establish that any control has been implemented.
