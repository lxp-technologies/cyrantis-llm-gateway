# Cyrantis LLM Gateway — PR00: Discovery, Architecture & Engineering Plan

## Mission

Laurie Codex, we are starting a new commercial product: **Cyrantis LLM Gateway**.

Our goal is to build a security-first, enterprise-grade multi-provider LLM gateway, based on the architectural and functional lessons learned from LXP LLM Gateway.

**We are building a temple, not a cathedral.**

The result must be secure, maintainable, predictable, modular, observable, easy to deploy, and pleasant to use.

Avoid overengineering, accidental complexity, speculative abstractions, unnecessary services, and code generated merely to satisfy a feature checklist.

We want engineering quality comparable in discipline to mature commercial security and software platforms. This is an aspiration supported by verifiable requirements, not an unsupported certification claim.

## Local repositories

Inspect these three existing applications:

1. `C:\Data\Workspace\TypeScript\lxp-llm-gateway`
    - Existing open-source gateway
    - Provider SDK and adapters
    - Gateway/Admin APIs
    - BYOK, tenant policies, streaming
    - Chat, image, video and evaluation labs
    - OpenAI-compatible API and Open WebUI integration

2. `C:\Data\Workspace\TypeScript\presence-grounding-service`
    - Current PGS architecture
    - Evaluation integration
    - Decision boundaries
    - Policy and authorization contracts
    - Identity, continuity and grounding concepts

3. `C:\Data\Workspace\TypeScript\public-website`
    - Existing LXP Technologies public website
    - Future commercial Cyrantis identity
    - Marketing, product and documentation integration

Proposed new repository:

`C:\Data\Workspace\TypeScript\cyrantis-llm-gateway`

The new repository must be independent from LXP.

**IMPORTANT: PR00 is discovery and planning only.**

Treat the three existing repositories as read-only. Do not modify, delete, reformat, commit or push anything in them.

Inspect existing `AGENTS.md` files, documentation, source code, manifests, tests, migrations and Git status before drawing conclusions.

Do not assume the GitHub remote version matches the current local implementation.

Do not create production application code during PR00.

If the destination does not exist, it may be created with planning documentation only. Do not overwrite an existing destination or initialize a remote repository without approval.

## Required Codex skills

Use the relevant installed Laurie Codex skills, particularly:

- `enterprise-application-engineering`
- `secure-coding`
- `tenant-isolation-engineering`
- `architecture-pr-review`
- `ux-product-design`
- `nestjs-typescript-developer`
- `react-19-vite-developer`
- `docker-compose-developer`
- `github-action-ci`

Use additional skills when appropriate.

Security, tenant isolation, maintainability and architectural consistency are mandatory quality gates, not optional enhancements.

## 1. Map the current LXP Gateway

Produce a factual architectural inventory covering:

- Monorepo structure and dependencies
- Provider SDK and adapter contracts
- Native providers and aggregators
- Model discovery and capability metadata
- Chat, streaming and multimodal behavior
- Structured output, tool calling and error handling
- Image, video, audio and other supported capabilities
- Authentication and tenant boundaries
- BYOK credential lifecycle and resolution
- Integration clients and service identities
- Rate limiting, quotas, metering and budgets
- Audit, observability and persistence
- Labs and operator-facing workflows
- OpenAI-compatible endpoints and Open WebUI
- Docker, Caddy, CI and deployment configuration
- Existing tests, limitations and known risks

Classify components as:

**KEEP CONCEPT / REDESIGN / REIMPLEMENT / REMOVE / DEFER**

Identify the technical debt caused by excessive coupling, duplicated provider logic, unnecessary abstractions, oversized components and ambiguous responsibilities.

Do not equate code size or abstraction count with architectural quality.

Inspect the LXP Apache 2.0 license, applicable notices, dependencies and code provenance before proposing code reuse. Prefer a fresh implementation driven by documented contracts and tests.

## 2. Design a minimal Provider SDK

This is a major architectural priority.

We want consistent behavior between native providers and aggregator integrations such as OpenRouter and NanoGPT.

Create a **Provider Capability & Parity Matrix** based on real implementation evidence.

For shared capabilities, native and aggregator routes must expose equivalent normalized semantics whenever technically possible.

Review:

- Input and output contracts
- Model and capability discovery
- Streaming events and finalization
- Tool/function calls
- Structured JSON output
- Reasoning metadata
- Multimodal inputs
- Images, video and audio
- Provider errors and retryability
- Timeouts, cancellation and usage reporting

Important distinctions:

