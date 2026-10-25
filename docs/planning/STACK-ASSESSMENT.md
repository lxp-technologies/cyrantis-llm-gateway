# Stack and dependency assessment

Observation date: 2026-10-25. Versions below distinguish manifest declarations, readable installed packages and public release metadata. **No Cyrantis dependency pins or lockfile exist yet.** A newer release is not automatically a compatible or reviewed choice.

## Local evidence

| Component | LXP manifest | PGS manifest | Website manifest |
| --- | --- | --- | --- |
| pnpm | 11.0.7 | 11.21.0 | 11.21.0 |
| TypeScript | ^5.9.3 | ^6.0.3 | 5.9.3 |
| Nest core | ^11.2.6 | ^11.1.28 | N/A |
| React | ^19.3.0 | Not verified in this review | 19.2.8 |
| Mantine | ^9.6.2 | Not verified in this review | No Mantine dependency in web manifest |
| Vite | ^7.3.6 | Not verified in this review | 8.2.1 |
| TanStack Query | ^5.103.2 | Not verified in this review | Not in web manifest |
| Turbo | ^2.11.4 | Not in root manifest | Not in root manifest |
| Persistence | TypeORM ^0.3.31 / pg ^8.23.0 | Prisma ^7.9.1 / pg ^8.22.0 | Static app |

The shell's Node executable reports `22.23.2`. Readable installed root TypeScript reports `5.9.3` in LXP and website. Other sampled linked installed packages were inaccessible; their installed versions are unverified. Lockfile version headers are `9.0` for the sampled LXP and website lockfiles; LXP importer entries resolve the inspected TypeScript/Turbo versions, but the complete dependency tree was not audited. Node/package-manager constraints differ across the repositories; do not transplant a lockfile.

## Release observations from the initial discovery pass

The initial discovery pass retrieved public npm `latest` metadata read-only for all eight packages, including engine and peer fields. These are candidates, not recommended exact pins.

| Package | Observed latest | Important compatibility evidence |
| --- | --- | --- |
| [Nest core](https://registry.npmjs.org/@nestjs%2fcore/latest) | 12.2.0 | Matching Nest 12 companions; [migration guide](https://docs.nestjs.com/migration-guide) identifies ESM/CLI/runtime changes and TypeScript 6 requirement for schematics |
| [React](https://registry.npmjs.org/react/latest) | 19.3.1 | Match React DOM and type packages |
| [Mantine core](https://registry.npmjs.org/@mantine%2fcore/latest) | 9.7.3 | React/DOM ^19.2.0, hooks exactly 9.7.3 |
| [Vite](https://registry.npmjs.org/vite/latest) | 8.3.5 | Node ^20.19.0 or >=22.12.0; review plugin/toolchain migration |
| [TypeScript](https://registry.npmjs.org/typescript/latest) | 7.0.2 | Native compiler/tooling changes require separate validation; latest alone does not establish Nest/lint/test compatibility |
| [pnpm](https://registry.npmjs.org/pnpm/latest) | 12.15.0 | Major change from local pnpm 11; check [migration guidance](https://github.com/pnpm/pnpm.io/blob/main/docs/migration.md), lifecycle/build policy and frozen install |
| [Turbo](https://registry.npmjs.org/turbo/latest) | 2.11.10 | Verify task graph, caching and supported package manager |
| [TanStack Query](https://registry.npmjs.org/@tanstack%2freact-query/latest) | 5.104.5 | React peer ^18 or ^19; scope query caches by authorized tenant |

The official [Node release schedule](https://github.com/nodejs/Release) places Node 24 in maintenance LTS on this date, with Node 26 scheduled for LTS on October 28. The [release list](https://nodejs.org/en/blog/release) reports 24.22.1 and 22.23.4 security releases. Recommend evaluating patched Node 24 LTS for PR01A, then reassessing Node 26 when LTS begins; do not claim local 22.23.2 is the deployment baseline.

Infrastructure observations: PostgreSQL [current documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) is version 18, while 19 is listed as development/RC. [Valkey downloads](https://valkey.io/download/) list 9.1.2 and supported older lines. [Redis release notes](https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/release-notes/redisce/) distinguish 8.10 stable from 8.12 RC. [Caddy's latest release](https://github.com/caddyserver/caddy/releases/tag/v2.11.7) is 2.11.7. Exact database/cache/image digests, Compose version and client compatibility remain unselected; review their terms/security and run the required integration matrix before pinning.

## Security research and what remains open

The official [Node October 21 advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) describes fixes across supported lines, including DNS/TLS and dependencies. Local `22.23.2` precedes the observed patched `22.23.4`; use a patched runtime before implementation checks or deployment. No workstation runtime was changed in PR00.

Reviewed the published [Vite advisory index](https://github.com/vitejs/vite/security/advisories?state=published) and [Valkey advisory index](https://github.com/valkey-io/valkey/security/advisories). This is reconnaissance, **not** an affected-version determination or a clean vulnerability report. Full npm/transitive, React/Nest/plugin, Redis, PostgreSQL, Caddy, container OS and action advisory/license triage is pending against the actual selected lockfile and images. No package audit or image/secret scanner was executed.

## Accepted persistence and package direction

The [ADR update](../prs/pr-00/pr-00-adr-update.md) selects TypeORM with canonical entities/migrations in `@cyrantis/core`; ORM selection is no longer open. Both APIs initially use the same compatible Nest/TypeORM versions through one lockfile, but ship distinct runnable images. Export contracts/domain separately from server persistence/job-only migration modules and prove the browser bundle cannot import TypeORM.

Both API DataSources disable `synchronize` and `migrationsRun`; a dedicated migration job is the only schema executor. TypeORM's [migration setup](https://v0.typeorm.io/docs/migrations/setup/) describes those options, and its [transaction documentation](https://orkhan.gitbook.io/typeorm/docs/transactions) requires using the transaction's supplied manager. Verify every repository/relation path respects that manager and explicit tenant predicates. Avoid ActiveRecord/global repository access that escapes the authorized transaction.

## Recommendation and staged pinning gates

Retain the requested ecosystem: Nest/TypeScript, React/Mantine/Vite/TanStack Query, PostgreSQL, Redis and Valkey, pnpm/Turbo, Compose/Caddy and versioned OpenAPI. Evaluate Nest 12 + a supported TypeScript 6 toolchain against the familiar Nest 11 + TypeScript 5.9 baseline; do not select TypeScript 7 merely because it is latest. Resolve ESM/decorator metadata and test-runner behavior with actual builds before choosing. Record the fallback reason if the current stable stack cannot pass.

PR01A selects source-toolchain pins: verify official release dates/support and engine/peer constraints, choose a patched Node runtime, generate/review the initial lockfile, then prove clean frozen installation, lint/typecheck/unit/build, both Nest bootstraps and React render, and dependency/license/secret checks. PR01B selects immutable runtime/infrastructure images and proves independent image builds, Compose/proxy/cache compatibility and image scans. PR02A validates real TypeORM migration/transaction tooling under the distinct runtime roles. Record each slice's actual commands/results and remaining advisories; later infrastructure evidence is not falsely attributed to PR01A. Pin package manager and runtime reproducibly; pin release images and CI actions immutably. No `latest` tags in production or generated deployment manifests. Exact infrastructure and TypeORM versions are confirmed in their first owning slice, with real PostgreSQL under distinct runtime roles and both cache engines tested before claiming support. The release table above records the prior discovery observation, not an installed or freshly validated compatibility matrix; recheck support/advisories against chosen artifacts before implementation.
