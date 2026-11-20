# Documentation map

Use this map to distinguish the implemented workspace from the target product architecture.

| Area                  | Start here                                                                                                                          | Purpose                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Current development   | [Development guide](DEVELOPMENT.md)                                                                                                 | PowerShell setup, checks, independent startup and package ownership          |
| Current PR            | [PR01A brief](prs/pr-01/pr-01a-workspace-foundation.md), [review](prs/pr-01/pr-01a-review.md)                                       | Authorized scope, actual behavior, evidence and limits                       |
| Architecture          | [Architecture](architecture/ARCHITECTURE.md), [ADR-001](architecture/decisions/ADR-001-control-gateway-separation.md)               | Accepted two-API/core direction and future deployment boundaries             |
| Security              | [Access matrix](security/ACCESS-BOUNDARIES.md), [threat model](security/THREAT-MODEL.md)                                            | Requirements for later identity, tenant isolation, secrets and execution PRs |
| Delivery              | [Roadmap](planning/ROADMAP.md), [quality gates](planning/QUALITY-GATES.md)                                                          | Slice dependencies and mandatory evidence                                    |
| Product/UX            | [BYOK ownership](planning/DEVELOPER-BYOK.md), [Console journeys](planning/CONSOLE-UX.md)                                            | Planned individual/team/service behavior                                     |
| Providers/integration | [Parity](architecture/PROVIDER-PARITY.md), [PGS](discovery/PGS-INTEGRATION.md)                                                      | Later SDK contracts and independent PGS authority                            |
| Discovery             | [Inspection record](discovery/INSPECTION-RECORD.md), [LXP](discovery/LXP-ASSESSMENT.md), [website](discovery/WEBSITE-ASSESSMENT.md) | Historical source-backed observations; no reference source copied            |
| PR00 archive          | [Final report](planning/PR00-REVIEW.md), [finalization brief](prs/pr-00/pr-00-finalize.md)                                          | Planning history and accepted constraints                                    |

PR01A implements inert applications, builds and workspace checks only. Statements about credentials, RLS, quotas, providers and deployment in planning documents remain requirements for later slices. The original briefs are preserved as inputs, not edited into completion reports.
