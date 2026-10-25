# LXP implementation assessment

Status: sampled source assessment at `26b15b0`; references resolve through the [inspection record](INSPECTION-RECORD.md). Dispositions are recommendations for Cyrantis, not change requests against LXP.

## Inventory and disposition

| Area | Verified local evidence | Cyrantis disposition |
| --- | --- | --- |
| Monorepo | pnpm/Turbo; Nest `apps/admin-api` and `apps/gateway-api`, React `apps/admin-web`; contracts/domain/SDK/model-family packages and 13 provider packages (L1, L3) | KEEP two deployables; REDESIGN canonical `@cyrantis/core` definitions and distinct least-privilege roles |
| Provider seam | `LlmProviderAdapter` mixes chat, image and video methods; input contracts include deprecated provider-specific reasoning options; errors/test helpers and concrete OpenAI-compatible base implementation exported from SDK (L2) | REDESIGN small contract; REIMPLEMENT adapters from evidence |
| Provider inventory | OpenAI, Anthropic, Google, xAI, Z.ai, Groq, Mistral, DeepSeek, Moonshot, Ollama, Augure; aggregators OpenRouter/NanoGPT (L3) | KEEP CONCEPT; phase providers by verified demand/parity, not count |
| Models | Optional `listModels`, partial model capabilities, provider-wide booleans; OpenRouter reasoning metadata mapping and local family projections (L2-L4) | REDESIGN per-route/model evidence with unknown state and timestamps |
| Chat and streaming | Text/image content parts; raw `ReadableStream<Uint8Array>` contract; Anthropic translates streams, OpenAI-style adapters return upstream byte streams (L2-L3) | REIMPLEMENT normalized typed events and one HTTP serializer |
| Tools and structured output | Shared chat request has no tools/tool-result contract; `outputFormat?: 'json'` exists, NanoGPT maps JSON mode; sampled OpenAI/OpenRouter dispatches omit that constraint (L2-L3) | REDESIGN explicit supported/rejected fields; never equate JSON mode and schema enforcement |
| Images/video/audio | Separate image and asynchronous video adapter services/catalogs; Google/xAI/NanoGPT advertise video; OpenRouter has video methods/tests while `videoGeneration: false`; no audio operation in inspected SDK (L2-L3) | KEEP media jobs concept; REIMPLEMENT per-model media capabilities; DEFER audio until a contract/demand exists |
| Authentication | User access tokens, active membership lookup, integration-client keys, service-only evaluation path, optional trusted Open WebUI identity headers (L5-L6) | KEEP distinct principals/scopes; REDESIGN strict server-owned context; DEFER header trust mode |
| BYOK | User/tenant/platform resolution, AES-256-GCM ciphertext/key version, service identities require tenant credentials and cannot use user fallback (L4-L5) | KEEP encrypted tenant resolution; REDESIGN explicit scope selection, key-ring rotation and audit lifecycle |
| Policy and limits | Tenant request/token/media windows and monthly estimated-cost checks; transaction advisory locks; usage reservation occurs separately from initial policy check (L4) | REIMPLEMENT atomic check-plus-reserve; distinguish estimates, actuals, and unknown usage |
| Persistence/isolation | TypeORM repositories/entities appear in both APIs; transaction-local `app.tenant_id`; forced RLS migrations cover credentials, telemetry, keys and media (L4-L5) | KEEP layered isolation; REDESIGN canonical TypeORM entities, one migration owner and distinct non-owner runtime roles |
| Audit/usage | Request/principal/key attribution, content summaries and usage events in execution; defaults disable prompt/response logging (L4) | KEEP CONCEPT; explicit retention, bounded metrics and durable ledger semantics |
| Console/Labs | Lazy routed chat/image/video/evaluation Labs, providers, tenants, users and analytics (L7) | KEEP workflows; REIMPLEMENT UX from journeys |
| OpenAI/Open WebUI | Controller mounted at `/api/v1/openai`, models/chat routes, bearer/cookie/trusted integration auth; streamed output and telemetry branches (L5-L6) | KEEP facade concept; REIMPLEMENT from shared events, publish precise compatibility subset |
| Operations | VPS Compose: PostgreSQL, Redis, separate migration jobs, API/web health checks and loopback port bindings; host-oriented Caddy examples (L8) | KEEP reproducibility; REDESIGN single public edge with two independent API images, edge/internal networks, role separation and restore proof |
| CI/tests | Adapter and service test files; frozen lock install and build/test in backend workflow; explicit typecheck step commented, coverage steps non-blocking (L1, L7-L8) | KEEP contract test idea; REIMPLEMENT blocking risk-based gates |

