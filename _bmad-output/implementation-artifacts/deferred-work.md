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

## Deferred from: code review of 2-2-planification-dune-semaine-et-duplication (2026-07-04)

- Logique de routage fragile (Ternaires imbriquées) [`src/App.jsx`] — deferred, pre-existing
- Utilisation non sécurisée de Dialog natif (risque de blocage si démonté) [`src/components/PlanningView.jsx`] — deferred, pre-existing
- Mocking de test inutile pour `<dialog>` [`src/setupTests.js`] — deferred, pre-existing
- `crypto.randomUUID` indisponible si contexte non sécurisé [`src/components/PlanningView.jsx`] — deferred, pre-existing
- Jour assigné supprimé pendant que la boîte de dialogue de duplication est ouverte [`src/components/PlanningView.jsx`] — deferred, pre-existing

## Deferred from: code review of 2-3-vue-aujourdhui-et-peuplement-initial (2026-07-04)

- Suppression destructive silencieuse (duplicateWeek) [src/components/PlanningView.jsx] — duplicateWeek supprime silencieusement les PlannedDay
- Formatage de langue codé en dur (fr-FR) [src/components/PlanningView.jsx] — utilisation de fr-FR en dur
- Exécutions concurrentes redondantes d'upsert [src/components/PlanningView.jsx] — double clic sur le bouton de confirmation

## Deferred from: code review (quick-dev) of 2-3-vue-aujourdhui-et-peuplement-initial (2026-07-04, application des action items)

- Onboarding non déclenché en dehors de "Aujourd'hui" [src/components/TodayView.jsx] — `ensureOnboarding()` ne tourne que dans un `useEffect` de `TodayView` ; un accès direct à `#/depot`/`#/configuration`/`#/planification` (lien profond, favori) au tout premier lancement contourne le peuplement initial. Rare en pratique car "Aujourd'hui" est la route par défaut.
- Résultat de `db.tasks.update()` non vérifié [src/components/TodayView.jsx] — `assignTask`/`unassignTask` traitent la promesse résolue comme un succès même si Dexie retourne `0` ligne modifiée (tâche supprimée entre-temps par un autre onglet) ; risque théorique hors scope pour une PWA locale mono-utilisateur.
- Boîte de dialogue d'affectation non fermée si le `PlannedDay`/la plage disparaît pendant qu'elle est ouverte [src/components/TodayView.jsx] — nécessiterait une fonctionnalité de suppression de plages/modèles qui n'existe pas encore (Configuration).
- Boîte de dialogue d'affectation sans titre accessible réel (`aria-labelledby`/`h2`) [src/components/TodayView.jsx] — pré-existant, `aria-label` seul reste une expérience lecteur d'écran plus faible qu'un titre associé.
- Aucun moyen de retrouver une tâche déjà marquée "completed" après désaffectation (`Retirer`) [src/components/TodayView.jsx] — actuellement impossible à atteindre via l'UI (aucune case à cocher n'est exposée pour les tâches déjà affectées à une plage) ; relève de la manipulation de tâches planifiées, prévue en Epic 3.
- Index unique `&date` introduit en `db.version(6)` sans migration de dédoublonnage [src/db.js] — pré-existant, pas de garde-fou si des données locales avaient déjà des doublons de date avant cette version.

## Deferred from: code review of 3-1-manipulation-et-affectation-des-taches.md (2026-07-06)
- Création d'index uniques Dexie (AD-7) — deferred, pre-existing
- Verrouillage global de la vue TodayView lors de la soumission — deferred, pre-existing
