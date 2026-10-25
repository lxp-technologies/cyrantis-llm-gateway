# Developer Free BYOK and credential ownership

Status: finalized PR00 implementation plan; no onboarding, credentials or entitlements are implemented. This refines the accepted architecture without introducing a new service or authorization framework. The [access matrix](../security/ACCESS-BOUNDARIES.md) and [roadmap](ROADMAP.md) remain mandatory.

## First request for an individual developer

After verified sign-in, Control idempotently provisions/selects one private default workspace and owner membership, using the verified issuer/subject identity, never email-domain matching or a caller-supplied tenant. Failed or concurrent provisioning cannot create partial ownership or duplicate default workspaces. The UI labels it “My workspace”; no tenant UUID, organization setup, role editor or team invitation is required.

Developer chooses a provider -> pastes their provider key into a short personal connection form -> sets a supported output limit/basic budget -> creates a scoped developer API key -> copies a quickstart -> explicitly sends the first request. The quickstart uses the **Cyrantis developer API key**, never the provider secret. Provider charges and unknown-price restrictions are explained before execution; Free means no required Cyrantis subscription, not free upstream inference. Console Labs offer an alternative first request after their owning slice.

The developer key is a user-bound inference credential restricted to the default workspace and selected permitted operations/routes. It is not a service-only integration identity and cannot administer the account. Every request still checks active user/membership, key, tenant and credential ownership. A more complex workspace selector appears when needed; a visible workspace name always identifies where the request runs.

Provisioning belongs to PR02B, developer/service identity to PR02C, provider-secret storage to PR04A, and the complete connection/quickstart/Lab journey to PR04E. No earlier PR claims this end-to-end experience works.

## Three distinct concepts

| Concept | Ownership and allowed use | Lifecycle and denial |
| --- | --- | --- |
| Personal BYOK provider credential | Bound to tenant + user + provider; use only by that active owner via their browser session/Gateway token or user-bound developer key | Owner creates/replaces/revokes; another member/admin/service cannot use it or read its secret. Authorized security administration can disable it without acquiring use/transfer rights |
| Workspace-managed BYOK provider credential | Bound to tenant + provider; explicit execution policy grants use to selected members or service identities | Authorized workspace credential managers manage it; membership alone is not a use grant. No plaintext retrieval endpoint, including for administrators |
| Service-only integration credential | A Cyrantis-issued machine key authenticating a tenant-bound service principal with explicit scopes; **not** a provider secret | Control issues/rotates/revokes; Gateway compares the stored verifier, checks current grants and resolves only an explicitly permitted workspace provider credential. PGS uses a separate service with `evaluation:invoke` |

Personal and workspace BYOK are ownership modes of the same canonical credential model, not duplicated entity sets. A developer API key and a service API key share verification machinery but preserve explicit principal type and different policies. PGS rejects user-bound developer keys and ordinary browser tokens even if a caller requests an evaluation scope.

Scope/owner are assigned from authorized context and immutable on an existing credential. Moving to shared use requires creating a new workspace credential with deliberate secret entry and authorization; never silently “promote” or copy a personal secret. Personal workspace invitation/team conversion is deferred; it must not silently expose existing personal resources. Member removal/account deactivation revokes personal use and dependent developer keys; it does not transfer ownership.

## Resolution and isolation rules

Gateway resolves one explicit credential or a server-owned route binding: tenant -> principal type/current membership -> operation scope -> credential owner/use grant -> provider/model restrictions -> admission -> decrypt -> dispatch. Bind credential scope/owner/version as authenticated encryption metadata along with tenant/provider/credential ID. An identifier is a lookup target, never proof of permission.

No fallback between personal, workspace, platform or other-tenant keys on absence, revocation, quota failure or provider error. A service has no implicit human identity and never falls back to its creator's personal provider key. Jobs retain durable initiating principal and credential binding and reauthorize on resume/delivery; enqueue is not permanent permission.

Tenant RLS is only one layer. Two users within the same tenant require owner/use-grant checks too, including lists, counts, reports and jobs. Shared caches must include relevant principal/credential/policy versions or hold only non-sensitive public provider metadata; authorization precedes cache access. Logs/audit preserve attribution without exposing keys or personal prompt content. These design choices follow [OWASP's per-request authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); tests must prove the implementation.

## Free and Pro boundaries

Developer Free includes the private workspace, personal BYOK, scoped developer API access, basic workspace/service integration setup where needed, rotation/revocation, access controls, tenant isolation, encryption, safe errors, basic audit visibility and basic request/token/spending safeguards. Essentials for securing an integration cannot require Pro. Provider/network/storage capacity limits may differ by offer without weakening these controls.

Pro candidates are advanced collaboration workflows, bulk configuration, reusable governance presets, richer analytics, scheduled reports, extended searchable history and convenience automation. These are proposed allocations for PR10, not approved prices, unlimited retention promises or implemented entitlements. Custom enterprise identity administration may be a later commercial feature; secure sign-in, strong privileged authentication and baseline permission enforcement remain available on Free.

Usage-based commercial services require separate opt-in, disclosed pricing and accounting; BYOK does not authorize platform-funded inference or payment collection. The 30-day no-card Pro trial returns to Free without automatic charges. Downgrade can restrict premium workflows/capacity, never disable authentication, isolation, revocation, safe settlement or access to security controls. Define data export/retention effects before launch.

## Required examples and verification

- Alice signs in twice concurrently: exactly one private default workspace/owner binding; no inferred membership in an unrelated organization.
- Alice calls with her developer key and personal provider credential: permitted after all admission gates. Another member in the same tenant, a tenant admin without personal ownership, service identity or tenant B: denied before decryption/dispatch, without leaked list/count/report data.
- A service uses its explicitly granted workspace credential: permitted within scopes. The same key targets a personal credential, admin route, other tenant or revoked binding: denied with no fallback or provider side effect.
- Remove membership/revoke key/change credential scope in input: reject or stop under the defined revocation policy; no ownership transfer, privilege escalation or resumed job bypass.
- Onboarding errors preserve non-secret choices, clear submitted keys and provide recovery. Unknown execution shows pending/unknown usage, never automatic paid retry.

Use actual PostgreSQL runtime roles, same-tenant and cross-tenant HTTP negatives, Redis/Valkey tests where caching/coordination applies and controlled-provider E2E before marking the journey complete. Mandatory security tests cannot be replaced by successful UI clicks or an accepted-risk note.