## Coupling and concrete risks

1. **Provider ownership is uneven.** `gateway.module.ts` imports/wires adapters, which is legitimate composition, but the large module also owns auth, persistence, media, evaluation and dispatch. `GatewayService` contains provider-ID and reasoning-family branches (L4). Isolate composition and move mappings into adapters; simply removing all provider imports would prevent wiring.
2. **Parity cannot follow provider flags.** OpenRouter's false video flag coexists with video methods and mocked tests; sampled JSON/token fields also differ between native and aggregator request bodies (L3). Treat each route/model capability as separately evidenced.
3. **Budget race candidate.** Chat checks policy under one transaction lock, releases it during credential/model/input preparation, and reserves usage under a later lock. Multiple requests can pass the first check before reservation (L4). This is a source-level concurrency concern, not a reproduced exploit. Require a race regression before reusing the algorithm. Current accumulated estimated cost does not reserve the worst-case cost of the new request.
4. **RLS deployment remains unproven here.** SQL policies and transaction helpers are present; effective protection depends on deployed privileges and use of the same transaction for every relevant query. No app-role database execution was performed in PR00 (L5).
5. **Streaming has multiple owners.** Adapters return bytes and the HTTP layer tees the stream for telemetry (L2, L6). Reimplement one canonical event lifecycle with cancellation, bounded buffering, and usage reconciliation; inspect backpressure rather than assuming `tee()` is bounded.
6. **UI responsibility concentration.** `tenants-page.tsx` has 2,517 lines and `chat-page.tsx` 1,506 in this snapshot (L7). Size is a review signal, not a defect by itself; use feature-owned forms and explicit server state instead of copying page structure.
7. **Security scope is broader than image URL validation.** SDK helpers validate HTTPS, DNS addresses and redirects (L2). This does not prove safety for arbitrary provider base URLs, DNS rebinding, all media downloads or custom headers. Reassess the complete egress boundary.

8. **Duplicated entities have already drifted.** The Gateway `TenantPolicyEntity` includes `videoRequestsPerMonth` and `maxConcurrentVideoJobs`; the Admin copy lacks these fields (L10). Keep two runtimes while moving canonical definitions/migrations into core, with compatible app/schema rollout tests. A common entity file does not itself grant database access.
9. **Deployment configuration needs separate identities.** The inspected VPS Compose supplies the same `LXP_VPS_POSTGRES_USER`/`LXP_VPS_POSTGRES_PASSWORD` aliases to API and migration services (L10). This proves configuration reuse, not actual deployed privilege attributes. Cyrantis needs distinct runtime credentials/grants and a dedicated migration job; verify denial under real roles.

## Reuse and provenance

The inspected root license is Apache License 2.0. No separate repository NOTICE file was found by filename search. The sampled provider package is private and has no package-level license declaration. The local commit, manifests and lockfile identify a snapshot but do not establish complete authorship, third-party provenance or asset rights (L9).

Recommendation: fresh Cyrantis implementation; preserve conceptual contracts and independently authored fixtures. Before any literal reuse, record source commit/path, ownership and modification history, applicable license and notices, assets/test-data origin, and transitive dependency terms. Resolve Cyrantis's commercial/source license separately. Apache identification alone is not blanket reuse clearance. No source code was copied during PR00.

## Verification limits

Existing tests include provider payload/metadata/error cases and Gateway routing, cancellation and credential cases. They were inspected selectively and **not run**. No assertion is made about coverage completeness, live provider parity, vulnerability absence, performance, or production readiness.
