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

## Deferred from: test manuel de l'Epic 1 (checkpoint review, 2026-07-04)

- Confusion visuelle entre la case "terminer la tâche" (`task-card__checkbox`, le grand cercle à gauche du titre) et les cases de checklist juste en dessous [`src/components/TaskCard.jsx`, `src/components/TaskCard.css`] — repéré en testant manuellement l'Epic 1 : plusieurs tâches ont été marquées `completed` par erreur (clic sur le mauvais cercle), les faisant disparaître instantanément et irréversiblement de la liste "Dépôt" (pas de vue "terminé", pas d'annulation). Pas une perte de données (la tâche reste en base, juste plus affichée), mais un vrai risque UX tant que les deux cases ne sont pas plus distinctes visuellement ou que l'action n'a pas de filet de rattrapage.

## Deferred from: code review of 2-1-creation-de-modeles-de-journees-et-plages-horaires (2026-07-04)

- Implémentation PWA différée [`ARCHITECTURE-SPINE.md`]
- Écart dans le rapport de readiness [`implementation-readiness-report-2026-07-04.md`]
- Mises à jour de dépendances fantômes [`ARCHITECTURE-SPINE.md`]
- Dette technique assumée dans Epic 2 [`epics.md`]
- Logique domaine dans les composants UI [`ConfigurationView.jsx`]
- Absence de fallback pour les API critiques (crypto.randomUUID) [`db.test.js`]
- Modification/Suppression de plages/modèles [`ConfigurationView.jsx`] — (Raison : Non prévu dans cette story)
- Animations de sortie manquantes [`ConfigurationView.css`] — (Raison : aucune fonctionnalité de suppression n'existe encore ; rien à animer en sortie tant que la suppression de plages/modèles reste différée)

## Deferred from: code review (quick-dev) of 2-1-creation-de-modeles-de-journees-et-plages-horaires (2026-07-04, 2e passe)

- Pas de protection contre les doublons de noms de journées types [`ConfigurationView.jsx`] — (Raison : non requis par les AC de cette story ; décision produit à prendre sur l'unicité case-insensitive)
- Sélecteur de catégorie sans message d'aide quand la liste est vide [`ConfigurationView.jsx`] — le formulaire d'ajout de plage horaire reste utilisable en apparence mais bloqué tant qu'aucune catégorie n'existe, sans indication à l'utilisateur
- Race condition sur la détection de chevauchement en cas d'usage multi-onglets/fenêtres simultané sur le même modèle de journée [`ConfigurationView.jsx`] — la vérification `hasOverlap` n'est pas transactionnelle (lecture puis écriture Dexie non atomiques) ; risque théorique hors scope pour une PWA locale mono-utilisateur
