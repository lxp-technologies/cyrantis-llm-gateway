# Cyrantis LLM Gateway

A planned, independent multi-provider LLM gateway with free BYOK access and security controls available on every plan.

**Status: PR00 discovery and planning. No application has been implemented or deployed.**

The working repository is this repository under `cyrantis/cyrantis-llm-gateway`, on `chore/init`. The destination suggested in the [original brief](docs/pr-00-discovery-architecture-plan.md) is superseded by the existing workspace. Reference applications remain read-only.

## Start here

| Document | Purpose |
| --- | --- |
| [PR00 review](docs/planning/PR00-REVIEW.md) | French final report, actual verification, remaining decisions and PR01A handoff |
| [Finalization brief](docs/pr-00-finalize.md) | Accepted scope, PR governance and finalization requirements |
| [Roadmap](docs/planning/ROADMAP.md) | PR01A/B, PR02A–C, PR04A–E and subsequent milestones |
| [Developer Free BYOK](docs/planning/DEVELOPER-BYOK.md) | Individual onboarding, personal/workspace/service credentials and offer boundaries |
| [ADR update brief](docs/pr-00-adr-update.md) | Maintainer direction and explicit PR00 scope |
| [ADR-001](docs/architecture/decisions/ADR-001-control-gateway-separation.md) | Accepted two-API topology and shared core |
| [Architecture](docs/architecture/ARCHITECTURE.md) | App/package boundaries, deployment, data and entitlements |
| [Access boundaries](docs/security/ACCESS-BOUNDARIES.md) | Database grants, identity, credentials, revocation and failure contract |
| [Provider parity](docs/architecture/PROVIDER-PARITY.md) | Observed behavior, SDK proposal, and contract-test strategy |
| [Console journeys](docs/planning/CONSOLE-UX.md) | Navigation, onboarding, Labs, and acceptance scenarios |
| [Threat model](docs/security/THREAT-MODEL.md) | Trust boundaries, abuse cases, and negative test matrix |
| [Quality gates](docs/planning/QUALITY-GATES.md) | Required evidence by delivery stage |
| [Stack assessment](docs/planning/STACK-ASSESSMENT.md) | Local versions, current release observations, and pinning gates |
| [LXP assessment](docs/discovery/LXP-ASSESSMENT.md) | Implementation inventory and reuse dispositions |
| [PGS integration](docs/discovery/PGS-INTEGRATION.md) | Evidence transport and independent decision authority |
| [Website assessment](docs/discovery/WEBSITE-ASSESSMENT.md) | Separate website evolution and publication gates |
| [Inspection record](docs/discovery/INSPECTION-RECORD.md) | Local snapshots, source references, and limitations |

The ADR update accepts separate `control-api` and `gateway-api` deployments with canonical `@cyrantis/core` TypeORM definitions. Detailed security/operational controls and roadmap items remain design requirements, not implemented guarantees. The update supersedes conflicting single-API recommendations from the first discovery pass. PR00 finalization is documentation-only; PR01A/PR01B require subsequent implementation authorization; no production scaffolding, package installation, remote creation, commit, or push is included in PR00.