1. Never claim parity for capabilities an upstream provider does not support.
2. Never silently drop unsupported fields.
3. Never invent provider capabilities.
4. Normalize genuinely common behavior in a small shared contract.
5. Resolve provider-specific differences in the relevant adapter or provider-owned mapping.
6. Avoid scattering provider-specific conditionals across the application.
7. Avoid building a complex plugin framework unless justified by real requirements.
8. Validate parity using reusable contract tests and representative fixtures, with optional credentialed integration tests.

Document where exact parity is impossible and why.

The Provider SDK should make adding or correcting a provider straightforward without changing unrelated providers.

## 3. Security and multi-tenant architecture

Treat security as a foundational engineering requirement.

Use OWASP ASVS 5.0, OWASP API Security Top 10 and established secure-development practices as reference baselines.

Produce an initial threat model covering external callers, providers, aggregators, administrators, tenants, service accounts, secrets, queues, databases and integrations.

Required controls include:

- Default-deny authorization
- Tenant identity derived from trusted authentication context
- Object-level and function-level authorization
- Protection against IDOR/BOLA and mass assignment
- PostgreSQL row-level security as defense in depth where appropriate
- No cross-tenant reads, writes, exports, streams or background job leakage
- Tenant-aware cache and storage partitioning
- Strong separation between user and machine-to-machine identities
- Scoped API keys, rotation and revocation
- Encrypted provider credentials and protected encryption keys
- No secrets or sensitive prompts in unauthorized logs
- SSRF protection for provider endpoints and external resource URLs
- Input validation, body limits, concurrency limits and timeout controls
- Atomic quotas and budget enforcement
- Safe retries and idempotency
- Secure audit trails with appropriate retention policies
- Negative authorization tests, including adversarial API requests

Build a security test matrix that demonstrates what a tenant, user or integration client **cannot** access.

A JWT that validates successfully does not automatically authorize access to every object referenced by a request.

Security features must not be withheld from the free BYOK plan.

## 4. Proposed technology stack

Preserve the proven ecosystem while selecting stable, compatible releases:

- NestJS and TypeScript for the backend
- React, Mantine, Vite and TanStack Query for the frontend
- PostgreSQL for durable transactional data
- Redis **and** Valkey compatibility
- pnpm and Turbo for the monorepo
- Docker Compose for reproducible deployment
- Caddy as reverse proxy with straightforward HTTPS configuration
- OpenAPI and versioned contracts
- Automated unit, integration, contract, security and E2E testing

Verify actual installed versions, current stable releases, migration compatibility and security advisories before recommending pinned versions.

Prefer a modular monolith and clear control-plane/data-plane boundaries. Do not introduce microservices without demonstrated need.

PostgreSQL remains authoritative for durable state. Redis/Valkey support transient state and distributed coordination, with explicit consistency and failure semantics.

## 5. Rebuild the UI from scratch

Do not migrate the existing UI component structure automatically.

Map current workflows and propose a new information architecture.

Primary sections should include:

- Overview
- Providers & BYOK Credentials
- Playground / Exploration Labs
- API Integrations
- Tenants & Access
- Governance & Policies
- Usage & Billing
- Settings

Preserve the useful exploration Labs, including chat, image, video and structured evaluation.

UX requirements:

- Clear, task-oriented navigation
- Plain-language field names and explanations
- Examples for unfamiliar configuration values
- Inline validation and actionable errors
- Progressive disclosure
- Steppers for genuinely complex multi-step forms
- Saved progress and predictable back navigation
- Typed state machines or Strategy Pattern when branching forms justify them
- Responsive layouts and accessibility
- Explicit confirmation for destructive or financially consequential changes
- No exposure of internal UUIDs when the UI can offer a meaningful selector

Avoid complicated forms that force users to understand our database model.

Produce initial user journeys and a proposed navigation map before creating UI components.

## 6. Map PGS integration

Inspect the actual PGS contracts and design an integration boundary without merging PGS into the Gateway.

The Gateway owns:

- Provider routing and execution
- Credentials and usage
- Provider normalization
- Structured model evaluation transport

PGS owns:

- Grounding decisions
- Policy evaluation
- Consent and authority boundaries
- Decision provenance and expiry
- Its own authorization semantics

Preserve the principle:

**Intent is not permission.**

Ensure PGS decisions and host decisions remain distinguishable.

Document:

- Service-to-service authentication and scopes
- Request and response contracts
- Correlation and audit identifiers
- Failure modes and fail-closed requirements
- Timeout and retry behavior
- Tenant authority
- Data privacy and retention
- Versioning and compatibility

Do not implement PGS internally as a Gateway module.

