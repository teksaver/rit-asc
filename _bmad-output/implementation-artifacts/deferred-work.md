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
