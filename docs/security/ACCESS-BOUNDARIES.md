# Control/Gateway access and failure boundaries

Status: proposed security design under accepted [ADR-001](../architecture/decisions/ADR-001-control-gateway-separation.md). No grants, identity flow, key service or database tests are implemented. This matrix is the source of truth for PR02/PR04 and complements the [threat model](THREAT-MODEL.md).

## Database identities and operations

Use distinct secrets/pools for `cyrantis_control`, `cyrantis_gateway` and the dedicated migration identity. Runtime roles are non-owner, non-superuser, NOBYPASSRLS, without CREATE/CREATEROLE/GRANT, schema ownership or membership permitting SET ROLE to another application/owner. Revoke unsafe PUBLIC/default privileges and grant named tables/columns/functions only. A NOLOGIN schema-owner role is assumed by the migration job only; bootstrap/backup/maintenance identities are separately operated, never mounted into either API. New entities do not automatically acquire runtime grants.

| Data/operation | Control runtime | Gateway runtime | Constraint |
| --- | --- | --- | --- |
| Tenants/users/memberships | Authorized lifecycle writes and reads | Minimal tenant/member/active-status projection read | Gateway cannot create users, assign roles or change tenant status; lifecycle defaults to disable, no cascade deletion of ledgers |
| OIDC transactions/browser sessions/refresh tokens | Login/session lifecycle | No session secrets or refresh-token access; bounded status/version read only | Raw browser cookies are never valid inference credentials |
| Integration clients/API keys/scopes | Issue/rotate/revoke; show secret once | Exact presented-credential lookup and current status/scopes only | No key minting, scope change, arbitrary key enumeration or plaintext retrieval |
| Provider credential metadata/ciphertext | Create/replace/revoke; metadata read, no routine ciphertext readback | Authorized active ciphertext read for exact tenant/provider/credential version | No credential mutation by Gateway; metadata binding and ownership checked before decrypt |
| Provider routes/model restrictions/policies | Versioned configuration writes | Execution projection read | Gateway cannot enable a route, weaken policy or choose caller-supplied base URL |
| Plans/licensing/entitlements/prices | Authorized administration | Minimal effective limits/features/price-version read | No financial/admin mutation from Gateway |
| Reservations/idempotency/media job state | Authorized operational/reporting read | Tenant-scoped execution inserts and permitted state transitions | Never broad UPDATE on configuration; operator recovery uses explicit audited maintenance |
| Final usage/settlement events | Authorized reporting read | Insert attributable events, read own tenant scope; no update/delete of finalized entries | Unique settlement keys and corrections by new events; data retention has a separate identity |
| Audit | Append events as Control; authorized tenant read | Append as Gateway; minimal execution read | Writer attribution enforced independently of payload; neither runtime edits/deletes prior events |
| Media objects/exports | Authorized metadata/reporting or explicit user request | Tenant-authorized generation/asset operations | External storage permissions and download authorization; no shared unrestricted bucket key |
| Schema/RLS/grants/migration history | No DDL or migration execution | No DDL or migration execution | Only dedicated migration job; a distributed database lock prevents overlapping migrators |

These are logical data families; PR02/PR04 translate each into specific table/column/sequence/function grants and tests. Prefer a minimal read table/projection or reviewed invoker-rights view; an owner-rights view must not bypass tenant policies. TypeORM entity metadata is server-only and independent of permissions. Mutations use approved fields and tenant predicates, not arbitrary entity `save` of a request body.

## Tenant context and pre-authentication lookup

Both applications establish typed context from verified identity and active membership/service binding. Client tenant hints are targets to authorize. On the same TypeORM transaction/connection, set transaction-local tenant context, enforce explicit predicates and execute every query/relation through the supplied manager. Missing tenant fails closed; no sticky pool session variables or unscoped repository fallback. Enable and force RLS on tenant payload tables, apply USING/WITH CHECK and tenant-composite relationships, and inspect policy combinations so a permissive policy cannot reopen access. FORCE RLS is defense in depth, not a replacement for non-owner runtime roles. PostgreSQL documents owner/BYPASSRLS exemptions and policy combination rules in [row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html).