Identify the minimum interfaces required for V1 integration and those that can be deferred.

## 7. Business model and entitlements

The new product should support:

**Developer Free**
- BYOK as a free entry point
- Basic routing, provider configuration and reasonable quotas
- Essential security protections included

**BYOK Pro**
- Optional low-cost subscription
- 30-day free trial
- No payment method required to start the trial
- Manual trial extension on request
- Advanced administration, analytics, collaboration and other meaningful Pro features

**Usage-based services**
- Transparent metering
- Predictable budgets and ceilings
- PGS as a separately governed and potentially metered service
- No mandatory subscription for basic BYOK

Avoid confusing provider-side inference charges with Cyrantis platform charges.

Do not build the billing system in PR00. Design only the domain concepts, permissions and extension points.

## 8. Public website integration

Inspect `public-website` and propose its evolution toward Cyrantis branding.

Determine what should be reused and what requires redesign.

Plan for:

- Cyrantis positioning and product overview
- Gateway features and supported providers
- Developer Free / BYOK Pro / usage-based offers
- Clear explanations of PGS and its independent role
- Technical documentation and API quickstart
- Sign-up and login entry points
- Privacy, security and commercial information
- Future pricing, trials and account management

Avoid publishing unapproved prices, certifications, guarantees or unsupported claims.

Do not modify the public website during PR00.

The website remains a separate application and repository unless the architecture analysis demonstrates a strong reason otherwise.

## 9. Deployment and future on-premise support

V1 should deploy simply on the existing VPS, with secure defaults.

Design a reproducible Docker Compose + Caddy setup:

- Minimal required configuration
- Automatic HTTPS when domain/DNS prerequisites are met
- Health checks and startup dependencies
- Database migration procedure
- Clear secret management
- Non-public internal service ports
- Redis or Valkey selection
- Logging, monitoring and backups
- Tested rollback and restore procedures

Prepare architectural portability for a future self-hosted/on-premise edition.

Do **not** make enterprise on-premise distribution a V1 requirement.

Avoid mandatory dependencies on Cyrantis Cloud infrastructure in the domain core.

## 10. PR workflow and engineering governance

Every implementation PR must have documented BEFORE and AFTER sections.

BEFORE:
- Problem and expected value
- Existing behavior
- Proposed design
- Affected contracts and components
- Alternatives and tradeoffs
- Security and tenant-isolation risks
- Expected tests and acceptance criteria

AFTER:
- Actual implementation and differences
- Decisions taken and justification
- Tests run and their results
- Security checks and residual risks
- Backward compatibility
- Deployment and rollback considerations
- Deferred work

Create an ADR for consequential, lasting architectural decisions. Do not create ceremonial ADRs for trivial changes.

Never mark a PR complete when required tests are missing or failing.

Prefer small, independently reviewable PRs.

No speculative framework-building, giant refactoring PRs or silent scope expansion.

## 11. PR00 deliverables

Create concise planning documentation in the new repository, including:

- `AGENTS.md` — durable project engineering rules
- `docs/discovery/LXP-ASSESSMENT.md`
- `docs/discovery/PGS-INTEGRATION.md`
- `docs/discovery/WEBSITE-ASSESSMENT.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/PROVIDER-PARITY.md`
- `docs/security/THREAT-MODEL.md`
- `docs/planning/ROADMAP.md`
- `docs/planning/QUALITY-GATES.md`

Consolidate documents if necessary to avoid redundant paperwork.

The roadmap must contain:

- PR number and objective
- Dependencies
- Scope and explicit exclusions
- Acceptance criteria
- Mandatory testing
- Security implications
- Relevant architecture decisions

Detail the first four implementation PRs precisely. Keep later phases at roadmap level until discovery justifies their design.

## Final reporting

At the end of PR00, report:

1. What was actually inspected in each repository.
2. Existing strengths worth preserving.
3. Major architectural and security risks.
4. Recommended target architecture.
5. Provider SDK design and parity strategy.
6. Proposed Console UX and Labs.
7. PGS integration approach.
8. Public website integration plan.
9. Initial delivery roadmap.
10. Decisions requiring Patrick's approval.

Clearly distinguish verified facts, recommendations and unresolved questions.

Do not claim tests or audits were completed if they were not.

Do not modify the existing repositories, generate application scaffolding, create a remote repository or begin PR01 without explicit approval.

**Our engineering principle: A feature is not complete just because it works. It must be secure, testable, maintainable, understandable and safe to extend.**

Let's start with a high-quality PR00. No cathedral. No vibe-coded spaghetti. Build a temple.