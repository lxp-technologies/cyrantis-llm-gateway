# ADR-001: Separate control and execution applications with canonical shared definitions

- Status: Accepted topology and package ownership, per the [maintainer's architecture update](../../prs/pr-00/pr-00-adr-update.md); implementation unstarted
- Date: 2026-10-25
- Owner: Project maintainer
- Affected systems: API, Console, providers, persistence, deployment, PGS integration

## BEFORE and reason for revision

The initial PR00 proposal selected one Nest application primarily to reduce duplicate definitions and deployment work. It combined administration, secret lifecycle and inference in one process, giving those workloads the same resource and compromise boundary. The maintainer rejected that topology before PR01. No runtime or migration depends on it.

LXP's duplicated entities and broad composition modules are problems of ownership, not proof that two applications are inherently too complex. Inspection found different `TenantPolicyEntity` fields in its Admin/Gateway copies and shared database configuration variables for runtime and migration services. See [LXP assessment](../../discovery/LXP-ASSESSMENT.md). Cyrantis addresses duplication centrally while separating runtime privileges.

## AFTER: accepted decision

- Two independently built, deployable and scalable Nest applications: `control-api` for authentication/administration/configuration and `gateway-api` for execution, admission, streaming and usage. Each remains internally modular; do not create a service per feature.
- One pnpm workspace/lockfile and canonical `@cyrantis/core` for common domain/value objects, tenant/authorization primitives, shared DTO/schema/error contracts, TypeORM entities and migrations. Explicit browser-safe and server-only exports; no application modules, provider details, global DataSource or all-purpose CoreService.
- Distinct runtime database/service identities with an explicit read/write matrix. A dedicated migration job is the single execution owner. Shared classes do not confer permissions; neither runtime owns schema objects, bypasses RLS or runs DDL.
- PostgreSQL is durable authority; Redis/Valkey provide bounded distributed coordination. Provider contracts stay small and adapters are composed only in Gateway. PGS evaluation remains evidence, with independent PGS and host authority.
- Separate OCI images, stateless applications, external configuration/secrets/storage, independent probes/drain behavior and compatible schemas/contracts. Compose/Caddy is the first target; Kubernetes, managed services and GitOps remain possible without implementing their manifests in V1.

The detailed design is in [architecture](../ARCHITECTURE.md) and [access boundaries](../../security/ACCESS-BOUNDARIES.md). Implementation mechanics remain subject to verification; accepting the topology does not establish working security controls.

## Alternatives

| Alternative | Benefit | Cost / disposition |
| --- | --- | --- |
| Copy LXP's two APIs and duplicated entities | Familiar layout | Retains entity drift, mixed privileges and oversized workflows; rejected |
| Microservices or dynamic plugin framework | Independent scaling/distribution | Extra auth, contract, queue and operational burden; defer until measured requirements |
| One unstructured API with provider conditionals | Fast initial wiring | Spreads mapping and authority ownership; reject |
| One modular API | Fewer processes and deployment artifacts | Shared privilege/resource boundary; superseded by the maintainer's decision |
| Two modular APIs with canonical core and narrow grants | Independent deployment/resources; no duplicate entities | Requires schema/token compatibility, explicit data ownership and two operational paths; selected |

## Consequences

Gateway cannot administer tenants, memberships, policies, plans or keys merely because it imports their definitions. Control does not execute provider inference or mutate usage settlement. Separate images allow different resource limits and rollouts. Avoid a mandatory Control HTTP call for each inference; Gateway verifies identity and current authorization through narrowly granted durable reads.

The applications still share schema and infrastructure. Core changes can affect both builds, and independent deployment requires a tested compatibility window. Application-set RLS context protects against missing predicates, not arbitrary code execution in a trusted process. Gateway processes plaintext provider keys for authorized execution; database grants and key-service policy limit but cannot eliminate that exposure. Two containers on one VPS are not host isolation or high availability.

## Validation and rollout

The [finalization brief](../../prs/pr-00/pr-00-finalize.md) preserves this ADR and narrows delivery slices. PR01A delivers both inert API skeletons, core exports, independent source builds, Console and CI; PR01B adds independent images, Compose/Caddy, Redis/Valkey configuration, probes, shutdown and migration-job contract. PR02A proves roles/TypeORM/RLS/migrations, PR02B human identity/private workspace, and PR02C developer/service identity and Gateway verification. PR03 proves native/aggregator contracts. PR04A–E separately prove credentials, durable admission/usage, distributed coordination/revocation, non-stream execution, then streaming/onboarding. No execution path opens before its preceding safeguards pass. Schema changes test old/new application combinations before independent rollout. See [roadmap](../../planning/ROADMAP.md).

This revision changes documentation only. Future releases expand the schema first, deploy compatible images independently, and contract after the rollback window; never run automatic down migrations at app startup.

## Revisit triggers

Revisit for measured database contention, stronger tenant/host isolation needs, incompatible schema rollout requirements or a concrete external SDK consumer. Additional services, brokers, databases or deployment platforms require evidence; the accepted split is not an invitation to build a feature-service framework.
