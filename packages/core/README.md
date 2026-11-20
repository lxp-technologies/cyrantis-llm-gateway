# @cyrantis/core

Canonical shared definitions. PR01A exports only `@cyrantis/core/contracts`: stable application identifiers consumed by both Nest shells and the Console.

Imports have no IO or initialization side effects. The root package has no catch-all export. Browser consumers may use contracts; contracts cannot depend on Node, Nest, providers or persistence. Future domain, server-only persistence and job-only migrations will receive explicit exports in their owning PRs, with no duplicate entities.

There are no tenant models, authorization rules, TypeORM entities or migrations yet. Provider contracts belong to the later Provider SDK, not this package.