Authentication precedes tenant selection: do not grant all-tenant SELECT just to resolve a presented machine key or opaque browser session. Plan a small exact-match lookup over an isolated auth index, returning only the matching principal/tenant/status/scopes needed for verification. Key material is high entropy, stored as a cryptographic verifier; raw tokens are never logged or stored. Gateway has no general access to that index or Control session secrets. Bound input and rate-limit failed verification; return non-revealing failures.

If this requires a SECURITY DEFINER function, use a dedicated NOLOGIN owner with narrowly scoped index access, no schema-owner/superuser privileges, fixed trusted `search_path`, qualified objects, no dynamic SQL, revoked PUBLIC EXECUTE and explicit caller grants. Do not accept a caller-selected tenant or arbitrary SQL/filter. Test direct table denial, index enumeration attempts and function misuse. Follow PostgreSQL's [security-definer guidance](https://www.postgresql.org/docs/18/sql-createfunction.html); keep any unavoidable exception isolated from tenant payload tables.

RLS using an application-set tenant variable is defense against query mistakes and untrusted HTTP input, **not a sandbox for malicious code running with that database credential**. A compromised Gateway may select a different tenant context within its granted data families. Strict grants contain administrative damage, but stronger per-tenant compromise isolation requires a separate design. Do not advertise it as a property of shared RLS or shared code.

## Human, browser and machine identity

Recommended PR02B flow: external OIDC Authorization Code + PKCE into Control; server-held refresh material, rotated opaque Secure/HttpOnly host-only browser session, state/nonce checks, CSRF protection and exact origin policy. IdP choice remains open. Privileged administration requires appropriately strong authentication and step-up for sensitive operations; it is not a paid-only security feature.

For Console Labs, Control issues a short-lived, narrowly scoped Gateway-audience access token after session/CSRF and tenant checks. Proposed admission lifetime: at most 60 seconds. Keep it in memory; use Authorization on fetch/SSE, never URL parameters, persistent browser storage or a shared session cookie. An edge `/gateway/` route can provide same-origin streaming without proxying it through Control; strip Control cookies before forwarding. Gateway independently verifies signature, issuer, audience, explicit token purpose/type, time bounds and current membership/session status. Gateway receives public verification keys, never Control's signing key. Do not accept arbitrary `jku`/issuer URLs from a token. [JWT best practices](https://www.rfc-editor.org/rfc/rfc8725.html) inform algorithm, audience and token-substitution checks.

User-bound developer API keys retain owner/membership checks and can use their owner's personal BYOK within the bound tenant. They are not service-only identities. External service clients use separately issued tenant-bound inference keys with minimum scopes; a valid inference key has no administration permission. PGS gets its own `evaluation:invoke` service identity. Browser, service and internal workload identities have distinct authorization policies, with no shared default human or trusted identity-header shortcut. An internal operation needs authenticated workload identity plus a bounded delegated user/tenant permission, not network location alone.

## Credential ownership within a tenant

The [BYOK model](../planning/DEVELOPER-BYOK.md) distinguishes personal provider credentials, workspace-managed provider credentials and Cyrantis service-only integration keys. RLS tenant filtering does not grant every member access to every credential. Before metadata/list/count/report access or decryption, enforce personal owner or explicit workspace use grant, operation scope and principal type. Even an admin cannot implicitly use another member's personal key. Security administration may revoke without acquiring use/transfer rights.

Control assigns immutable owner/scope; authenticated encryption binds these fields too. Sharing requires a deliberately created workspace credential, never an ownership-field patch or silent copy. Services, including PGS, resolve only explicitly permitted workspace credentials, never their creator's personal secret. A user-bound developer key cannot substitute for a service-only identity. Account/membership revocation disables dependent personal access; jobs reauthorize the durable initiating principal and credential version on resume. Same-tenant negatives are mandatory alongside tenant A/B tests in PR02C/PR04A–E.

## Revocation and change ordering

Control commits deactivation/revocation/configuration changes durably. Gateway checks current principal, membership, key, credential and relevant execution policy at admission and again immediately before dispatch; initial V1 does not cache positive authorization across requests. Revocation committed before that check denies dispatch. Concurrent dispatch and revocation cannot retract provider work already accepted; audit the selected revision/credential and explain the boundary.

