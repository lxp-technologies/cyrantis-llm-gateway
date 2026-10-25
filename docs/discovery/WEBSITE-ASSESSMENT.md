# Public website assessment and Cyrantis evolution

Status: proposal based on WEB `9384713`; source references W1-W3 are in the [inspection record](INSPECTION-RECORD.md). Website files were read only. No browser, build or publishing verification occurred.

## Verified foundation

The repository has a static React/Vite app, internal `@lxp/ui` package, English/French content, typed localized route IDs and separate editorial models. The route registry already includes product catalog, Gateway product and Gateway documentation routes alongside PGS, corporate, security, privacy and legal routes. The Gateway page uses typed content and shared layout primitives. The sampled product tests assert distinct product responsibilities and unfinished end-to-end runtime integration.

The existing implementation is more advanced than the README's earliest phase descriptions: Gateway pages are already present. Conversely, the existence of these pages does not prove product availability. Metadata is managed in client code; crawlability, social previews and production canonical origins need verification. CI runs frozen installation, format, lint, typecheck, test and build; actions use mutable version tags in the sampled workflow.

## Recommended disposition

| Item | Disposition | Proposed work |
| --- | --- | --- |
| Separate repository/static deployment | KEEP CONCEPT | Release independently; no runtime dependency on Gateway source or database |
| Locale route registry, typed bilingual content | KEEP CONCEPT | Map existing route IDs to approved Cyrantis labels; preserve localized twins/redirects |
| UI primitives, themes and keyboard structure | REVIEW FOR REUSE | Retain useful patterns after ownership/asset license and actual accessibility review |
| LXP identity and product copy | REDESIGN | Approved Cyrantis positioning and visual identity; keep claims tied to verified releases |
| Gateway product/docs pages | EVOLVE | Accurate capability matrix, versioned API quickstart, clear route/model limitations |
| Trust/legal content | REVIEW | Verify entity, contact, host, retention, subprocessors and contractual terms before publication |
| Account/pricing/trial experience | PLAN | Real Console sign-up/login destinations and approved offer definitions; no fabricated checkout |

The root and web manifests are private; no root LICENSE/NOTICE filename was found in the source search. Do not treat shared ownership assumptions as permission to copy branding, fonts, text or UI assets. Reuse clearance remains open. No data migrations were found by the filename search; the inspected app is static, not an account or billing backend.

## Proposed public navigation and journeys

Public navigation: Product -> Gateway / PGS; Developers -> Quickstart / API reference / Supported routes; Offers -> Developer Free / BYOK Pro / Usage services; Trust -> Security / Privacy / Legal; Sign in / Start free.

1. Developer reads supported routes -> sees free BYOK and clear provider-side costs -> opens Console sign-up -> connects a provider -> completes a verified first request -> returns to versioned API quickstart. Offer/availability copy must match the deployed Console.
2. Buyer compares Free/Pro -> sees trial duration, no-card requirement and post-trial Free behavior -> reviews advanced features and separate usage charges -> follows an approved account flow. No unapproved price or automatic paid conversion claim.
3. Integrator reads PGS/Gateway boundary -> learns evaluation is evidence and PGS/host decisions remain separate -> uses a scoped service integration guide. Keep evaluation transport and runtime authorization integration status distinct.

## Delivery plan and publication gates

After product/architecture review, open a separate website PR series: approve branding/content and route/redirect map; update bilingual Gateway/offer/docs content; connect actual Console entrypoints; verify security/privacy/legal details. Do not move the website into this monorepo just to share a header or theme. Architecture docs may describe the accepted Control/Gateway split and canonical core, but separate processes alone do not prove tenant isolation, HA or production readiness. Public quickstarts must distinguish Control management/session permissions from Gateway inference keys and reference the released route contract.

Require bilingual route/link tests, keyboard/mobile checks, metadata/canonical/hreflang and redirect validation, static-host SPA fallback, CSP/external-request review, production domain verification and an approved claims checklist. Consider prerendering only after measuring indexing/social-preview needs. Never publish unsupported provider coverage, live PGS integration, certifications, uptime guarantees or prices. Pricing, legal entity/contact information, production URLs and final branding require approval. No website changes or publication are authorized by PR00.
