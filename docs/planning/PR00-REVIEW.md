# PR00 — Rapport final et passage au développement

État : finalisation documentaire sur `chore/init`, le 2026-10-25, selon le [brief de finalisation](../prs/pr-00/pr-00-finalize.md). Aucun développement PR01A/PR01B commencé. Les contrôles applicatifs décrits restent à implémenter et à tester.

## PR00 en 60 secondes

PR00 donne une base de développement cohérente : responsabilités des deux API, code partagé, accès aux données, gestion des clés, comportement en cas de panne et critères de validation. Cette dernière passe conserve l'architecture approuvée et rend le travail plus facile à livrer et à vérifier.

Le [roadmap](ROADMAP.md) sépare maintenant PR01A/01B, PR02A–C et PR04A–E. Le [modèle Developer Free BYOK](DEVELOPER-BYOK.md) précise le premier appel d'un développeur individuel, sans administration d'équipe préalable. Les [instructions](../../AGENTS.md) et le [template existant](../../.github/pull_request_template.md) demandent une explication française concrète pour chaque PR significative, en plus des preuves techniques.

## BEFORE → AFTER

**Proposition initiale :** une seule application Nest pour réduire la duplication. **Architecture approuvée :** deux applications indépendantes et un `@cyrantis/core` canonique; les classes partagées ne donnent aucun privilège de base de données. [ADR-001](../architecture/decisions/ADR-001-control-gateway-separation.md) conserve cette décision.

**Avant cette finalisation :** les lots PR01/PR02/PR04 étaient trop larges; le parcours individuel et les types de clés restaient ambigus. **Après :** chaque étape précise dépendances, exclusions, critères de sécurité, tests, scénario observable et retour arrière. Le stockage des clés, la réservation durable, la coordination, l'exécution et le streaming se vérifient séparément, sans exposer un chemin d'exécution incomplet.

Une contradiction a été corrigée : partager la même clé maîtresse symétrique ne satisfait pas l'exigence « Control ne déchiffre pas ». Cette solution ne peut plus passer par une simple note de risque accepté. Aucun contrôle obligatoire n'a été retiré pour raccourcir les PR.

## Architecture retenue

Exemple **prévu**, non exécuté : Alice se connecte dans la Console React/Mantine/Vite. Control vérifie son identité, lui prépare un espace privé et enregistre sa clé fournisseur personnelle chiffrée. Elle crée ensuite une clé API Cyrantis limitée à ses appels; son script n'utilise jamais directement le secret fournisseur.

`Script d'Alice → Gateway → autorisation et réservation PostgreSQL / coordination Redis ou Valkey → Provider SDK → adapter → fournisseur → réponse et usage durable PostgreSQL`

Control gère comptes, configuration, clés et offres. Gateway vérifie chaque appel et exécute l'inférence sans dépendre d'un appel HTTP à Control pour chaque requête. Core partage contrats, invariants, entités TypeORM et migrations; ce n'est pas un service réseau. Le SDK définit le comportement commun, chaque adapter traduit le protocole fournisseur. PostgreSQL conserve l'autorité durable; le cache coordonne les limites mais ne décide pas des droits.

