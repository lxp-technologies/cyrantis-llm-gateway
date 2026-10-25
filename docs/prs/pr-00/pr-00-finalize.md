# Cyrantis LLM Gateway — Finalize PR00

Laurie Codex, we are ready to finalize **PR00 — Discovery, Architecture & Engineering Planning**.

The architecture has been reviewed by GPT-6.1 Sol and independently challenged by Astra. The overall direction is approved.

**This task is a focused finalization pass, not another architectural redesign.**

We want to resolve the remaining issues, consolidate our decisions, validate the documentation, and prepare PR01A for implementation.

## 1. Accepted architectural decisions

Preserve the following decisions:

- Two independently deployable NestJS applications: `control-api` and `gateway-api`.
- One shared `@cyrantis/core` package for canonical shared entities, domain models, contracts, validation and appropriate common functionality.
- One migration ownership model with controlled database privileges.
- PostgreSQL RLS as defense in depth, never the sole authorization boundary.
- Strict tenant isolation and server-side authorization.
- pnpm workspaces with Turbo and one reproducible lockfile.
- A minimal, framework-independent Provider SDK.
- Consistent normalized behavior between native providers and aggregators, with provider-specific corrections inside their adapters.
- React, Mantine and Vite for a completely redesigned Console.
- Redis and Valkey compatibility.
- Docker Compose and Caddy for the initial VPS deployment.
- Architectural portability toward Kubernetes, Argo CD and cloud deployment.
- PGS remains an independent service with explicit integration contracts.
- Free BYOK, optional premium capabilities, and usage-based commercial services.

Do not reopen these decisions unless you discover a concrete contradiction, security issue or implementation blocker.

## 2. IMPORTANT — New Codex skill installed

A new skill named **`pr-explainer`** has been added to Laurie Codex.

Discover and read its `SKILL.md` before updating our PR governance.

This skill complements `architecture-pr-review`.

They have distinct responsibilities:

**architecture-pr-review**
- Verify architectural integrity.
- Explain design decisions and tradeoffs.
- Assess security, tenant isolation, compatibility and maintainability.
- Document BEFORE/AFTER implementation decisions.

**pr-explainer**
- Explain what every meaningful PR accomplishes in clear, accessible French.
- Describe how the application works BEFORE and AFTER.
- Explain the motivation and practical value.
- Provide a concrete user or API example.
- Identify the three most important things to remember.
- Explain how Patrick can verify the change.
- Offer technical depth progressively instead of overwhelming the reader.

The explanation should be concise, structured and ADHD-friendly: short sections, explicit terminology, concrete examples and limited information density.

**Do not simplify away important technical or security information.**

Do not patronize Patrick. He is an experienced software developer who wants to understand and retain architectural ownership of his applications.

## 3. Update AGENTS.md

Update the repository's `AGENTS.md` to explicitly require the appropriate use of:

- `pr-explainer`
- `architecture-pr-review`
- `secure-coding`
- `tenant-isolation-engineering`
- `enterprise-application-engineering`
- `ux-product-design`

For every meaningful implementation PR, require:

1. A concise BEFORE explanation during planning.
2. A concise AFTER explanation once implemented.
3. A concrete behavioral example.
4. A summary of security and architectural implications.
5. Verified tests and remaining risks.
6. A practical validation scenario Patrick can execute.
7. Detailed technical explanations when requested.

Avoid duplicating the entire contents of the skills inside `AGENTS.md`. Reference their responsibilities and let the skills provide the detailed workflows.

Keep the existing project instructions and security requirements intact.

## 4. Review the existing PR template

Inspect the actual repository before changing anything.

The existing `.github/pull_request_template.md` already defines:

- Why / Scope
- BEFORE
- AFTER
- Security and tenant isolation
- Verification
- Compatibility and operations
- Review verdict

Preserve these sections and their existing requirements.

If the template exists, update it rather than creating a duplicate.

Add a concise section immediately after Why / Scope:

### Understand this PR — Explication simple

Require:

- One-sentence summary in French.
- Why the change is necessary.
- BEFORE vs AFTER application behavior.
- One concrete example.
- Three key takeaways.
- What Patrick can test or observe.
- An explanation of unfamiliar concepts when applicable.

For documentation-only PRs, explain what decisions changed and why.

Keep the technical BEFORE/AFTER sections separate. The pedagogical explanation must not replace architectural evidence.

Clarify review verdict semantics:

- READY: mandatory checks passed.
- READY WITH DOCUMENTED RISK: only explicitly accepted, non-blocking residual risks.
- BLOCKED: mandatory controls failed or blocking vulnerabilities remain.
- UNVERIFIED: insufficient evidence to approve.

Critical security vulnerabilities, unauthorized cross-tenant access, unresolved secret exposure, or missing mandatory security validation cannot be accepted through risk documentation alone.

Confirm that all references to the PR template resolve correctly.

## 5. Refine the Developer Free BYOK model

Clarify the distinction between:

- Personal BYOK credentials.
- Tenant/workspace-managed credentials.
- Service-only integration credentials.

Explain the initial onboarding experience for an individual developer.

Developer Free must remain straightforward and secure.

