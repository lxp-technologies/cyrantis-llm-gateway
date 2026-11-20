# PR01A — Bootstrap the Cyrantis gateway workspace

## Why / scope

- Establish a reproducible development baseline for the gateway. PR00 defined the architecture, and this PR makes its first components buildable and testable.
- Include the pnpm/Turbo workspace, independent NestJS shells, React/Mantine Console, shared Core contracts, local checks, CI and development documentation. Containers, deployment, persistence, identity, BYOK, provider execution and billing belong to later PRs.

## Understand this PR — Explication simple

Cette PR transforme le plan d’architecture en projet que tu peux installer, démarrer et tester.

**Avant**, le dépôt contenait la documentation d’architecture. **Après**, Control et Gateway démarrent sur deux ports, et la Console affiche l’état de la fondation. Les parcours métier et le déploiement restent à venir.

Exemple concret. Lance `pnpm.cmd build`, puis `pnpm.cmd check:startup`. Le test démarre les deux API compilées, vérifie les réponses 404 sur les routes inconnues, puis arrête Control et confirme que Gateway répond encore. Tu peux aussi lancer `pnpm.cmd dev:console` et ouvrir `http://127.0.0.1:5173` pour voir l’interface.

Trois points à retenir.

1. Control et Gateway démarrent et se construisent séparément.
2. Core partage les identifiants des applications au moyen d’un export utilisable dans le navigateur.
3. Les validations locales passent. La CI GitHub du dernier commit reste à confirmer avant la fusion.

## BEFORE

- The base branch at `202bfc4` contained the PR00 plans and ADR-001. The planned applications, workspace builds and tests had yet to be implemented. [Base commit](https://github.com/lxp-technologies/cyrantis-llm-gateway/commit/202bfc413defd0a9f62efcaee7cd95784fa7036e)
- ADR-001 assigns administration to Control and execution to Gateway. The first slice applies those boundaries with independent entrypoints and one shared Core package. Expected checks cover separate builds and startup, missing-route behavior, import boundaries and Console rendering.

## AFTER

- `apps/control-api` and `apps/gateway-api` each own their Nest module, entrypoint and HTTP tests. `apps/console` provides a React/Mantine shell. `@cyrantis/core/contracts` is the sole Core export and supplies stable application identifiers to all three apps.
- Node 24.22.1, pnpm 12.15.0, one lockfile and Turbo coordinate reproducible installs and builds. CI defines Windows and Linux quality jobs and separate supply-chain and documentation checks.
- The review follow-up updates project instructions, narrows formatter exclusions and records the PR01B runtime acceptance criteria. The implementation follows the existing architecture decision. [ADR-001](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/architecture/decisions/ADR-001-control-gateway-separation.md) · [Implementation and review evidence](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/prs/pr-01/pr-01a-review.md)

## Security and tenant isolation

- Both API shells bind to loopback and return 404 for undeclared routes. HTTP tests check the absence of the Express identification header and permissive CORS on those responses. The shells trust no proxy and leave request-body parsing disabled.
- Identity, role and scope enforcement, tenant-owned data, A/B isolation tests, cross-app credentials, revocation and paid execution are outside this slice. Current HTTP evidence covers startup, closure and the undeclared-route surface.
- GitHub Actions use pinned action SHAs, read-only repository permissions and disabled checkout credential persistence. The first dependency audit found a transitive Multer issue. The lockfile now resolves the patched version through a scoped override. [Multer advisory](https://github.com/advisories/GHSA-q7qp-rjg7-q26m)
- The PR maintainer owns confirmation of required remote checks. PR01B owns validated container listeners, private API exposure, redacted structured logs and real proxy tests. [Quality gates](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/planning/QUALITY-GATES.md)

## Verification

- **20 November, local Windows.** `pnpm.cmd format:check`, `lint`, `check:boundaries`, `typecheck`, `test`, `build` and `check:startup` passed. Turbo used fresh execution. All **13 tests** passed, including six boundary checks, four HTTP/lifecycle tests and three Console tests using jsdom.
- `pnpm.cmd check:docs` passed for **26 Markdown files and 123 local links**. `check:licenses` and `check:secrets` passed. The October validation also recorded a successful frozen install and an audit with no known findings after the Multer correction. The dependency audit was not rerun in the November validation. [Local evidence](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/prs/pr-01/pr-01a-review.md#verification)
- GitHub Actions results for `4f44763` and required-check configuration remain unverified. Console keyboard and contrast checks in a real browser remain pending. Database, provider and deployment tests belong to their implementation slices.

## Compatibility and operations

- The two API shells and the Console build against the same browser-safe Core contract. This slice adds no API consumer migration, database schema or backfill. Runtime grant and key/token compatibility checks begin with the corresponding features.
- The changes are source and workflow configuration. A rollback reverts the foundation commits and requires no data recovery. Independent images, migrations and deployment validation follow in PR01B and PR02A. [Developer guide](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/DEVELOPMENT.md) · [Roadmap](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/planning/ROADMAP.md#pr01b--runtime--deployment-foundation)

## Review verdict

**UNVERIFIED for remote merge.** Local checks passed on `4f44763`. Merge approval requires successful Windows, Linux, dependency/secret and documentation checks on the PR’s latest commit, plus confirmation that the checks are required. [Commit under review](https://github.com/lxp-technologies/cyrantis-llm-gateway/commit/4f4476352ff997ab19da77be587cb007cf35839f) · [Quality gates](https://github.com/lxp-technologies/cyrantis-llm-gateway/blob/4f4476352ff997ab19da77be587cb007cf35839f/docs/planning/QUALITY-GATES.md)
