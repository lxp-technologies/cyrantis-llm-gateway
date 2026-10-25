# Project engineering rules

## Scope and evidence

- Cyrantis is independent from LXP. Prefer fresh implementation from documented contracts and independently written tests; review provenance, licenses, notices, and dependency terms before copying any code or assets.
- PR00 is documentation only. Do not generate application scaffolding or begin PR01A/PR01B without explicit authorization. Do not modify the three reference repositories during discovery.
- Read the relevant implementation and local guidance before changing behavior. Distinguish observed facts, recommendations, and unknowns. Never infer runtime guarantees from documentation or test names alone.
- Keep changes small and independently reviewable. Use the relevant installed skills proportionally. Do not introduce speculative packages, services, plugin frameworks, or duplicated architecture layers.
- Use English for source, identifiers, public documentation, and commit messages. Provide concise PR explanations to the maintainer in French, including the explanation section of the PR template; preserve technical identifiers.

## Architectural invariants

- Use two independently deployable modular Nest applications: `control-api` owns identity/administration/configuration; `gateway-api` owns inference/admission/usage/evaluation. Follow [ADR-001](docs/architecture/decisions/ADR-001-control-gateway-separation.md). Provider implementations are wired only at Gateway composition; application logic depends on the Provider SDK contract.
- Use one pnpm workspace/lockfile and canonical `@cyrantis/core` contracts/domain/TypeORM definitions. Keep browser-safe exports separate from server persistence and job-only migrations. No duplicated entities, app modules or giant service in core; the Provider SDK remains independent.
- Use distinct least-privilege runtime database identities and one dedicated migration job. Never run schema synchronization or migrations at application startup. Test app/schema compatibility and forbidden operations under both runtime roles.
- Ship separate stateless API images with external configuration/storage, dependency-aware readiness, liveness and graceful drain. Compose/Caddy is V1 deployment; preserve portability without speculative orchestration.
- Provider-specific mappings belong to their adapters. Do not silently discard unsupported request fields, infer capabilities from model names alone, or claim unverified native/aggregator parity.
- PostgreSQL owns durable state. Redis/Valkey support transient coordination with documented failure semantics; they are not the financial ledger or authorization authority.
- PGS remains a separate service. Gateway evaluation supplies bounded evidence; PGS owns its policy and grounding decisions. Host authorization remains distinct. **Intent != Permission.**

## Security and tenant isolation

- Default deny. Derive active tenant authority from verified identity and authorized membership or tenant-bound machine credentials. Caller-supplied tenant hints never confer authority.
- Enforce role/scope, object ownership, and field permissions on every route, list/count/export, stream, media operation, and job. Reject mass assignment.
- Use tenant predicates, tenant-aware foreign keys/uniqueness, and transaction-local RLS context. Runtime database roles must be non-owner, non-superuser, and NOBYPASSRLS; keep migration privileges separate. Application-set tenant context does not sandbox a compromised runtime; enforce the [access matrix](docs/security/ACCESS-BOUNDARIES.md) and document residual risk.
- Test changed tenant boundaries against real PostgreSQL with two tenants, including pooled connection reuse and side effects after denial. Mocks cannot establish RLS correctness.
- Encrypt provider credentials, expose no plaintext read endpoint, support rotation/revocation, and never fall back to another tenant's credential. Redact keys, auth headers, prompts, and personal content from telemetry by default.
- Bound input/output, concurrency, timeouts, retries, and spending. Validate egress destinations and redirects against SSRF. Reserve hard quota atomically before dispatch; document unknown usage on interruption.
- Essential security, isolation, revocation, and basic spending safeguards are available on every plan.

## Skills and understandable PRs

Use the installed skills proportionally to the work; discover their `SKILL.md` through the local skill catalog rather than embedding workstation paths or copying their workflows here:

- `pr-explainer`: concise French explanations of meaningful PRs, concrete behavior and practical validation.
- `architecture-pr-review`: technical BEFORE/AFTER, ownership, alternatives, compatibility and architectural evidence.
- `secure-coding`: design/review of affected trust boundaries, secrets, abuse cases and security gates.
- `tenant-isolation-engineering`: tenant/principal ownership, RLS, scoped credentials and real isolation negatives when tenant surfaces change.
- `enterprise-application-engineering`: deployment, distributed coordination, operational recovery and portability when affected.
- `ux-product-design`: user journeys, onboarding, field explanations and accessible recovery when user-facing flows change.

Every meaningful implementation PR must provide a concise BEFORE explanation during planning and an AFTER explanation grounded in the completed change. Include one concrete behavioral example, security/architecture implications, three key takeaways, verified tests and remaining risks, and a practical scenario the maintainer can execute with expected results. Label planned behavior as planned. Provide deeper technical explanations on request. For docs-only PRs, explain changed decisions and their consequences; do not invent runtime behavior or tests. Keep this explanation separate from technical evidence in the existing [PR template](.github/pull_request_template.md).

## Delivery

- Record BEFORE and AFTER using the [PR template](.github/pull_request_template.md); mark unimplemented and unverified items explicitly. Add ADRs for consequential enduring decisions.
- Follow the [roadmap](docs/planning/ROADMAP.md), [threat model](docs/security/THREAT-MODEL.md), and [quality gates](docs/planning/QUALITY-GATES.md). Required failing or missing checks block implementation-PR completion.
- Update affected contracts, architecture, operational instructions, and user journeys with the change.
- Apply the verdict definitions in [quality gates](docs/planning/QUALITY-GATES.md). Critical security vulnerabilities, unauthorized cross-tenant access, unresolved secret exposure and missing mandatory security validation cannot be waived through risk documentation.
- Report checks actually executed, results, gaps, and residual risks. Never claim certification, security audit completion, build success, or deployment without evidence.
- Do not commit, push, publish, deploy, delete data, or make consequential external changes without clear authorization. Do not embed private collaboration profiles in project artifacts.
