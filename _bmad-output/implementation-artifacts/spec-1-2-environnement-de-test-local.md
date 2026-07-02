---
title: 'Environnement de dev local (devcontainer + docker-compose)'
type: 'chore'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
context: []
---

# Environnement de dev local (devcontainer + docker-compose)

## Intent

**Problem:** L'environnement de développement local n'était pas planifié ni standardisé — aucun moyen reproductible de lancer Node.js/Vite en isolation, ce qui expose les développeurs à des divergences de setup entre machines.

**Approach:** Ajouter un `docker-compose.yml` et un devcontainer VS Code partageant la même image Node 22, qui installent les dépendances et démarrent le serveur Vite exposé sur le port 5173, accessible depuis le navigateur de l'hôte — que l'on utilise `docker compose up` ou "Reopen in Container".

## Suggested Review Order

**Image et permissions du conteneur**

- Utilisateur non-root `node` avec le point de montage `node_modules` pré-créé et chown, pour que le volume nommé hérite des bonnes permissions dès le premier montage.
  [`Dockerfile:9`](../../.devcontainer/Dockerfile#L9)

- Le service compose tourne en tant qu'utilisateur `node` (cohérent avec `remoteUser` du devcontainer), avec du polling de fichiers pour un HMR fiable sur bind-mount macOS.
  [`docker-compose.yml:6`](../../docker-compose.yml#L6)
  [`docker-compose.yml:16`](../../docker-compose.yml#L16)

**Démarrage et résilience**

- `docker compose up` installe les dépendances et lance directement le serveur Vite exposé sur `0.0.0.0:5173`.
  [`docker-compose.yml:18`](../../docker-compose.yml#L18)

- Le devcontainer garde le process principal en `sleep infinity` (résilient à un crash de Vite) et démarre le serveur dev en tâche de fond via `postStartCommand`.
  [`devcontainer.json:13`](../../.devcontainer/devcontainer.json#L13)
  [`Dockerfile:14`](../../.devcontainer/Dockerfile#L14)

**Documentation de planning**

- Insertion de la Story 1.2 (devcontainer/docker-compose) dans l'Epic 1, avec renumérotation des stories suivantes, conformément à la sprint-change-proposal.
  [`epics.md:117`](../planning-artifacts/epics.md#L117)

- Statut de la story synchronisé dans le suivi de sprint.
  [`sprint-status.yaml:53`](sprint-status.yaml#L53)

- Correction de la dépendance inter-stories dans le contexte d'epic généré (1.2 est un ajout a posteriori, pas un prérequis bloquant pour 1.1).
  [`epic-1-context.md:51`](epic-1-context.md#L51)
