# Deferred Work

## Deferred from: code review of 1-1-saisie-mitraillette-de-taches-simples.md (2026-07-02)

- Ignorance des préférences utilisateur (Reduced Motion) [`src/components/TaskCard.css`] — Pas de `@media (prefers-reduced-motion: reduce)`
- CSS Reset incomplet et Viewport Units [`src/index.css`] — Manque un reset complet et un fallback `100vh` pour `100svh`
- Missing Error Boundary et Graceful Degradation [`src/main.jsx`] — L'application crashera silencieusement si Dexie ne peut pas s'initialiser (ex: mode navigation privée)

## Deferred from: code review of spec-1-1-corrections-findings-revue.md (2026-07-02)

- Absence de tests pour les nouveaux chemins d'erreur/chargement [`src/components/ProgressiveInput.jsx`, `src/components/TaskList.jsx`] — le rollback optimiste en cas d'échec Dexie et les états `loading`/`error` de `TaskList` n'ont aucune couverture de test
- Sentinelle magique (`'error'`) au lieu d'une union discriminée propre pour l'état de la requête [`src/components/TaskList.jsx`] — fonctionne mais fragile si l'état doit évoluer

## Deferred from: code review of spec-1-2-environnement-de-test-local.md (2026-07-02)

- Severe Host CPU Degradation via Aggressive Polling (CHOKIDAR) — Polling conservé temporairement pour assurer le HMR sur macOS
- Brittle Base Image Versioning (`node:22-bookworm-slim` sans SHA) — Pinning strict reporté
- Missing Container Health Observability — Healthcheck non critique pour l'instant
- Paquets apt non épinglés (`python3 make g++`) [`.devcontainer/Dockerfile`] — reproductibilité stricte des builds non requise pour un devcontainer local solo
- `npm install` (pas `npm ci`) sur le volume `node_modules` persistant [`docker-compose.yml`] — le volume peut dériver du lockfile dans le temps (deps supprimées non purgées) ; `npm ci` casserait le gain de vitesse `--prefer-offline`
- Aucune politique de redémarrage en cas d'échec transitoire de `npm install` [`docker-compose.yml`] — un blip réseau fait échouer tout le conteneur (`set -e`) sans retry automatique

## Deferred from: code review of 1-4-checklists-internes.md (2026-07-02)

- Flawed Checksum Logic in Docker Compose: Concatenating package.json and package-lock.json directly into cmp without delimiters.
- Invalid VS Code Extension ID: devcontainer recommends "vitest.explorer" instead of "ZixuanChen.vitest-explorer".
- Performance Degradation via Unmemoized Prop Generation: TaskList rebuilds categoriesMap using reduce on every single render.
