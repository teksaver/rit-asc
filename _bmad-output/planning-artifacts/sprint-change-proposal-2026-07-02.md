# Sprint Change Proposal

## Section 1: Issue Summary
- **Problem Statement:** L'environnement de développement local (devcontainer et docker-compose) n'a pas été planifié dans les Epics initiaux. Cela empêche les développeurs de travailler et de tester l'application dans un environnement standardisé et isolé.
- **Context:** Le besoin a été identifié juste après la complétion de la Story 1.1.
- **Evidence:** Les documents `epics.md`, le PRD et l'Architecture ne mentionnent aucune infrastructure de test local, se concentrant directement sur les fonctionnalités métier.

## Section 2: Impact Analysis
- **Epic Impact:** L'Epic 1 ("L'Inbox et le Vidage de tête") est directement impacté car il est le point de départ du développement.
- **Story Impact:** Une nouvelle Story (1.2) doit être insérée. Les Stories suivantes (1.2, 1.3) seront décalées en (1.3, 1.4).
- **Artifact Conflicts:** Aucun conflit majeur.
- **Technical Impact:** Impact très positif, car cela standardisera l'environnement de développement (Node, Vite, etc.) et sécurisera les développements suivants.

## Section 3: Recommended Approach
- **Selected Approach:** Direct Adjustment (Ajustement direct).
- **Rationale:** Ajouter la tâche technique directement dans l'Epic 1 (en tant que Story 1.2) est l'approche la plus pragmatique. L'effort est faible, le risque est faible, et l'impact sur le planning est minimal car c'est une tâche de configuration rapide.
- **Effort Estimate:** Faible.
- **Risk Level:** Faible.

## Section 4: Detailed Change Proposals
**Document: `epics.md`**
**Insertion d'une nouvelle Story 1.2 et renumérotation des suivantes.**

*Nouveau contenu ajouté :*
```markdown
### Story 1.2: Environnement de Test Local (Devcontainer & Docker-compose)

As a Développeur,
I want un environnement devcontainer et un fichier docker-compose configurés,
So that je puisse développer et tester l'application en local dans un environnement isolé et standardisé.

**Acceptance Criteria:**
**Given** le dépôt du projet
**When** je lance le projet avec docker-compose ou que j'ouvre le devcontainer
**Then** l'environnement de développement s'initialise avec tous les outils nécessaires (Node.js, Vite, etc.)
**And** l'application locale tourne sur un port exposé et accessible via mon navigateur local.
```

## Section 5: Implementation Handoff
- **Scope Classification:** Mineur (Minor).
- **Handoff:** Agent Développeur (`bmad-quick-dev` ou `bmad-dev-story`).
- **Responsabilités:**
  1. Mettre à jour le fichier `epics.md` selon la proposition ci-dessus.
  2. Implémenter le `devcontainer` et le `docker-compose.yml`.
- **Success Criteria:** L'environnement se lance sans erreur et expose l'application locale avec Vite.
