# PGS integration boundary

Status: proposed Cyrantis compatibility plan based on local PGS `c4bf25c` and LXP `26b15b0`. Sources P2-P4 and L6 are listed in the [inspection record](INSPECTION-RECORD.md). No cross-service deployment test was run.

## Verified current contract

PGS already implements `LxpLlmGatewayEvaluationProvider` behind its private `EvaluationProvider` port. It resolves a key for the current authoritative tenant, POSTs to `/api/v1/evaluations`, validates a bounded strict response, returns evidence to its evaluation engine and maps failures. Its evaluation service requires completed assessment input and sealed evaluation configuration. The documentation explicitly leaves clean cross-repository/live-provider validation pending.

| Surface | Observed behavior |
| --- | --- |
| Authentication | Bearer integration-client key, `X-Lxp-Expected-Tenant-Id`, generated `X-Request-Id`; missing tenant key fails without a call |
| Gateway authority | Evaluation controller requires service-only integration authentication and matching expected tenant; service requires `evaluation:invoke` |
| Request | `schemaVersion: '1'`, `profileId: 'pgs-grounding-v1'`, strict bounded input |
| Input fields | Question version ID, rubric ID/version/guidance, answer text, opaque assessment-answer evidence reference, allowlisted full signal definitions |
| Response | Schema/profile version, evaluation ID, evidence with observations/confidence, ambiguity/reasons, contradiction flag and follow-up recommendation |
| Bounds | Serialized UTF-8 request and response limited to 64 KiB independently; response read is bounded before parsing |
| Deadline/retry | AbortController plus configured timeout, no retry loop in inspected client |
| Error categories | Identity unavailable, authentication/authorization failed, rate limited, timeout, unsupported contract, invalid response, unavailable |
| Decisions | No `allow`, grant, policy/tenant mutation, tools, provider/model override, callback URL or arbitrary system instruction field is accepted |

PGS's strict schemas reject additional authoritative fields. PGS capability/runtime services own their own decision IDs, expiry and grants. A Gateway response does not create a PGS decision or a host authorization.

## Proposed V1 minimum

Preserve the existing wire contract for the first integration. Keep the legacy expected-tenant header as a compatibility assertion; derive authority from the verified service key, compare the header, and reject a mismatch. A future branded header/version requires an explicit coordinated migration. Never accept a body tenant ID or this header as identity by itself.

Use two independently rotated credential layers: PGS -> Gateway service key, scoped to one tenant and `evaluation:invoke`; Gateway -> evaluator provider encrypted tenant credential. Keep Console Evaluation Lab keys separate from PGS runtime keys. PGS is a service-only principal: a user-bound developer API key does not qualify, and its provider credential must be an explicitly assigned workspace-managed credential, never a personal BYOK secret. API key scopes, tenant binding, revocation and attribution must agree at admission and dispatch. No platform/user fallback for PGS service inference.

| Owner | Responsibility |
| --- | --- |
| Control API | Issue/rotate/revoke tenant-bound integration identity, credentials and permitted profile/route configuration; no evaluation execution |
| Gateway API | Independently authenticate service, authorize tenant/scope, allowlist profile, resolve provider/model and tenant key, bound inference, validate structured candidate evidence, meter/audit transport; no per-request HTTP dependency on Control |
| PGS | Own rubric/signal/configuration versions; independently validate returned signal identity and allowed definitions; persist evidence; evaluate grounding/policy/consent/authority; issue expiring decisions/grants |
| Host application | Validate applicable PGS decision provenance/expiry and its own user/object/operation permission; enforce final action |

**Intent != Permission.** PGS evidence, PGS decisions and host decisions need different schema types and audit fields. Do not add a PGS policy engine inside Cyrantis.

## Operational contract

- Correlate request ID, evaluation ID, tenant-bound service/client key identifier, profile/version, provider route, timing and safe failure category. Logs omit answer/rubric contents and all secrets; evidence payloads are not metrics labels.
- Gateway deadline must leave time for PGS response parsing and persistence inside the caller's overall deadline. Existing examples use 30 s inference and 35 s caller timeouts; configure and test the actual hierarchy rather than assuming those defaults are suitable for every provider.
- Invalid schema, unknown profile/version, auth mismatch, revoked/missing key, disallowed provider, invalid evidence, exceeded quota, dependency loss, timeout or oversized response must produce no permission escalation. PGS must preserve failure/unavailable state or use an explicitly approved conservative policy. Never silently fall back to a permissive deterministic evaluator after remote failure.
- Default no automatic retry of evaluation inference without a tenant-bound idempotency contract and known execution status. A transport timeout can still incur upstream cost. The existing wire contract does not establish paid-request deduplication: `X-Request-Id` is correlation, not an idempotency guarantee. An agreed idempotency extension must bind tenant/profile/payload and reconcile unknown dispatch before enabling retries. Record each actual attempt accurately; never claim arbitrary repeated HTTP requests are exactly-once.
- Retain only necessary transport metadata in the Gateway; PGS owns evidence retention. Document provider/aggregator disclosure and retention before enabling this route. Initial retention durations and regional requirements remain product decisions.
- Freeze schema/profile fixtures across both implementations. Version wire contract changes; changing the evaluator name/version from `lxp-llm-gateway:pgs-grounding-v1:1` requires a PGS provenance/configuration migration even if the HTTP route stays compatible. PGS currently uses its own contracts; do not import Cyrantis core/TypeORM or add a runtime cross-repository source dependency. Freeze shared wire fixtures rather than sharing persistence implementation.

Gateway uses the same durable revocation checks, bounded active-work lease and fail-closed dependency behavior as other execution paths; see [access boundaries](../security/ACCESS-BOUNDARIES.md). Control failure must not introduce a permissive auth fallback or unnecessarily block already provisioned service inference when Gateway's authoritative dependencies remain healthy.

## Required compatibility evidence

| Case | Expected result |
| --- | --- |
| Valid service A with expected A and valid profile | One bounded evidence response; separate PGS validation/decision |
| Service A with expected B / body tenant field / user token | Deny before decrypting a provider key or dispatching |
| Correct tenant, wrong scope or revoked key | Deny with no provider side effect |
| Malformed/oversized/authoritative output or unknown signal | Invalid response; no policy or capability increase |
| Dependency loss, late response, timeout, cancellation | Bounded failure; safe metering and correlation; no permissive fallback |
| Schema/profile/evaluator-version drift | Compatibility test fails; migration or explicit rejection |

PR02C establishes the service identity; PR04A–E provide the shared secure execution foundation; PR08 implements this profile/transport. Mandatory deterministic consumer/provider fixtures and real tenant-bound HTTP tests precede release. A dedicated credentialed staging E2E is needed before claiming deployed integration. PGS itself remains read-only during PR00.

## Deferred interfaces

Host-to-PGS capability/grant verification, JWKS validation/rotation, runtime trajectory transport and Gateway consumption of PGS authorization decisions are separate designs. They are not prerequisites for the initial PGS -> Gateway evidence transport. Defer SDK publication, shared queues and generalized policy hooks until a concrete consumer requires them.