Do not force developers to understand complex tenant administration before their first successful API call.

Internally, tenant isolation and authorization remain mandatory even for individual accounts.

Identify which advanced functions belong to BYOK Pro, without restricting essential security controls.

Do not implement billing or entitlements during PR00.

## 6. Refine the implementation roadmap

Keep the accepted architecture, but reduce oversized PRs.

### PR01A — Workspace Foundation

- pnpm workspace and Turbo.
- Canonical `@cyrantis/core`.
- Minimal `control-api` and `gateway-api` NestJS applications.
- React/Mantine Console skeleton.
- Package dependency rules.
- TypeScript strict configuration.
- CI foundation.
- Reproducible builds and initial tests.

### PR01B — Runtime & Deployment Foundation

- Independent OCI images.
- Docker Compose.
- Simple Caddy reverse proxy configuration.
- Health and readiness endpoints.
- PostgreSQL development environment.
- Redis/Valkey selection and compatibility checks.
- Externalized configuration.
- Clear startup, shutdown and migration responsibilities.

Preserve future Kubernetes and Argo CD compatibility without implementing those platforms now.

### PR02 — Identity and Tenant Isolation

Review whether identity, authorization, database roles and RLS require smaller PRs.

### PR03 — Minimal Provider SDK

Preserve focused provider contracts and native/aggregator parity tests.

### PR04 and later — BYOK, Execution and Governance

Break oversized deliverables into smaller implementation PRs, particularly:

- Credential lifecycle and secure storage.
- Authorization and service identity.
- Quota reservation and distributed admission.
- Provider execution and streaming.
- Durable usage metering and uncertain execution handling.

Do not weaken quality gates to make the roadmap shorter.

Each PR must have clear acceptance criteria, security requirements and verification steps.

## 7. Architecture and security consistency review

Check the finalized planning documents for contradictions concerning:

- Ownership of shared TypeORM entities.
- Database migrations and schema compatibility.
- Database runtime roles and tenant RLS.
- Credential encryption and authorization boundaries.
- Shared core package responsibilities.
- Control API versus Gateway API ownership.
- Provider SDK versus provider adapter responsibilities.
- Streaming and asynchronous job execution.
- Redis/Valkey distributed coordination.
- Docker/Caddy deployment portability.
- Future Kubernetes/Argo CD rollout compatibility.
- PGS service authority versus Gateway evaluation transport.

Do not introduce new frameworks or abstractions merely to eliminate theoretical duplication.

A shared package must reduce duplication without becoming a giant collection of unrelated functionality.

Preserve simple dependency boundaries and prohibit circular dependencies.

## 8. Documentation verification

Validate all PR00 documentation links and references.

Verify that:

- ADR-001 reflects the accepted architecture.
- The architecture diagrams match the actual decisions.
- The roadmap matches the architecture.
- The threat model reflects both runtime applications.
- The quality gates contain enforceable acceptance criteria.
- Provider parity requirements are consistent.
- All referenced files exist in the repository.
- The PR template is present at its expected path.
- `AGENTS.md` references the new `pr-explainer` skill.
- No planning document claims that unimplemented functionality is already working.

Report documentation-only checks separately from runtime tests.

Do not claim security, integration or production readiness verification that has not actually been performed.

## 9. Scope restrictions

This task is limited to finalizing PR00 documentation and project instructions.

Do not:

- Implement PR01A or PR01B.
- Scaffold runtime functionality.
- Modify `lxp-llm-gateway`.
- Modify `presence-grounding-service`.
- Modify `public-website`.
- Create unnecessary architectural layers.
- Change accepted decisions without documented justification.
- Push, merge or create a remote repository without explicit approval.

Read the existing repository instructions before editing.

Preserve unrelated work and keep the changes focused.

## 10. Final PR00 report — In French

Use the `pr-explainer` skill to explain the completed PR00 in clear French.

Present:

### PR00 en 60 secondes
What did we accomplish, and why does it matter?

### BEFORE → AFTER
What architectural decisions changed between the initial proposal and the finalized design?

### Architecture retenue
Explain Control API, Gateway API, Core, Provider SDK, database, cache and Console using one concrete request flow.

### Sécurité
What security boundaries have been designed? Which controls still require implementation and testing?

### Les trois choses à retenir
Highlight the most important outcomes.

### Ce qui reste à faire
Identify remaining risks, unanswered questions and deferred work.

### PR01A — Prochaine étape
Describe exactly what PR01A will implement, what it will not implement, and how Patrick will be able to validate it.

### Validation
List the actual commands executed, their results, and any checks that were not run.

### Final verdict
Choose READY, READY WITH DOCUMENTED RISK, BLOCKED or UNVERIFIED, with evidence-based justification.

Do not confuse PR00 documentation readiness with production security certification.

## Final instruction

Our goal is not merely to generate working code.

We want an application that Patrick understands, can maintain, can secure, and can extend confidently over many years.

Every architectural decision must be defensible.

Every important security boundary must eventually be testable.

Every meaningful PR must be understandable.

**Build a temple, not a cathedral. No vibe-coded spaghetti.**

Finalize PR00, provide the review, and stop before starting PR01A.