For admitted streams/jobs, propose authorization leases lasting no more than 30 seconds, renewed from current durable state. On expiry/revocation or inability to renew, stop emitting further sensitive output and attempt upstream cancellation; mark usage uncertain when needed. An admission token's expiry controls new admission; existing work is bounded by its server-owned authorization lease and overall deadline, never by indefinite token reuse. Test scheduler delays and fail closed before delivering after an expired lease. The maximum revocation delay must be measured and published before release; do not claim instantaneous global cancellation.

Budget/policy updates and Gateway admission use the same short tenant transaction-lock protocol. Gateway's grant allows reading policy and changing reservation state only; a lock does not require granting policy writes. Record policy revision/price/credential in the reservation. Revalidate stricter security changes for active work according to the lease policy. Browser tenant switching cancels local requests and discards old tenant caches; server checks still decide access.

## Credential lifecycle and decryption

Control accepts new BYOK material over an authenticated, authorized, bounded TLS request, encrypts it, stores versioned ciphertext and returns metadata. No plaintext read endpoint; exclude bodies from proxy/app/error/trace logs. Gateway reads/decrypts the exact authorized credential only for execution, holds it for the shortest practical duration and never forwards a key across a redirect/origin. Providers receive only their own required headers; disable arbitrary authorization/header overrides. Plaintext zeroization is best effort in managed runtimes, not a guarantee.

Prefer authenticated envelope encryption via a maintained library/key-management service with tenant/provider/credential/scope/owner/version bound as authenticated metadata. Separate workload permissions: Control encrypt/wrap, Gateway decrypt/unwrap, maintenance rotate/rewrap; neither may manage the root keys. Key-service checks and access logs enforce the distinction, not a TypeScript interface. This follows [secrets lifecycle and least-privilege guidance](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

A VPS backend using the same symmetric master key in both apps does **not** provide cryptographic encrypt-only separation: Control possession of that key permits decryption. This does not meet the current encrypt-only boundary or PR04A acceptance. Do not ship it via a residual-risk note; a future alternative requires a justified architecture change and equivalent security evidence, without waiving mandatory controls. Choose/test the production key backend before PR04A; use external or self-hosted key services without requiring Cyrantis Cloud, and do not invent an asymmetric crypto protocol for convenience.

Rotation keeps needed prior key versions for ciphertext/backups during a documented overlap, tests old/new readers, re-encrypts through an audited resumable maintenance job and retires keys only after restore/decryption needs expire. Rotation of a provider key is distinct from wrapping-key rotation. Revocation stops new resolution immediately at the defined durable check; avoid process-wide plaintext-key caches. Test restore with matching key versions and storage metadata, not only database rows.

## Failure and recovery contract

| Failure | Required behavior |
| --- | --- |
| Control unavailable | Existing service inference can continue if Gateway's authoritative dependencies are healthy; new login/key/admin mutations unavailable; existing browser admission limited by token/session checks |
| Gateway overloaded/draining/unavailable | Control remains independently available; no fallback inference inside Control; bounded error/retry guidance |
| PostgreSQL unavailable/incompatible | No new authorized/admitted inference or admin mutation; active authorization leases expire closed; do not switch to stale cache authority |
| Redis/Valkey unavailable | Deny operations needing distributed limits/coordination; no local per-replica quota fallback; read-only functionality may remain available |
| Key service unavailable | No new decryption/dispatch; active calls only within their existing leases/deadlines; no alternate tenant/platform key |
| Worker/API crashes after possible upstream dispatch | Preserve unknown durable execution and reservation; reconcile without blind paid replay; use fencing/CAS for ownership changes |
| Policy/key revoked during stream | Stop delivery by the bounded lease deadline and attempt cancel; upstream spend may remain; record final/unknown usage |
| Migration/backfill fails | Stop promotion; leave supported old images running where schema-compatible; no auto-destructive rollback |
| Storage/media URL unavailable | Fail asset operation safely; never fall back to a local container copy or arbitrary public URL |

Shared database/cache/VPS failure can affect both APIs despite process separation. Configure per-app DB pool/concurrency/resource budgets so Gateway cannot consume every shared connection. Test saturation, two Gateway replicas and independent restarts. A successful Compose boot is not evidence of host isolation, HA, restoration or zero downtime.
