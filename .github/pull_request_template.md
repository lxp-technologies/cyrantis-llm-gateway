## Why / scope

- Problem and expected value:
- In scope / exclusions:

## Understand this PR — Explication simple

Keep this section concise and in French; use `pr-explainer`. For documentation-only PRs, describe decisions changed and why. This explanation supplements, never replaces, the technical BEFORE/AFTER evidence below.

- En une phrase :
- Pourquoi ce changement est nécessaire :
- Comportement AVANT → APRÈS (indiquer ce qui reste prévu) :
- Un exemple concret :
- Trois choses à retenir :
- Ce que le responsable du projet peut tester ou observer, avec le résultat attendu :
- Concepts inhabituels à expliquer, si nécessaire :

## BEFORE

- Verified behavior and implementation references:
- Affected components, contracts, data, and trust boundaries:
- Proposed design, alternatives, and tradeoffs:
- Invariants, acceptance criteria, and planned tests:

## AFTER

- Actual implementation and differences from the proposal:
- Decisions and ADR link, or why an ADR is unnecessary:
- Contract, schema, migration, UI, and operational changes:

## Security and tenant isolation

- Identity, roles/scopes, ownership, and privileged fields:
- Tenant A/B negative tests and unchanged-state assertions:
- Secrets, egress, limits, logging, and failure behavior:
- Cross-app credential/audience boundaries, revocation and uncertain paid execution (if affected):
- Remaining risks, owner, and disposition:

## Verification

- Commands actually executed and results:
- Unit / contract / real dependency integration / E2E evidence:
- Security and supply-chain checks:
- Checks not run and reason; justify each not-applicable category:

## Compatibility and operations

- Consumer compatibility and migration/backfill:
- Control/Gateway/core impact, supported app/schema combinations and separate image rollout:
- Runtime grants, dedicated migration ownership, key/token version compatibility (if affected):
- Deployment, monitoring, rollback, and restore:
- Deferred work:

## Review verdict

Choose one, with scope and evidence:

- **READY:** all mandatory checks for this PR's scope passed.
- **READY WITH DOCUMENTED RISK:** mandatory checks passed; only explicitly accepted, non-blocking residual risks remain, with owner and disposition.
- **BLOCKED:** mandatory controls failed or blocking vulnerabilities remain.
- **UNVERIFIED:** insufficient evidence to approve; missing mandatory validation is not a pass.

Critical security vulnerabilities, unauthorized cross-tenant access, unresolved secret exposure or missing mandatory security validation cannot be accepted through risk documentation alone. Documentation readiness never implies runtime security or production readiness.