Compose/Caddy lance des images indépendantes en V1. Configuration, secrets et stockage restent externalisables pour une évolution vers Kubernetes/cloud/GitOps, sans générer ces plateformes maintenant. Le [diagramme d'architecture](../architecture/ARCHITECTURE.md) correspond à ces responsabilités. PGS reçoit de l'évidence d'évaluation et conserve ses décisions propres : **Intent != Permission**.

## Sécurité

La [matrice d'accès](../security/ACCESS-BOUNDARIES.md) définit deux rôles applicatifs limités et un exécuteur de migrations distinct; aucune migration automatique au démarrage des API. Les migrations évoluent avec une fenêtre de compatibilité entre images et schéma.

RLS signifie sécurité des lignes en base de données. Elle complète l'autorisation serveur et les permissions SQL; elle ne remplace pas les contrôles d'objet/propriétaire. PostgreSQL documente notamment les exceptions de propriétaires/superutilisateurs dans sa [référence RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html). Un processus compromis disposant d'un contexte locataire modifiable reste un risque explicitement décrit.

Une clé personnelle appartient à un utilisateur **dans** un espace. Bob, même membre ou administrateur de cet espace, ne reçoit pas implicitement le droit de l'utiliser. Un service utilise une identité dédiée et une clé fournisseur d'espace explicitement autorisée. Ces refus avant déchiffrement doivent être démontrés par les tests du [modèle de menaces](../security/THREAT-MODEL.md), y compris entre deux utilisateurs du même espace.

Chiffrement avec permissions distinctes, révocation, réservations atomiques, erreurs sûres, limites de flux et conservation d'un usage incertain sont des exigences planifiées. Une coupure réseau ne prouve ni l'arrêt du fournisseur ni l'absence de frais; aucun rejeu payant aveugle. Authentification, isolation, révocation et protections de base restent dans Free.

## Les trois choses à retenir

1. **Partager les définitions, séparer les pouvoirs :** Core évite les copies; Control et Gateway gardent leurs propres droits et cycles de déploiement.
2. **Simplifier l'entrée sans supprimer l'isolation :** un espace privé automatique et une clé personnelle pour commencer; les identités de services restent explicites.
3. **Prouver chaque étape :** petites PR, exemple concret, validations obligatoires et aucun appel fournisseur exposé avant l'ensemble des protections.

## Ce qui reste à faire

- **PR01A — responsable implémentation/maintainer :** choisir les versions exactes compatibles, vérifier dépendances/licences et exécuter les builds. Les versions du [rapport de stack](STACK-ASSESSMENT.md) sont des observations antérieures, pas des pins installés.
- **PR02B/C — responsable identité :** choisir l'IdP OIDC, valider sessions, rotation de signature et clés utilisateur/service. Ce choix ne bloque pas les shells PR01A.
- **PR04A — responsable sécurité/plateforme :** choisir et tester le gestionnaire de clés, les permissions et la restauration. Aucun secret réel avant ce jalon.
- **PR04C/E — responsable Gateway :** mesurer les propositions de jeton d'admission de 60 secondes maximum et de bail d'autorisation de 30 secondes maximum, y compris panne et ordonnanceur retardé.
- **PR09/10 — responsables plateforme/produit :** préciser rétention, résidence des données, objectifs de reprise, domaines, licences, allocations Pro et prix. Les fonctions Pro proposées concernent surtout collaboration avancée, analytics, rapports et automatisation; aucune sécurité essentielle payante.

Les deux API partagent encore PostgreSQL/cache/VPS : elles ne prouvent ni haute disponibilité ni confinement total d'une compromission. Des déploiements indépendants demandent des tests de compatibilité réels. Ces limites sont documentées; elles ne constituent pas des exemptions de validation au moment de livrer.

## PR01A — Prochaine étape

PR01A créera seulement le workspace pnpm/Turbo, le lockfile reproductible, les deux shells Nest, la Console React/Mantine, les premières définitions réellement partagées de Core, TypeScript strict, les règles d'import et la CI initiale.

Images OCI, Compose/Caddy, PostgreSQL/cache de développement et probes détaillées appartiennent à PR01B. Login, BYOK, fournisseurs, quotas, facturation et flux métier arrivent ensuite. Aucun de ces éléments n'est implémenté par PR00.

Validation future pour Patrick : installation depuis un checkout propre, commandes format/lint/typecheck/test/build, démarrage séparé des API avec réponse 404 sûre sur une route inconnue, affichage du shell Console, puis arrêt d'une API sans arrêter l'autre. Le PR consignera les commandes exactes et leurs résultats; les scripts pnpm du [contrat de qualité](QUALITY-GATES.md) sont encore prévus.

## Validation

Le vérificateur documentaire [verify-pr00.py](../prs/pr-00/verify-pr00.py) utilise uniquement Python standard, ne modifie aucun fichier et ne teste aucun comportement applicatif. Il contrôle UTF-8, fichiers requis, titres, blocs de code, espaces de fin de ligne et cibles de liens locaux. Les ancres/rendus Markdown et toutes les URL externes ne sont pas certifiés par ce script.

<!-- verification-results -->
- `python docs/verify-pr00.py` : **PASS**, 21 fichiers Markdown (18 documents rédigés hors briefs), 91 cibles de liens locaux, zéro erreur. Ce script complète Git pour les documents encore non suivis.
- `git -c safe.directory=C:/Data/Workspace/cyrantis/cyrantis-llm-gateway diff --check` et la même commande avec `diff --cached --check` : **PASS**, aucune erreur d'espacement suivie/indexée.
- Script de contrôle transmis par `$scopeCheck | python -` : **PASS**, SHA-256 des trois briefs identiques aux valeurs de début de passe; aucun répertoire apps/packages/infra ni manifeste/lockfile/Turbo créé; six skills requis présents dans AGENTS; huit sections du template conservées dans l'ordre demandé. Le premier contrôle de titre a été corrigé pour transporter le tiret Unicode correctement dans le pipeline PowerShell; le contrôle relancé passe sans modifier le titre.
- `rg --files docs .github` et recherches `rg -n` sur les références PR/template/skills : inventaire et revue de cohérence effectués. Les anciennes références PR01/PR02/PR04 restantes désignent l'historique ou les familles explicitement définies dans le roadmap.
- `git -c safe.directory=C:/Data/Workspace/cyrantis/cyrantis-llm-gateway status --short --branch` : branche `chore/init`, changements préexistants conservés, aucun commit.
- Dans chacun des trois dépôts du registre d'inspection : `git -c safe.directory=<chemin-du-dépôt> status --porcelain` puis `git -c safe.directory=<chemin-du-dépôt> rev-parse --short HEAD` (chemin développé lors de l'exécution) : états propres, LXP `26b15b0`, PGS `c4bf25c`, site `9384713`, inchangés.
<!-- /verification-results -->

Revue manuelle : briefs de découverte/mise à jour/finalisation, ADR et diagramme, architecture, droits/RLS, menaces, roadmap, gates, stack, UX/BYOK, [parité fournisseurs](../architecture/PROVIDER-PARITY.md), [LXP](../discovery/LXP-ASSESSMENT.md), [PGS](../discovery/PGS-INTEGRATION.md), [site public](../discovery/WEBSITE-ASSESSMENT.md), [registre d'inspection](../discovery/INSPECTION-RECORD.md), README, instructions et template. Les chemins historiques des dépôts de référence ne décrivent pas la structure cible de Cyrantis.

**Non exécutés :** installation/build/tests applicatifs, PostgreSQL/RLS, OIDC, appels fournisseurs, Redis/Valkey, Docker/Caddy, scanners, tests de restauration et déploiement. Aucun de ces résultats n'est inventé. Aucun dépôt de référence modifié; aucun commit/push/merge/remote créé. Les trois briefs et les changements préexistants restent conservés.

## Final verdict

**READY pour PR00 documentaire** : les contrôles obligatoires de cette portée passent; les décisions, responsabilités et critères d'entrée de PR01A sont cohérents. Aucun blocage documentaire restant identifié. La sécurité d'exécution et l'aptitude à la production restent **UNVERIFIED** jusqu'aux preuves des PR d'implémentation. Cette finalisation ne démarre pas PR01A.

Pour revoir PR00, commencer par ADR-001, le roadmap et le modèle BYOK, puis comparer la matrice d'accès aux tests exigés. Un retour arrière documentaire ne doit supprimer que les changements de cette passe, jamais les briefs ou le travail préexistant. Aucun retour arrière applicatif n'est requis.
