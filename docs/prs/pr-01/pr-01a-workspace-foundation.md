# Cyrantis LLM Gateway — PR01A: Workspace Foundation

Laurie Codex, PR00 is finalized and approved for documentation readiness.

We are now authorized to implement **PR01A — Workspace Foundation**, following the accepted architecture, roadmap, quality gates and AGENTS.md instructions.

## Goal

Build the smallest clean, reproducible and maintainable foundation for `cyrantis-llm-gateway`.

This PR establishes project structure, builds and quality gates. It does not implement business functionality.

**Build a temple, not a cathedral.**

## Mandatory scope

- Set up pnpm workspaces with a single lockfile and Turbo.
- Use compatible, current stable releases of NestJS, React, Mantine, Vite and TypeScript, with verified version choices.
- Scaffold two independent NestJS applications: `control-api` and `gateway-api`.
- Create a minimal `@cyrantis/core` package with clear exports and dependency boundaries.
- Scaffold a React/Mantine Console with a clean application shell.
- Establish strict TypeScript, formatting, linting and testing conventions.
- Set up GitHub Actions for reproducible installation, typechecking, linting, tests and builds.
- Include minimal application smoke tests and independent startup verification.
- Document Windows PowerShell development commands.
- Define package ownership, import boundaries and dependency direction.

## Architectural constraints

- Keep Control API and Gateway API independently buildable.
- Avoid circular dependencies.
- Do not introduce duplicated shared domain definitions.
- Do not build a giant core package.
- Keep the Provider SDK separate from core; its real implementation belongs to a later PR.
- Avoid unnecessary wrappers, factories, base classes and infrastructure abstractions.
- Do not make either API depend on the frontend.
- Preserve future independent OCI deployment and Kubernetes compatibility.

## Out of scope

Do not implement:

- Authentication, RBAC or tenant authorization.
- BYOK storage or encryption.
- Database migrations, RLS or persistence business logic.
- Provider calls, streaming or API compatibility functionality.
- Quota admission or billing.
- PGS integration.
- Docker Compose, Caddy or production deployment infrastructure (PR01B).
- Business dashboards or exploration Labs.

Do not modify the LXP, PGS or public-website repositories.

## Quality requirements

Before declaring PR01A complete:

- Run pnpm installation with a reproducible lockfile.
- Run lint, typecheck, tests and build.
- Verify that both NestJS apps start independently.
- Verify that the React Console shell renders.
- Check dependency boundaries and absence of cycles.
- Run available security and dependency checks.
- Document failures honestly.
- Avoid claiming runtime enterprise security controls are implemented.

Keep the implementation limited to the approved PR scope.

## Required explanation

Use the installed `pr-explainer` skill and `architecture-pr-review`.

Provide a clear, concise report in French:

1. PR01A en 60 secondes.
2. BEFORE / AFTER.
3. What each application and package does.
4. A concrete example of how the workspace fits together.
5. Why the chosen structure is maintainable.
6. What tests actually passed.
7. What Patrick can run locally.
8. What remains unimplemented and why.
9. The three most important things to remember.
10. Final evidence-based review verdict.

Explain technical decisions without oversimplifying them.

Patrick must understand and retain architectural ownership of the project.

## Stop condition

Complete PR01A only.

Do not start PR01B or introduce extra features without explicit approval.

**Enterprise-grade engineering starts with simple, secure, verifiable foundations — not excessive complexity.**