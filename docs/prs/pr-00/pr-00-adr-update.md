# Cyrantis PR00 — Architecture Decision Update

Laurie Codex, we have reviewed PR00 and made an architectural decision.

**ADR-001 must be revised before PR01.**

We are not adopting the single-NestJS-application topology.

## 1. Mandatory application separation

The architecture shall contain two independently deployable NestJS applications:

**control-api**
- Authentication and administration
- Tenant and user management
- BYOK credential lifecycle
- Provider configuration
- Policies, plans, licensing and entitlements
- Administrative operations

**gateway-api**
- LLM provider routing and inference
- Chat and SSE streaming
- Multimodal execution
- Model discovery
- Provider credential resolution
- Admission, quota enforcement and usage recording
- Structured evaluation transport

Keep both applications inside one pnpm workspace.

Separate responsibilities, runtime privileges, deployment lifecycles and resource usage.

Avoid creating microservices for individual features.

## 2. Shared @cyrantis/core package

Use a canonical `@cyrantis/core` package for genuinely shared business and technical components.

Centralize:
- Shared domain models
- Common TypeORM entity definitions
- Shared value objects
- Tenant context contracts
- Common authorization primitives
- Cross-application DTOs and schemas
- Shared validation and error contracts
- Reusable domain invariants
- Database schema and migration definitions, with a single migration execution owner

Do not duplicate entity definitions or common business rules across the applications.

However:
- Do not build a giant all-purpose CoreService.
- Keep application-specific workflows in their owning application.
- Do not import application-specific NestJS modules from core.
- Prefer framework-independent contracts where practical.
- Sharing entity classes must not grant broad database privileges.
- Use distinct database roles and explicit ownership of reads and writes.
- Enforce tenant authorization and RLS independently of shared code.
- Never run migrations automatically from both applications.

The Provider SDK remains a focused package with minimal contracts and provider-owned adapters.

Do not move provider-specific implementation details into core.

## 3. pnpm monorepo

Use pnpm as the single package manager.

Proposed structure:

```text
cyrantis-llm-gateway/
├── apps/
│   ├── control-api/
│   ├── gateway-api/
│   └── console/
├── packages/
│   ├── core/
│   ├── provider-sdk/
│   └── providers/
├── infra/
│   ├── compose/
│   └── caddy/
├── docs/
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
└── turbo.json
```

Use workspace dependencies, reproducible installation, clear dependency boundaries, independently built applications and one canonical lockfile.

Avoid dependency cycles and unnecessary framework abstractions.

## 4. VPS now, Kubernetes later

Cyrantis V1 will initially run on a VPS using Docker Compose and Caddy.

**Do not constrain the architecture to VPS deployment.**

Design for possible future deployment to:
- Kubernetes
- Managed cloud platforms
- Argo CD / GitOps
- External PostgreSQL
- Managed Redis or Valkey
- External secrets management
- Object storage
- Independently scaled application replicas

Mandatory design considerations:
- Stateless application containers
- External configuration and secrets
- Independent OCI images
- Startup, readiness and liveness endpoints
- Graceful shutdown and SSE cancellation
- Dedicated migration jobs
- No persistent dependency on local container storage
- Portability of reverse proxy and ingress
- Distributed-safe quotas and coordination
- Backward-compatible application/database migrations
- Structured logs, metrics and distributed tracing
- Externalizable storage and infrastructure adapters

Kubernetes, Helm and Argo CD deployment implementations are **not mandatory for V1**.

Do not create speculative Kubernetes configuration without a validated deployment requirement.

Caddy must remain an infrastructure component, not an application dependency.

## 5. Enterprise security

The separation must reduce security blast radius.

The Gateway must not acquire full administrative database privileges simply because it imports shared entities.

Document:
- Database roles and access permissions
- Tenant context and RLS strategy
- Credential access and decryption boundaries
- Human and service identity separation
- Administrative versus inference permissions
- Cross-tenant negative tests
- Failure and recovery behavior
- Database and schema compatibility during independent deployments

Security controls must be verified through tests, not assumed from package organization.

## 6. Provider SDK remains minimal

Preserve the original PR00 requirement:

**Build a temple, not a cathedral.**

Use a small provider contract with explicit capabilities.

Native providers and aggregators must expose consistent normalized behavior for shared capabilities.

Address legitimate upstream differences inside provider-owned adapters.

Do not introduce new architectural layers solely because the system now contains two NestJS applications.

## 7. Update PR00 documentation

Revise:
- ADR-001
- ARCHITECTURE.md
- ROADMAP.md
- QUALITY-GATES.md
- THREAT-MODEL.md
- Relevant implementation plans

Explain the BEFORE/AFTER architectural decision:

**BEFORE:** One NestJS application selected primarily to reduce duplication and deployment complexity.

**AFTER:** Two independently deployable NestJS applications, with common definitions consolidated in `@cyrantis/core`, a shared pnpm workspace, controlled database ownership and a cloud-portable deployment design.

Explain why this addresses our concerns without recreating LXP's excessive complexity.

Update PR01 acceptance criteria to include:
- Both NestJS application skeletons
- The core package
- Shared contract boundaries
- Independent builds and container images
- Redis/Valkey configuration
- Docker Compose + Caddy foundation
- Basic health endpoints
- CI quality gates

Do not implement PR01 yet.

Do not modify LXP, PGS or the public website.

This task is limited to correcting the PR00 architecture documentation and corresponding roadmap.

Provide a concise summary of revised decisions, tradeoffs and remaining risks when finished.

**Architectural rule: Share common code. Separate responsibilities. Keep deployments portable. Never sacrifice security or maintainability for superficial simplicity.**