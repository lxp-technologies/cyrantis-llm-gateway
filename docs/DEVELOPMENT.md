# Workspace development

PR01A provides two inert Nest applications, a React/Mantine Console, one browser-safe core export and local/CI quality checks. There is no database, login, provider call or deployment environment yet. See the [PR01A review](prs/pr-01/pr-01a-review.md) and [documentation map](README.md).

## Toolchain

Use Node **24.22.1** (also in `.node-version`) and pnpm **12.15.0** (selected by Corepack from `packageManager`). Dependencies are exact direct pins with one pnpm lockfile. The Node engine accepts patched Node 24 from the pin onward; CI uses the exact pin.

Versions verified against registry metadata on 2026-10-25: Nest 12.2.0, React/DOM 19.3.1, Mantine core/hooks 9.7.4, Vite 8.3.5, TypeScript 6.0.3, ESLint 10.13.0/typescript-eslint 8.72.0, Vitest 5.0.5 and Turbo 2.11.10. TypeScript 6 is the supported choice because the verified typescript-eslint peer range is below 6.1; TypeScript 7 is outside it. See the [Nest ESM migration guidance](https://docs.nestjs.com/migration-guide) and [typescript-eslint metadata](https://registry.npmjs.org/typescript-eslint/8.72.0).

The workspace uses ESM, NodeNext for server/core compilation and Bundler resolution for the browser. TypeScript's legacy decorator metadata remains enabled for Nest builds; source-relative server imports use emitted `.js` extensions. No Nest CLI wrapper or custom compiler is needed.

## Windows PowerShell quickstart

Activate Node 24.22.1 with your version manager. With nvm-windows, the setup commands are `nvm install 24.22.1` and `nvm use 24.22.1`. Then open this repository root:

```powershell
node --version
pnpm.cmd --version
pnpm.cmd install --frozen-lockfile
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd check:boundaries
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check:startup
pnpm.cmd check:docs
pnpm.cmd audit --audit-level=low
pnpm.cmd check:licenses
pnpm.cmd check:secrets
```

Expected versions are `v24.22.1` and `12.15.0`. Use the `.cmd` entrypoints in PowerShell. If a pnpm shim is unavailable, Corepack's explicit `corepack.cmd pnpm` command selects the same project version. The documentation check uses Node's standard library and requires no additional runtime. The archived Python entrypoint delegates to that same checker when Python is available.

The first install generated the lockfile; subsequent installs use `--frozen-lockfile`. Exact compatibility, lifecycle policy and audit disposition are reviewed again whenever pins or the lockfile change. CI installs the entire workspace because core changes affect all consumers.

## Start applications independently

Run these from separate PowerShell terminals:

```powershell
pnpm.cmd dev:control
pnpm.cmd dev:gateway
pnpm.cmd dev:console
```

Control binds to `http://127.0.0.1:3001`, Gateway to `http://127.0.0.1:3002`, and Console to `http://127.0.0.1:5173`. Turbo builds the core dependency before each dev task. Both APIs deliberately expose no business or health routes in PR01A: requesting `/` or `/api/v1/tenants` returns 404. Detailed health/readiness contracts belong to PR01B.

A minimal local port override is supported for an API:

```powershell
$env:PORT = '3101'
pnpm.cmd dev:control
```

Close that terminal or remove its PORT environment value before starting another app. Both API servers bind to loopback; generalized host/proxy/runtime configuration belongs to PR01B. API dev commands compile with TypeScript and run the emitted JavaScript, preserving Nest decorator metadata. They compile once: restart after API edits. The Console uses Vite hot reload.

The Console renders an honest foundation screen and local navigation. It makes no API request and displays no simulated account, tenant or usage data. Stop either API with Ctrl+C: the other API and Console remain independent. After changing core, rebuild it and restart affected dev processes; there is no shared package watch service.

For built-server verification:

```powershell
pnpm.cmd --filter @cyrantis/control-api... build
pnpm.cmd --filter @cyrantis/gateway-api... build
pnpm.cmd --filter @cyrantis/control-api start
```

The trailing `...` includes core when building a single app. `pnpm.cmd check:startup` starts both compiled entrypoints on distinct ephemeral ports, checks HTTP 404 behavior, stops Control and proves Gateway still responds, then cleans up its own children. Build first. It does not test production drain, provider cancellation or orchestrator readiness.

## Ownership and dependency direction

- `apps/control-api`: owns its Nest module, bootstrap, process and future administration workflows.
- `apps/gateway-api`: owns a separate Nest module/bootstrap/process and future execution workflows.
- `apps/console`: owns UI, styles, browser tests and Vite configuration.
- `packages/core`: owns the canonical shared application identifiers exported only through `@cyrantis/core/contracts`.
- Root tooling: strict TypeScript defaults, ESLint/Prettier, Turbo task graph, import/cycle checks and CI. Provider SDK/adapters, persistence and migration code are added only in their owning PRs.

All three apps depend on core; core depends on no app/framework. No app imports another app. APIs do not depend on the browser. Avoid a root core barrel export; later persistence/migration exports must remain server-only. Today the entire core is intentionally browser-safe; adding those server-only slices requires updating the boundary policy and its negative tests.

`check:boundaries` parses source imports/re-exports and literal dynamic imports, rejects undeclared public workspace exports and relative crossings, and detects workspace/source cycles. Its regression fixtures demonstrate rejected server imports, private exports, cross-app imports and cycles. The Console build additionally inspects emitted module IDs for server-only dependencies. These are development guards, not a sandbox for malicious application code.

## Supply chain and security checks

Lifecycle scripts are denied unless explicitly reviewed in `allowBuilds`. esbuild's binary validation/setup is allowed; Nest's non-essential postinstall is denied. Strict engine/peer/build checks and strict release-age handling remain enabled. Exact release-age exceptions for the verified Mantine patch and the multer security fix are recorded in the workspace file; changes need review, not blanket exclusion patterns.

The Nest Express dependency is overridden narrowly to **multer 2.5.0**, fixing [GHSA-q7qp-rjg7-q26m](https://github.com/advisories/GHSA-q7qp-rjg7-q26m). Revisit the override when Nest's own resolution selects a fixed version. There are no upload routes; the dependency gate still requires a clean audit.

`check:secrets` uses Secretlint's recommended rules on the working tree, excluding dependencies/builds/tool caches. It is not a scan of all Git history. `pnpm audit` queries the registry advisory service and fails CI on reported findings from low severity upward; service/network failure also prevents a passing check. Neither check proves absence of all vulnerabilities.

`check:licenses` inventories installed dependency metadata and rejects unclassified license expressions. The current unmodified development dependencies have package/version-specific dispositions for `@azu/style-format` (WTFPL), the two `@csstools` helpers (MIT-0), the Bevry text/binary/version helper packages (Artistic-2.0), and `spdx-exceptions` (CC-BY-3.0). Their license/notice files remain in installed packages. These dispositions cover local tooling use, not blanket redistribution clearance. MPL-2.0 build/test dependencies also require preserving applicable notices and reviewing modifications if redistributed. Before shipping images/assets, review the exact distributed artifacts and notices in PR01B/PR09. Workspace packages are private/UNLICENSED pending the product source-license decision; no third-party UNLICENSED package is silently accepted.

CI pins actions by verified commit SHA, disables checkout credential persistence, grants read-only contents access, uses timeouts and has no deploy/provider identity. Windows/Linux jobs cover source checks, tests, builds and startup; dependency/secret/license and documentation jobs are separate. Hosted CI execution and branch protection require evidence from the remote; creating the workflow does not configure required checks.

## Test limits

API tests create real Nest HTTP listeners without database/cache mocks and verify safe missing-route behavior and listener closure. Boundary tests use real temporary package/source fixtures. Console tests use React Testing Library, jsdom and axe-core; layout, contrast and real browser rendering remain separate evidence. No auth/tenant/RLS/provider guarantees are claimed by these smoke tests.

PR01B adds OCI images, Compose/Caddy, PostgreSQL/cache selection and runtime lifecycle configuration. PR02 and PR04 implement identity, tenant/credential boundaries, admission and actual provider execution.
