# Console navigation and initial user journeys

Status: proposed flows before UI implementation. Current workflow evidence: L7 in the [inspection record](../discovery/INSPECTION-RECORD.md). Preserve chat, image, video and structured-evaluation Labs while rebuilding the UI around tasks.

## Information architecture

| Section | Primary tasks | Boundary |
| --- | --- | --- |
| Overview | Connection readiness, recent requests, quota/budget status, next setup action | Tenant-scoped summaries; explain estimates and unknowns |
| Providers & BYOK Credentials | Enable route, connect/replace key, inspect masked metadata, revoke | No plaintext reads; scope and consequences explicit |
| Playground / Exploration Labs | Chat, images/editing, asynchronous video, structured evaluation | Experiments do not silently change production defaults |
| API Integrations | Create service identity/key, choose scopes, copy safe quickstart, rotate/revoke | Machine access separate from people; keys shown once |
| Tenants & Access | Select authorized workspace, manage members/roles | Meaningful names; no raw UUID input when a selector works |
| Governance & Policies | Allowed routes/models, spending/token limits, retention, integration policy | Gateway policy distinct from external PGS authority |
| Usage & Billing | Usage/provenance, provider estimates, platform charges, offer/trial state | Separate currencies/sources; no invented invoices or prices |
| Settings | Account, identity/session settings, locale and tenant preferences | Show account versus workspace ownership |

Always display the active workspace name; show the selector when multiple workspaces exist. Principal/permission-aware actions prevent accidental context confusion. Switching tenant invalidates tenant-scoped queries, closes old streams, and discards unauthorized results. Server authorization still governs every operation. Do not save secrets in local storage, query keys, URLs, analytics or saved form drafts.

## Journey 1: first successful BYOK request

Developer signs in -> Control provisions/selects a private “My workspace” -> chooses provider -> adds a personal BYOK connection -> sets supported output/basic spending bounds -> creates a scoped developer API key and copies a quickstart, or opens the Lab -> explicitly runs -> sees route and usage provenance. No tenant UUID, team wizard or role editor before first use. Provider charges are disclosed before any paid connectivity test.

The [Developer Free BYOK plan](DEVELOPER-BYOK.md) defines personal ownership, workspace sharing and separate service identities. The quickstart uses a Cyrantis developer API key, not the provider secret. Personal BYOK is bound to user and workspace; service-only clients use explicitly authorized workspace credentials. This complete journey ships only after PR04E acceptance.

Keep adding a key a short single form. Use a stepper only for the broader onboarding sequence: Connect -> Choose model -> Set limits -> Review/run. Save non-secret progress server-side when needed; back navigation preserves choices, but never repopulates a submitted secret. If interrupted before save, explain that the key must be re-entered.

Failure paths: invalid/revoked key offers replacement without echoing upstream details; unavailable/unsupported model preserves the request and offers allowed choices without silently switching provider or charges. Quota denial explains the active limit and recovery time/action. Connectivity tests that may cause inference spend require an explicit action and explanation.

## Journey 2: scoped API integration

Authorized workspace operator -> API Integrations -> names an application -> selects only needed scopes and permitted routes -> chooses expiry -> reviews workspace/permissions -> creates key -> copies one-time key -> verifies a safe example -> rotates/revokes with explicit effect on running integrations.

Failure paths: insufficient admin scope gives an actionable request-access state; losing the displayed key requires regeneration, never retrieval. PGS runtime integration is a distinct service identity with only `evaluation:invoke`; its setup must not reuse a Lab key.

## Journey 3: Labs

Choose capability -> select a model supporting it -> enter input and applicable options -> inspect estimated bounds -> explicitly run -> observe progress/cancel/result -> optionally save an authorized asset or rerun with explicit cost. Chat tool calls are displayed as proposals; execution permissions remain external. Video shows durable job status and recovery after page reload. Image upload/download and saved history require tenant authorization.

Structured evaluation selects an allowlisted profile and input; evidence is labeled as model evaluation. It must never display a green authorization badge that implies a PGS or host permission. Evaluation errors preserve input in memory within the authorized context and explain retry eligibility. Do not persist sensitive answers by default.

