# PR01A — Workspace Foundation review

Status: PR01A implemented and locally verified on `feature/pr-01a`, 2026-10-25. The [authorized brief](pr-01a-workspace-foundation.md), [roadmap](../../planning/ROADMAP.md) and [quality gates](../../planning/QUALITY-GATES.md) define scope. PR01B remains unstarted.

## Why / scope

The repository had architecture and security plans but no reproducible application workspace. PR01A adds independent inert applications, shared contracts and executable source-quality gates so later work has a verifiable baseline. Runtime infrastructure and business behavior are deferred to their owning slices.

## Understand this PR — Explication simple

Nous avons créé une base exécutable pour développer Control, Gateway et la Console avec les mêmes conventions et des responsabilités distinctes.

Avant : seulement des documents. Après : deux processus Nest indépendants, une Console React/Mantine qui annonce l'état fondation, et un petit Core partagé. Exemple : arrêter Control ne coupe pas Gateway; le test de démarrage le vérifie sur les deux exécutables compilés. Une requête vers une route métier inexistante reçoit 404.

Trois choses à retenir : Core partage les définitions; chaque application garde son propre démarrage; les checks deviennent exécutables sans prétendre implémenter la sécurité métier.

Pour vérifier : suivre le [guide PowerShell](../../DEVELOPMENT.md), démarrer les trois applications et observer la Console ainsi que les 404 des API. Les détails techniques ci-dessous restent nécessaires pour évaluer les frontières et les preuves.

## BEFORE

- Branch initially clean, aligned with local `main` (`git rev-list --left-right --count main...HEAD`: `0 0`).
- No application manifests/lockfile, source, test runner or workflow.
- Existing documentation had already moved under `docs/prs/pr-00`; its verifier still computed the old repository root.
- Target invariants: two apps, canonical core, no provider/database/identity feature, no reference source copied.
- Planned proof: frozen installation, strict lint/types/build, real HTTP bootstrap/close, React render/a11y, architecture negatives/cycles, built process independence and supply-chain checks.

## AFTER

- pnpm/Turbo workspace, one lockfile, private ESM packages and exact compatible direct pins.
- Two independent Nest entrypoints, safe local binding and no declared routes. Core exports only consumed application identifiers through `core/contracts`.
- React/Mantine Console with responsive navigation, skip link and honest foundation state; no business forms or API traffic.
- Root checks enforce import direction, public exports and absence of source/workspace cycles; negative fixtures exercise those failures.
- CI definitions for Windows/Linux source checks/startup and separate dependency/secret/license/docs jobs, pinned actions and read-only permissions.
- Development guide and documentation map added; the canonical documentation check uses Node and the archived Python entrypoint delegates to it after its path relocation. Original input briefs remain untouched.

## Architecture decisions and alternatives

Use current Nest 12 ESM with TypeScript 6.0.3 rather than forcing the latest TypeScript 7 into an unsupported linter peer range. Shared compiler settings remain small; each API owns its composition instead of adding a common application factory. Core has no unused domain/entity/service scaffolds, and the Provider SDK is not created early.

Only a `contracts` subpath exists now; future persistence/migration exports remain reserved design responsibilities. Build core before app consumers; each app can build independently with its workspace dependency. API dev commands compile and run JavaScript with the same decorator metadata as production builds; hot reload for APIs is deferred rather than adding another runner. No new architecture ADR is needed because accepted ADR-001 remains unchanged.

## Security and tenant isolation

There is no authenticated/tenant business surface yet. Missing routes return 404; API listeners bind to loopback, disable the Express identification header, enable no CORS policy and trust no proxy. Body parsing is disabled for these inert shells; a later input-bearing route must add bounded parsing/validation as part of its own security gates.

The first audit identified vulnerable transitive multer; the workspace now overrides only Nest Express's multer to the patched 2.5.0. This is remediation, not a vulnerability waiver. License inventory dispositions are restricted/documented, unknown third-party licensing fails and Secretlint scans the working tree. Actual account/tenant/RLS/BYOK controls remain unimplemented.

## Verification

<!-- verification-results -->

