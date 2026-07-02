---
title: 'Environnement de dev local (devcontainer + docker-compose)'
type: 'chore'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
context: []
baseline_commit: 'a7a36908f62c92a5aaab4ba240100173ac9cb37c'
---

# Environnement de dev local (devcontainer + docker-compose)

## Intent

**Problem:** L'environnement de développement local n'était pas planifié ni standardisé — aucun moyen reproductible de lancer Node.js/Vite en isolation, ce qui expose les développeurs à des divergences de setup entre machines.

**Approach:** Ajouter un `docker-compose.yml` et un devcontainer VS Code partageant la même image Node 22, qui installent les dépendances et démarrent le serveur Vite exposé sur le port 5173, accessible depuis le navigateur de l'hôte — que l'on utilise `docker compose up` ou "Reopen in Container".

## Suggested Review Order

> Régénéré le 2026-07-02 après la passe de correction des 10 findings `[Review][Patch]` — l'ancienne version de cette section décrivait une architecture (démarrage dupliqué compose/devcontainer, `sleep infinity` comme process principal) qui n'existe plus.

**Démarrage unique et gestion des signaux**

- `docker-compose.yml` est l'unique source de vérité du démarrage : vérifie `package.json`, saute `npm install` si `package.json`/`package-lock.json` sont inchangés (stamp), puis `exec npm run dev` pour que le process Vite devienne l'enfant direct de `init: true` (tini) et reçoive correctement les signaux d'arrêt.
  [`docker-compose.yml:32`](../../docker-compose.yml#L32)

- Le devcontainer ne démarre plus rien lui-même (`postStartCommand` supprimé) ; `overrideCommand: false` garantit que la commande compose ci-dessus s'exécute aussi via "Reopen in Container".
  [`devcontainer.json:13`](../../.devcontainer/devcontainer.json#L13)

- Le Dockerfile garde `sleep infinity` uniquement comme repli inoffensif si l'image est lancée hors compose (jamais le cas réel dans ce projet).
  [`Dockerfile:24`](../../.devcontainer/Dockerfile#L24)

**Image, permissions et volumes**

- Utilisateur non-root `node` ; les points de montage `node_modules` et `.git` sont pré-créés et chown (non récursif) pour que les volumes héritent des bonnes permissions dès le premier montage.
  [`Dockerfile:14`](../../.devcontainer/Dockerfile#L14)

- Toolchain native (`python3 make g++`) ajoutée pour la compilation de dépendances natives (ex. binaire esbuild) si aucun binaire précompilé ne correspond à la plateforme.
  [`Dockerfile:5`](../../.devcontainer/Dockerfile#L5)

- `.git` est masqué du conteneur via un volume nommé `git-dir` (plutôt qu'anonyme, pour être réutilisé entre recréations) : réduit la surface montée et évite que le watcher Vite ne scrute l'historique git. Décision explicite du porteur du projet, avec le compromis assumé que `git` n'est plus utilisable depuis l'intérieur du conteneur.
  [`docker-compose.yml:19`](../../docker-compose.yml#L19)

- `user: node` du compose (redondant avec le `USER node` du Dockerfile) a été retiré ; un commentaire clarifie qu'aucune régression de permission n'en découle.
  [`docker-compose.yml:9`](../../docker-compose.yml#L9)

**IDE**

- Extensions VS Code recommandées ajoutées, alignées sur l'outillage réel du projet (`oxlint`, `vitest`) — identifiants vérifiés sur le Marketplace.
  [`devcontainer.json:17`](../../.devcontainer/devcontainer.json#L17)

**Documentation de planning**

- Insertion de la Story 1.2 (devcontainer/docker-compose) dans l'Epic 1, avec renumérotation des stories suivantes, conformément à la sprint-change-proposal.
  [`epics.md:117`](../planning-artifacts/epics.md#L117)

- Statut de la story synchronisé dans le suivi de sprint.
  [`sprint-status.yaml:53`](sprint-status.yaml#L53)

  [`epic-1-context.md:51`](epic-1-context.md#L51)

### Review Findings

- [x] [Review][Patch] Stratégie de démarrage — Déléguer le démarrage du serveur Vite à `docker-compose.yml` et retirer la commande redondante du `devcontainer.json`.
- [x] [Review][Patch] Opaque and Unmanaged Background Processes (crash silencieux de Vite en arrière-plan)
- [x] [Review][Patch] Missing IDE Standardization (extensions VS Code manquantes dans devcontainer.json)
- [x] [Review][Patch] Inefficient Dependency Installation Strategy (`npm install` forcé à chaque démarrage)
- [x] [Review][Patch] Absence de vérification de `package.json` avant démarrage (risque de crash si manquant)
- [x] [Review][Patch] Missing Native Build Tooling in Base Image (pour la compilation esbuild)
- [x] [Review][Patch] Improper PID 1 Lifecycle Handling (`sleep infinity` ignore les signaux)
- [x] [Review][Patch] Overly Broad Volume Mounting (`.:/workspace` inclut .git etc)
- [x] [Review][Patch] Redundant Recursive Ownership Modification (`chown -R node:node`)
- [x] [Review][Patch] Redundant Security Context Definitions (`user: node` en double)
- [x] [Review][Defer] Severe Host CPU Degradation via Aggressive Polling (CHOKIDAR) — deferred, required for macOS but inefficient
- [x] [Review][Defer] Brittle Base Image Versioning (`node:22-bookworm-slim` sans SHA) — deferred, pre-existing
- [x] [Review][Defer] Missing Container Health Observability — deferred, pre-existing
