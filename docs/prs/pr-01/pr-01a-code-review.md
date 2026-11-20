Cyrantis LLM Gateway — Revue de code PR01A
Date : 25 octobre 2026
Source : archive cyrantis-llm-gateway-feature-pr-01a.zip fournie dans la conversation
Portée : fondation pnpm/Turbo, deux API NestJS inertes, @cyrantis/core, Console React/Mantine, scripts/CI. Revue du snapshot ZIP, sans historique .git ni comparaison de diff contre la branche de base.
Verdict : APPROUVABLE SOUS CONDITIONS (aucune vulnérabilité bloquante démontrée dans la portée PR01A; preuve CI distante à obtenir avant fusion).
Résumé en 60 secondes
PR01A transforme les plans de PR00 en un workspace réel et séparé : Control API et Gateway API démarrent dans des processus distincts, une Console statique affiche clairement la fondation, et les définitions partagées se trouvent dans Core. Aucun endpoint d'authentification, tenant, BYOK ou inférence n'est exposé prématurément. Des tests de frontières d'import, des tests HTTP, des tests UI et des contrôles CI existent. La qualité de leur exécution dans le contexte de cette revue reste partiellement non vérifiée, car l'environnement ici possède Node 22 et pas le toolchain Node 24/pnpm et les dépendances du projet.
Constats classés par priorité
P2 — Instruction d'étape périmée dans AGENTS.md
Fichier : AGENTS.md:6; comparer avec README.md:5 et docs/prs/pr-01/pr-01a-review.md:3.

Le fichier d'instructions conserve « PR00 is documentation only. Do not ... begin PR01A/PR01B ... », bien que PR01A soit déjà implémentée. Une nouvelle session Codex pourrait interpréter cette instruction comme une interdiction permanente. Action : remplacer la consigne datée par une règle de livraison fondée sur le périmètre courant : PR01A est terminé, PR01B exige autorisation explicite, les dépôts de référence restent en lecture seule.
P2 — Ports loopback et logger désactivé : préparer le contrat PR01B
Fichiers : apps/control-api/src/main.ts:9, apps/gateway-api/src/main.ts:9, apps/control-api/src/app.ts:10, apps/gateway-api/src/app.ts:10.

Pour un shell local inerte, écoute sur 127.0.0.1 et logger: false sont compréhensibles. Mais un conteneur Docker distinct ne sera pas accessible depuis Caddy si la liaison reste limitée au loopback de son conteneur. Et un service réel sans journalisation structurée sera difficile à exploiter. Action PR01B : HOST configuré et validé (127.0.0.1 en développement; 0.0.0.0 dans le réseau privé des conteneurs), pas de publication d'API non voulue, logs structurés sans secrets, readiness/liveness, graceful shutdown et test réel du proxy. Il ne faut pas ouvrir une route d'inférence dans PR01A.
P2 — Les workflows ne sont pas encore des preuves de CI distante
Fichiers : .github/workflows/ci.yml:16-75, docs/prs/pr-01/pr-01a-review.md:67-80.

Trois jobs existent : qualité Linux/Windows, sécurité/dépendances et documentation. Les actions sont épinglées à des SHA et les permissions du token sont limitées. La documentation reconnaît explicitement que GitHub Actions n'a pas encore été exécuté. Action : exécuter et rendre obligatoires les checks pertinents sur la PR distante avant fusion; recueillir les résultats Linux/Windows. Un YAML seul ne prouve pas qu'une CI fonctionne.
P3 — Tests UI sans navigateur réel ni contraste
Fichiers : apps/console/src/App.test.tsx:30-35, docs/prs/pr-01/pr-01a-review.md:70.

Tests utiles sur structure, navigation mobile et a11y sans layout, mais axe désactive explicitement color-contrast et n'a pas de layout DOM réel. Action : revue visuelle manuelle maintenant si possible; avant une UI métier, tests Playwright dans un navigateur réel, navigation clavier et contraste. Cela ne bloque pas le workspace shell.
P3 — Exclusions documentaires larges du formatteur
Fichier : .prettierignore:10-16.

Plusieurs répertoires documentaires sont exclus de Prettier pour conserver les textes PR00. Le contrôle check:docs couvre tout de même UTF-8, liens, titres, espaces et blocs de code. Action : envisager des exclusions ciblées pour le contenu historique seulement; ne pas laisser durablement les nouvelles ADR hors convention stylistique sans justification.
Points forts vérifiés dans les sources
- Séparation réelle des processus : apps/control-api/src/main.ts et apps/gateway-api/src/main.ts ont deux entrypoints distincts; le script scripts/check-startup.mjs les lance et vérifie leur indépendance.
- Surface API fermée : AppModule est vide et les tests vérifient 404 sur des routes non déclarées, l'absence de x-powered-by et de CORS permissif. Cela ne prouve pas l'authentification ou l'isolation tenant, encore absentes.
- Core minimal : packages/core/src/contracts.ts expose uniquement des identifiants; aucune entité TypeORM copiée ou abstraction fournisseur prématurée.
- Monorepo reproductible conçu : manifests privés, pins directs, pnpm-lock.yaml, imports workspace:*, dépendances Turbo et scripts dédiés.
- Frontières exécutables : scripts/check-boundaries.mjs analyse imports, exports et cycles; six tests négatifs dans scripts/check-boundaries.test.mjs couvrent certains contournements.
- Console honnête : apps/console/src/App.tsx ne simule ni comptes, ni clés ni usage; navigation accessible de base, sélecteur mobile, skip link.
- CI raisonnablement durcie : SHA pinning, persist-credentials: false, permissions contents: read, jobs distincts, audit, Secretlint et revue des licences.
- Pas d'anticipation de fonctionnalités sensibles : absence volontaire d'authentification, de persistence, de RLS, de BYOK, de fournisseurs et de proxy, conformément au scope PR01A.
  Vérifications réalisées pendant cette revue
  Contrôle	Résultat
  Inspection intégrale du ZIP et des 100 entrées	Réussi
  Lecture statique manifests/scripts/API/Console/CI/PR report	Réalisée
  node scripts/check-docs.mjs	Réussi : 25 fichiers Markdown / 122 liens locaux / 0 erreur
  node --check pour les scripts .mjs et ESLint	Réussi
  Parsing JSON des package.json	Réussi
  pnpm install, pnpm lint, pnpm test, pnpm build, audit des dépendances	Non rejoués : Node 24/pnpm/dépendances absents de cet environnement
  GitHub Actions distante / branche protégée	Non vérifiées
  Test navigateur réel / contraste	Non vérifié
  Tests tenant/RLS/BYOK/fournisseurs	Hors périmètre de PR01A


Les 13 tests passés mentionnés dans le fichier de revue de PR01A sont un résultat rapporté par Laurie Codex, non reproduit ici.
Recommandation de fusion
Approver après deux validations minimales :
1. Clarifier AGENTS.md:6 afin que PR01A soit reconnu comme terminé et PR01B reste soumis à approbation.
2. Obtenir la preuve des checks GitHub Actions verts avant fusion à la branche principale.
   Les contraintes de HOST, Caddy, logging, observabilité et tests réseau sont à inscrire comme critères bloquants de PR01B, et non à implémenter prématurément dans PR01A.

Verdict de cette revue : READY WITH DOCUMENTED FOLLOW-UPS pour la conception et le code statique; merge conditionnel aux checks obligatoires. Aucun audit de sécurité d'exécution n'est revendiqué.
