# Cyrantis LLM Gateway

An independent multi-provider LLM gateway with planned free BYOK access and baseline security on every plan.

**Status: PR01A workspace foundation implemented.** Two inert Nest API shells, a React/Mantine Console, a small shared core and executable quality checks. Identity, providers, persistence and deployment remain future work.

Use the [PowerShell development guide](docs/DEVELOPMENT.md) to install, check and start each application. The [documentation map](docs/README.md) distinguishes current implementation from the target architecture. Reference applications remain read-only.

With Node 24.22.1 and pnpm 12.15.0 active:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd build
pnpm.cmd test
pnpm.cmd dev:console
```

The Console runs at `http://127.0.0.1:5173`. In separate terminals, `pnpm.cmd dev:control` and `pnpm.cmd dev:gateway` start the independent API shells on ports 3001 and 3002. Undeclared routes return 404.

## Start here

| Document                                                                     | Purpose                                                                            |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [PR01A review](docs/prs/pr-01/pr-01a-review.md)                              | Actual implementation, verification, tradeoffs and remaining limits                |
| [PR01A brief](docs/prs/pr-01/pr-01a-workspace-foundation.md)                 | Authorized workspace scope and acceptance criteria                                 |
| [PR00 review](docs/planning/PR00-REVIEW.md)                                  | French final report, actual verification, remaining decisions and PR01A handoff    |
| [Finalization brief](docs/prs/pr-00/pr-00-finalize.md)                       | Accepted scope, PR governance and finalization requirements                        |
| [Roadmap](docs/planning/ROADMAP.md)                                          | PR01A/B, PR02A–C, PR04A–E and subsequent milestones                                |
| [Developer Free BYOK](docs/planning/DEVELOPER-BYOK.md)                       | Individual onboarding, personal/workspace/service credentials and offer boundaries |
| [ADR update brief](docs/prs/pr-00/pr-00-adr-update.md)                       | Maintainer direction and explicit PR00 scope                                       |
| [ADR-001](docs/architecture/decisions/ADR-001-control-gateway-separation.md) | Accepted two-API topology and shared core                                          |
| [Architecture](docs/architecture/ARCHITECTURE.md)                            | App/package boundaries, deployment, data and entitlements                          |
| [Access boundaries](docs/security/ACCESS-BOUNDARIES.md)                      | Database grants, identity, credentials, revocation and failure contract            |
| [Provider parity](docs/architecture/PROVIDER-PARITY.md)                      | Observed behavior, SDK proposal, and contract-test strategy                        |
| [Console journeys](docs/planning/CONSOLE-UX.md)                              | Navigation, onboarding, Labs, and acceptance scenarios                             |
| [Threat model](docs/security/THREAT-MODEL.md)                                | Trust boundaries, abuse cases, and negative test matrix                            |
| [Quality gates](docs/planning/QUALITY-GATES.md)                              | Required evidence by delivery stage                                                |
| [Stack assessment](docs/planning/STACK-ASSESSMENT.md)                        | Local versions, current release observations, and pinning gates                    |
| [LXP assessment](docs/discovery/LXP-ASSESSMENT.md)                           | Implementation inventory and reuse dispositions                                    |
| [PGS integration](docs/discovery/PGS-INTEGRATION.md)                         | Evidence transport and independent decision authority                              |
| [Website assessment](docs/discovery/WEBSITE-ASSESSMENT.md)                   | Separate website evolution and publication gates                                   |
| [Inspection record](docs/discovery/INSPECTION-RECORD.md)                     | Local snapshots, source references, and limitations                                |

The ADR update accepts separate `control-api` and `gateway-api` deployments and canonical `@cyrantis/core` definitions. PR01A introduces only the consumed browser-safe contracts; TypeORM, identity, tenant isolation, credentials and execution are requirements for later slices. PR01B will introduce the deployment foundation. Builds and smoke tests do not establish production security or deployed integration.