## Journey 4: limits, trial and account changes

Operator reviews current usage and reservation state -> edits permitted limits -> reviews financial/availability effects -> confirms -> sees audit outcome. Trial flow discloses 30 days, no payment method and return to Free; request-extension action records a request, while only authorized staff can grant an audited extension. No paid conversion or changed provider route happens automatically. Expiring Pro-only resources need a disclosed downgrade policy before implementation.

## Initial field inventory

| Field | Purpose, source and example | Validation / behavior |
| --- | --- | --- |
| Provider | Select an enabled provider route by name | Required; only authorized/available routes; capability-specific options |
| Credential name | Recognizable label, e.g. `Development workspace` | Required bounded text; duplicate names disambiguated by scope |
| Provider API key | Key obtained from selected provider's key-management page; masked pattern only | Required for BYOK; never echo; provider-specific help; clear after save |
| Credential scope | Personal by default for individual onboarding; workspace-managed via explicit authorized advanced flow | Server assigns immutable owner/scope; membership alone grants no personal use; services cannot select personal credentials |
| Model | Named model selector from scoped discovery | Show freshness and unsupported/unknown controls; no fabricated capabilities |
| Maximum output | Token bound with units and cost explanation | Positive integer within route/model/tenant constraints; reject unsupported bound |
| Spending ceiling | Amount/currency and period, with estimated provider versus platform source | Privileged mutation; unknown price cannot imply enforceable monetary cap |
| Integration permissions | Plain-language operation scopes, e.g. `Run structured evaluations` | Minimum defaults; server rejects escalation or unauthorized route grants |
| Key expiry | Date/time in visible timezone | Server-defined bounds; explain expiry effect and rotation |
| Custom endpoint | Advanced deployment option, not default onboarding | Defer untrusted arbitrary URLs initially; later strict egress policy and authorized setup |

Use a discriminated form schema and small validation functions for simple provider differences. Introduce a state machine/Strategy only if distinct authentication flows justify it. Server state belongs in TanStack Query, navigable filters/model selection in URL state, and unsaved text/secrets in local transient state. Scope query keys and invalidate on membership/key/tenant changes.

## Session and API ownership (implementation guidance)

Console administration uses Control's server-held OIDC session and CSRF-protected actions. Labs acquire a short-lived, narrowly scoped Gateway-audience token in memory and call Gateway directly, including streaming; they do not proxy execution through Control. Same-origin edge routing may strip a `/gateway/` prefix and must remove Control cookies upstream. Never put tokens in URLs, persistent browser storage or telemetry. Gateway independently rechecks tenant/principal status; UI state is not authority. See [access boundaries](../security/ACCESS-BOUNDARIES.md) for token/lease design and tests.

Keep these implementation details out of ordinary product steps. Explain user-visible expiry, denied access, uncertain spend and recovery clearly. On lost authorization, discard sensitive cached output and close local streams; on an uncertain paid request, show pending/unknown status rather than an automatic rerun.

## UX acceptance before release

- A first-time developer can connect an approved provider and complete a request without knowing internal IDs, tenant administration or schema relationships; concurrent sign-in creates one private default workspace.
- A second same-workspace member/admin and a service cannot use a personal credential. Service setup explains both the Cyrantis integration key and its explicitly assigned workspace provider credential; no silent fallback.
- Keyboard-only and screen-reader flows announce labels, hints, loading/progress, permission limits and focusable errors; mobile layout supports run/cancel/review without hidden controls.
- Back/cancel/resume and empty/loading/expired-session states give recovery actions. Switching tenants or losing authorization stops use of prior state.
- Unsupported controls are explained before dispatch. Financial/destructive mutations require a review/confirmation with scope and effect; no secret or prompt leaks into error copy.
- RTL/Vitest tests cover meaningful form states; Playwright covers onboarding, integration scopes, revocation, tenant switch, interrupted video and errors when those features exist. No UI tests were run in PR00.