Checks executed in Windows PowerShell with Node 24.22.1 and pnpm 12.15.0:

- `pnpm.cmd install --frozen-lockfile`: PASS after generation and review of the single lockfile. Exact engine/peer/lifecycle/release-age policies passed. Node's local archive SHA-256 matched the official release checksum; the isolated runtime is ignored under `.tools`.
- `pnpm.cmd format:check`, `pnpm.cmd lint`, `pnpm.cmd check:boundaries`: PASS. Existing AGENTS/template changes are formatting-only. The boundary checker covers public exports, import direction, source/workspace cycles and type/dynamic/path-alias escape fixtures.
- `pnpm.cmd typecheck`: PASS for all four packages (five Turbo tasks including the core dependency build).
- `pnpm.cmd test`: PASS, **13 tests**: six boundary regressions, four real HTTP/lifecycle tests across the APIs, three Console render/navigation/axe tests. Unchanged verified tasks may be reused from Turbo's local cache; the first full run executed all three application suites.
- `pnpm.cmd build`: PASS for core, both APIs and Console, including the emitted browser-module boundary check. `pnpm.cmd --filter @cyrantis/control-api... build` and `pnpm.cmd --filter @cyrantis/gateway-api... build` also passed independently without building Console.
- `pnpm.cmd check:startup`: PASS against the built entrypoints. Distinct ephemeral listeners, 404 responses, Control stopped while Gateway remained responsive, followed by child cleanup. This does not establish production graceful-drain behavior.
- `pnpm.cmd audit --audit-level=low`: PASS after remediation, **no known vulnerabilities reported**. The initial high finding was fixed with the scoped multer override; it was not accepted as residual risk.
- `pnpm.cmd check:licenses`: PASS, 14 license expressions inventoried with named/versioned development-tool dispositions; third-party UNLICENSED is not exempt. This metadata gate is not a complete legal/redistribution audit.
- `pnpm.cmd check:secrets`: PASS using Secretlint recommended rules on the current working tree. No historical or external-secret scan is claimed.
- `pnpm.cmd check:docs`: PASS, 25 Markdown files, 122 local targets and zero errors with the canonical Node checker. The optional legacy Python entrypoint also passed by delegating to it. This avoids the Microsoft Store Python alias encountered when the legacy command was invoked through pnpm on Windows, while retaining one implementation of the read-only rules.
- `git diff --check`, `git diff --cached --check` with command-local `safe.directory`: PASS. Original PR00/PR01A briefs have no diff against HEAD. Generated dependencies, dist outputs and local tools are ignored.
- Reference status/HEAD read-only checks: all clean and unchanged, LXP `26b15b0`, PGS `c4bf25c`, website `9384713`.

Not executed: hosted GitHub Actions/Linux runtime, branch-protection configuration, production images/infrastructure, database/RLS, authentication/tenant isolation, providers or deployment. Those are outside this local workspace slice. The workflow is present and reviewed; a remote CI run remains required evidence before merging remotely.
<!-- /verification-results -->

The native browser verification was stopped automatically because Computer Use could not determine the current Edge URL with enough confidence to enforce policy. No further UI automation was attempted; real-browser visual/contrast validation is UNVERIFIED. React rendering, navigation and automated non-layout accessibility checks are separate evidence.

## Compatibility and operations

No database, migration, external API or existing consumer changed. Independent source builds preserve later image ownership. The dedicated migration/runtime image contracts remain PR01B/PR02A responsibilities.

Local rollback is removal/review of this PR's unreleased workspace files and edits; no data migration or destructive reset is needed. Preserve original briefs, unrelated repository content and any maintainer staging. No commit/push/remote creation or reference repository changes are part of this task.

## Review verdict

**READY for the local PR01A workspace scope:** mandatory local checks passed and no unresolved blocking issue was identified in that scope. Hosted GitHub Actions, real-browser visual/contrast behavior and production security remain unverified; their absence is explicit and is not represented as a passing test. Run the workflow on the remote before merge and complete browser visual review before treating the shell as a validated product UI. No commit or push was performed.
