---
epic: 2
story: 3
id: 2.3
status: done
title: Vue Aujourd'hui et Peuplement Initial (Onboarding)
baseline_commit: da482af3d467f8a1a02e66e77af67e87eb0c17f2
---

# Story 2.3: Vue Aujourd'hui et Peuplement Initial (Onboarding)

Status: done

**Epic 2: La Structure du temps (Les Journées Types)**
L'utilisateur peut créer des routines via des Journées Types, structurer ses journées avec des Plages Horaires, et planifier sa semaine facilement.

## 📖 Story

As a Nouvel Utilisateur,
I want voir une journée type immédiatement à l'ouverture de l'application,
So that je sais quoi faire sans avoir l'angoisse de la page blanche.

## ✅ Acceptance Criteria

1. **Given** j'ouvre l'application pour la toute première fois
   **Then** le système génère silencieusement un modèle "Journée Standard" et l'assigne à la date d'aujourd'hui (UX-DR6)
2. **And** la vue "Aujourd'hui" affiche les plages horaires prêtes à recevoir des tâches de l'Inbox (FR11) via une sélection manuelle basique (bouton d'affectation) en attendant l'Epic 3
3. **And** les jours suivants, cette vue affiche la journée planifiée courante ou invite clairement à planifier si aucune n'existe.

## Tasks / Subtasks

- [x] Task 1: Modèle de données Dexie — `timeBlockId` sur les tâches (AC: 2)
  - [x] Ajouter `db.version(7)` dans `src/db.js` avec `tasks: 'id, title, status, createdAt, category, priority, categoryId, plannedDayId, timeBlockId'`, en conservant toutes les tables précédentes.
- [x] Task 2: Service d'onboarding silencieux (AC: 1)
  - [x] Créer `src/services/onboarding.js` exposant `ensureOnboarding()` : si aucune catégorie ni journée type n'existe, générer dans une transaction Dexie `rw` (atomique, idempotente, `try/catch`) des catégories standard, un `DayTemplate` "Journée Standard" avec ses `TimeBlocks`, et un `PlannedDay` pour la date du jour reliant les deux.
- [x] Task 3: Vue "Aujourd'hui" (TodayView) (AC: 1, 2, 3)
  - [x] Créer `TodayView.jsx`/`TodayView.css` : au montage, appeler `ensureOnboarding()` (protégé par `try/catch`), puis interroger via `useLiveQuery` le `PlannedDay` de la date du jour (mêmes précautions de fuseau horaire que la Story 2.2).
  - [x] Si un `PlannedDay` existe : afficher le nom de la journée type et la liste des plages horaires triées par heure de début, avec les tâches déjà affectées à chaque plage.
  - [x] Bouton d'affectation manuelle par plage horaire ouvrant une `<dialog>` native listant les tâches de l'Inbox non affectées ; la sélection met à jour `task.plannedDayId` et `task.timeBlockId` (protégé par `isSubmitting`/`try-catch`).
  - [x] Si aucun `PlannedDay` n'existe pour aujourd'hui (jours suivants sans planification) : afficher un message doux (palette Zen, pas de rouge) invitant à planifier, avec un lien vers la vue Planification.
- [x] Task 4: Navigation et Dépôt (AC: 1, 2, 3)
  - [x] Faire de "Aujourd'hui" la route par défaut (`#/`) dans `App.jsx` (routeur hash existant) et ajouter le bouton de navigation correspondant.
  - [x] Exclure de la liste Dépôt (`TaskList`) les tâches déjà affectées à un `PlannedDay` (`plannedDayId` renseigné), puisqu'elles sont désormais planifiées.
- [x] Task 5: Tests (AC: 1, 2, 3)
  - [x] `db.test.js` : schéma `timeBlockId` sur `tasks`.
  - [x] `TodayView.test.jsx` : onboarding silencieux sur base vide, affichage d'un `PlannedDay` existant avec ses plages, état vide/CTA de planification, affectation manuelle d'une tâche à une plage.
  - [x] `TaskList.test.jsx` : les tâches affectées à un `PlannedDay` n'apparaissent plus dans le Dépôt.
  - [x] `App.test.jsx` : "Aujourd'hui" est la vue par défaut et reste accessible via la navigation.

## 🛠️ Developer Context & Guardrails

### Technical Requirements
- **Local-First / PWA**: Exécution côté client sans backend. 
- **Persistance**: Les données doivent être sauvegardées localement via IndexedDB en utilisant **Dexie.js**.
- **Onboarding Silencieux**: Lors de la première ouverture (ex: aucun `dayTemplates` ou `categories` n'existe dans la base), le système doit générer des données de démarrage ("Journée Standard", quelques catégories utiles) et planifier cette journée pour la date d'aujourd'hui (`PlannedDay`). Les opérations en base pour l'onboarding DOIVENT être atomiques, idempotentes (transaction `rw`), et gérées dans un `try/catch`.
- **Vue Aujourd'hui (TodayView)**: 
  - Doit devenir la vue d'accueil principale de l'application (remplace potentiellement le Dépôt comme vue par défaut au lancement, ou est accessible au premier plan).
  - Affiche le `PlannedDay` de la date courante. 
  - Afficher les plages horaires (`timeBlocks`) associées à ce `PlannedDay`.
  - Intégrer un bouton d'affectation manuel dans les tâches (pour relier `taskId` à `plannedDayId` et potentiellement `timeBlockId`) de façon temporaire en attendant le drag & drop (Epic 3).
  - Gérer l'état vide : inviter à utiliser la vue Planification si aucune journée n'est prévue aujourd'hui.

### Architecture Compliance
- Les tâches n'ont pas de date. L'assignation temporelle d'une tâche (Epic 3) passera par la propriété `plannedDayId` et l'affectation à une plage. La structure de base est déjà prête pour ça.
- Le calcul de la date d'aujourd'hui (format `YYYY-MM-DD`) doit être fait avec les mêmes précautions que la Story 2.2 (utilisation de `Intl` et suppression des heures pour éviter les décalages de fuseau horaire).

### Library/Framework Requirements
- **React 19**: Hooks fonctionnels uniquement.
- **Dexie.js 4**: `useLiveQuery` pour observer les modifications en base en temps réel.
- **Pas de librairie additionnelle**: Pas de Moment.js ni de date-fns, utilisez les API natives.

### File Structure & Existing Code Modifications
- **Fichiers à modifier :**
  - `src/App.jsx` : Ajouter la navigation pour "Aujourd'hui". Faire de cette vue la route par défaut `# /` ou ajouter un bouton dédié.
- **Fichiers à créer :**
  - `src/components/TodayView.jsx` et `TodayView.css`.
  - `src/services/onboarding.js` (ou logique interne équivalente) pour abstraire la génération de la journée standard.

### Testing Requirements
- Tester `TodayView` et le processus d'onboarding avec `fake-indexeddb` et `React Testing Library`.
- Cas de test obligatoires :
  1. Base vide -> génération silencieuse -> affichage du modèle standard (Onboarding).
  2. `PlannedDay` présent -> affichage correct des plages horaires.
  3. Pas de `PlannedDay` (et pas la première fois) -> affichage du call-to-action pour planifier.
- Tester l'affectation manuelle d'une tâche.

### Previous Story Intelligence
- Protéger systématiquement les appels Dexie en écriture (`.put`, `.add`) par un état de chargement (`isBusy` ou `isSubmitting`) pour éviter les doubles exécutions.
- Les `<dialog>` natives ont bien fonctionné pour la vue Planification. S'il y a besoin d'une modale (par exemple, pour sélectionner une plage horaire lors de l'affectation), utilisez la même approche avec `<dialog>`.
- Assurez-vous d'utiliser `crypto.randomUUID()` pour toute nouvelle entité générée lors de l'onboarding.

### Git Intelligence
- Le code précédent a étendu un routeur rudimentaire basé sur `window.location.hash`. Réutilisez cette architecture pour la route "Aujourd'hui".

### Latest Tech Information
- Sous React 19, les `<dialog>` peuvent être contrôlées de manière déclarative avec le composant et une `ref`, mais requièrent souvent une fermeture explicite sur la ref (ex: `dialogRef.current.showModal()`).

### Project Context Reference
- **Palette Zen** : Pas de texte d'erreur en rouge vif si la journée n'est pas planifiée. Un message doux et encourageant suffit.
- Conservez les zones cliquables (Hitboxes) d'au moins 44x44px.
- Pas de devinette de requirements complexes non demandés (pas de notification push, pas de récurrence complexe).

---
Ultimate context engine analysis completed - comprehensive developer guide created

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npx vitest run` — 10 fichiers, 57 tests, tous passants (dont 4 nouveaux tests `onboarding.test.js`, 4 nouveaux `TodayView.test.jsx`, 2 nouveaux `TaskList.test.jsx`, 1 nouveau `db.test.js` sur `timeBlockId`, tests `App.test.jsx` mis à jour pour la nouvelle navigation par défaut).
- `npx oxlint` — aucune erreur/avertissement.
- `npx vite build` — build de production OK.
- Vérification manuelle en navigateur (Vite dev server + Playwright headless, `chromium` via le cache npx local faute de `chromium-cli` sur cette machine) : base vide → onboarding silencieux → affichage de "Journée Standard" et ses 4 plages ; création d'une tâche dans le Dépôt → affectation manuelle depuis "Aujourd'hui" (dialog native) → tâche visible dans la plage choisie et disparue du Dépôt ; simulation d'un jour sans `PlannedDay` (catégories/journées déjà existantes) → message doux + lien "Aller à la Planification" (palette Zen respectée, aucun rouge). Aucune erreur console sur les trois scénarios.

### Completion Notes List

- `src/db.js` : ajout de `db.version(7)` avec `timeBlockId` sur `tasks`, sans modification des tables/versions précédentes.
- `src/services/onboarding.js` (nouveau) : `ensureOnboarding()` — dans une transaction Dexie `rw` unique (catégories, journées types, plages, journées planifiées), vérifie `categories.count()` et `dayTemplates.count()` ; si les deux sont à zéro, crée 3 catégories standard ("Travail", "Personnel", "Pause"), un `DayTemplate` "Journée Standard" avec 4 `TimeBlocks` (09:00–12:00, 12:00–13:00, 13:00–18:00, 18:00–20:00) et un `PlannedDay` pour la date du jour (sauf si un `PlannedDay` existe déjà pour cette date). Idempotent (skip complet si catégories ou journées types déjà présentes) et protégé par `try/catch` (erreur journalisée en console, jamais bloquante pour l'UI).
- `TodayView` (nouveau composant) : déclenche `ensureOnboarding()` au montage, puis observe via `useLiveQuery` le `PlannedDay` du jour (`YYYY-MM-DD` calculé localement, même approche que la Story 2.2 pour éviter les décalages de fuseau horaire). Distingue explicitement l'état "chargement" (valeur `undefined`) de l'état "aucune journée planifiée" (valeur `null`), sans quoi les deux étaient indiscernables avec `useLiveQuery`.
  - Si un `PlannedDay` existe : affiche le nom de la journée type et ses plages horaires (triées par heure de début), avec les tâches déjà affectées à chacune et un bouton "Affecter une tâche" ouvrant une `<dialog>` native listant les tâches de l'Inbox non planifiées (`plannedDayId` vide). La sélection met à jour `task.plannedDayId`/`task.timeBlockId` via `db.tasks.update`, protégée par `isSubmitting`/`try-catch`.
  - Si aucun `PlannedDay` n'existe : message doux (aucune couleur d'alerte) + lien `<a href="#/planification">` vers la vue Planification.
- `App.jsx` : "Aujourd'hui" devient la route par défaut (`#/`, plus de hash spécifique) ; le Dépôt est désormais accessible via `#/depot` et son propre bouton de navigation. Réutilise le routeur hash existant (`viewFromHash`, `navigate`, helper `cx()`, `aria-current="page"`).
- `TaskList.jsx` : la requête inbox exclut désormais les tâches ayant un `plannedDayId` renseigné (déjà planifiées), via `.filter((task) => !task.plannedDayId)` sur la requête Dexie existante.
- Aucune nouvelle dépendance NPM ajoutée : calculs de dates via `Date`/`Intl` natifs uniquement, réutilisation de la balise `<dialog>` (pattern établi en Story 2.2, y compris le shim `HTMLDialogElement` déjà présent dans `setupTests.js`).
- La story ne contenait pas de section "Tasks / Subtasks" à l'activation du workflow (contrairement aux Stories 2.1/2.2) ; elle a été reconstituée à partir des AC et du contexte développeur avant le début de l'implémentation.

### File List

- `src/db.js` (modifié — `db.version(8)`, index composé `[status+plannedDayId]`, migration)
- `src/db.test.js` (modifié)
- `src/App.jsx` (modifié — routage strict + vue "introuvable")
- `src/App.css` (modifié — style de la vue "introuvable")
- `src/App.test.jsx` (modifié)
- `src/components/TaskList.jsx` (modifié — requête via index composé)
- `src/components/TaskList.test.jsx` (nouveau)
- `src/components/TodayView.jsx` (modifié après review — corrections des findings)
- `src/components/TodayView.css` (modifié — styles Retirer/orphelines)
- `src/components/TodayView.test.jsx` (modifié — nouveaux tests Retirer/orphelines/premier lancement)
- `src/components/ProgressiveInput.jsx` (modifié — sentinelle `plannedDayId: ''`)
- `src/services/onboarding.js` (modifié après review — heuristique découplée, UUID de secours, Intl)
- `src/services/onboarding.test.js` (modifié — nouveaux tests de l'heuristique découplée)

## Change Log

- 2026-07-04 — Implémentation complète de la Story 2.3 : `db.version(7)` (`timeBlockId` sur `tasks`), service `ensureOnboarding()` générant silencieusement une "Journée Standard" (catégories, plages, `PlannedDay` du jour) sur base vide, nouvelle vue `TodayView` (affichage du `PlannedDay` du jour et de ses plages, affectation manuelle d'une tâche de l'Inbox par `<dialog>` native, CTA doux vers la Planification si aucune journée n'est planifiée), "Aujourd'hui" devenue route par défaut dans `App.jsx` (Dépôt déplacé sur `#/depot`), filtrage du Dépôt pour exclure les tâches déjà planifiées. Tests unitaires (57/57), lint et build propres, vérification manuelle en navigateur (Playwright headless) sans erreur console sur les trois scénarios (onboarding, affectation, état vide). Statut passé à "review".
- 2026-07-04 — Application des 14 action items de la revue : `db.version(8)` avec index composé `[status+plannedDayId]` et sentinelle `plannedDayId: ''` (migration de backfill incluse) pour un filtrage indexé du Dépôt/Inbox ; bouton "Retirer" pour désaffecter une tâche (bloc horaire ou tâche orpheline) ; heuristique d'onboarding découplée (catégories vs journée type gatées indépendamment) ; UUID de secours si `crypto.randomUUID` est indisponible ; formatage de date via `Intl.DateTimeFormat('en-CA')` dans `onboarding.js` ; actualisation de la date à minuit dans `TodayView` ; correction du flash d'état vide au lancement de l'onboarding ; tri cohérent des tâches de l'Inbox dans la modale d'affectation ; restauration du focus sur le bouton déclencheur à la fermeture de la modale ; état de chargement complété (attend aussi `dayTemplate`) ; routage `App.jsx` strict avec vue "Page introuvable" dédiée pour les hash non reconnus ; fermeture de la modale d'affectation bloquée pendant une soumission en cours ; message d'erreur affiché à l'intérieur de la modale pendant une affectation ; section "Tâches non classées" pour les tâches dont la plage horaire a été supprimée. 61/61 tests (4 nouveaux), lint et build propres, vérification manuelle en navigateur (Playwright headless) : onboarding, affectation, focus restauré après fermeture, désaffectation, route inconnue — aucune erreur console. Les 3 findings `defer` restent inchangés (déjà reportés dans `deferred-work.md`).
- 2026-07-04 — Revue croisée (3 sous-agents : blind hunter, edge-case hunter, auditeur de conformité) du diff scopé à la Story 2.3 après la passe ci-dessus. 6 régressions/incohérences réelles introduites par les correctifs ont été corrigées : (1) `dayTemplate` résolu en `null` (au lieu de rester `undefined`) quand la journée type référencée n'existe plus, avec un état "modèle introuvable" dédié, pour éviter un chargement infini ; (2) le libellé de date visible dérive désormais de `todayISO` (`parseISODate`) au lieu d'un second appel à `new Date()`, supprimant tout risque de dérive entre l'affichage et la requête ; (3) le filtre des tâches non classées n'exige plus un `timeBlockId` tronqué, une tâche planifiée sans plage valide reste visible ; (4) le `toISODate` propre à `TodayView.jsx` utilise désormais `Intl.DateTimeFormat('en-CA')`, cohérent avec `onboarding.js` modifié dans le même diff ; (5) constante partagée `UNASSIGNED_PLANNED_DAY_ID` (`src/db.js`) documentant la sentinelle `''` et utilisée dans `ProgressiveInput.jsx`/`TaskList.jsx`/`TodayView.jsx` ; (6) écoute de `visibilitychange` en complément du minuteur de minuit pour resynchroniser la date après une mise en veille/limitation d'onglet. Simplification additionnelle : l'affectation de catégorie de repli dans `onboarding.js` utilise désormais la première catégorie existante plutôt qu'un cycle modulo arbitraire. Nouveau test de restauration du focus ajouté. 6 constats jugés réels mais hors scope ou non atteignables via l'UI actuelle ont été ajoutés à `deferred-work.md` (onboarding non déclenché hors "Aujourd'hui", résultat `db.tasks.update()` non vérifié, modale non fermée si la plage disparaît pendant l'ouverture, absence de titre accessible sur la modale, perte de récupération d'une tâche "completed" désaffectée, index unique `&date` sans migration de dédoublonnage). Un constat a été rejeté (le hash inconnu qui ne s'auto-corrige pas au rechargement est le comportement 404 attendu, pas un bug). 62/62 tests, lint et build propres, re-vérification manuelle en navigateur sans erreur console.

### Review Findings

1. `decision-needed` findings (résolus):
- [x] [Review][Patch] Désaffectation de tâche manquante — Il n'y a pas de moyen d'annuler l'affectation d'une tâche à une plage horaire dans TodayView. (Décision: ajouter un bouton) — Résolu : bouton "Retirer" sur chaque tâche affectée (bloc ou orpheline), remet `plannedDayId: ''`/`timeBlockId: null`.
- [x] [Review][Patch] Filtrage en mémoire inefficace — TaskList filtre les tâches planifiées en mémoire. (Décision: ajouter un index composé Dexie) — Résolu : `db.version(8)` avec index composé `[status+plannedDayId]`, sentinelle `plannedDayId: ''` (au lieu de `null`) sur toutes les créations/désaffectations de tâches, migration `upgrade()` backfillant les tâches existantes. `TaskList`/`TodayView` interrogent désormais l'index composé directement.

2. `patch` findings (résolus):
- [x] [Review][Patch] Heuristique d'onboarding fragile [src/services/onboarding.js] — Résolu : la création des catégories standard et celle de la journée type/plages/PlannedDay sont désormais gatées indépendamment (`categoryCount === 0` / `dayTemplateCount === 0`), pour ne plus sauter l'onboarding si un seul des deux existe déjà.
- [x] [Review][Patch] Plantage UUID dans contextes non sécurisés [src/services/onboarding.js] — Résolu : `generateId()` retombe sur un générateur UUIDv4 manuel si `crypto.randomUUID` est indisponible ou lève.
- [x] [Review][Patch] Pas d'actualisation de la date à minuit [src/components/TodayView.jsx] — Résolu : `useTodayISO()` planifie un `setTimeout` jusqu'au prochain minuit et recalcule la date.
- [x] [Review][Patch] Formatage de la date natif au lieu de Intl [src/services/onboarding.js] — Résolu : `toISODate` utilise `Intl.DateTimeFormat('en-CA', …)`.
- [x] [Review][Patch] Race condition au lancement de l'onboarding [src/components/TodayView.jsx] — Résolu : état `onboardingDone` inclus dans `isLoading`, évitant le flash de l'état vide avant la fin de la transaction d'onboarding.
- [x] [Review][Patch] Ordre des tâches incohérent dans la boîte de dialogue [src/components/TodayView.jsx] — Résolu : `inboxTasks` triées par `createdAt` décroissant, comme dans `TaskList`.
- [x] [Review][Patch] Perte de focus à la fermeture de la modale [src/components/TodayView.jsx] — Résolu : le bouton déclencheur est mémorisé (`triggerRef`) et regagne le focus à la fermeture (vérifié manuellement en navigateur).
- [x] [Review][Patch] États de chargement incomplets [src/components/TodayView.jsx] — Résolu : `isLoading` couvre aussi le cas où `plannedDay` est résolu mais `dayTemplate` ne l'est pas encore (évite le titre vide).
- [x] [Review][Patch] Routage par défaut attrape-tout masque les bugs [src/App.jsx] — Résolu : seuls `#/`, `#` et `''` mappent vers "Aujourd'hui" ; tout hash inconnu affiche une vue "Page introuvable" dédiée.
- [x] [Review][Patch] Fermeture abrupte de la modale d'affectation [src/components/TodayView.jsx] — Résolu : fermeture (backdrop/Échap/Annuler) ignorée tant qu'une affectation est en cours (`isSubmitting`).
- [x] [Review][Patch] Message d'erreur masqué sous la modale [src/components/TodayView.jsx] — Résolu : le message d'erreur s'affiche à l'intérieur du `<dialog>` pendant une affectation, et dans la section principale pour les erreurs de désaffectation.
- [x] [Review][Patch] Disparition de la tâche si timeBlockId est supprimé [src/components/TodayView.jsx] — Résolu : section "Tâches non classées" listant les tâches dont la plage horaire n'existe plus, avec bouton "Retirer".

3. `defer` findings (checked off, marked deferred):
- [x] [Review][Defer] Suppression destructive silencieuse (duplicateWeek) [src/components/PlanningView.jsx] — deferred, pre-existing
- [x] [Review][Defer] Formatage de langue codé en dur (fr-FR) [src/components/PlanningView.jsx] — deferred, pre-existing
- [x] [Review][Defer] Exécutions concurrentes redondantes d'upsert [src/components/PlanningView.jsx] — deferred, pre-existing

## Suggested Review Order

**Filtrage indexé du Dépôt/Inbox (sentinelle `''` + index composé)**

- Point d'entrée : sentinelle documentée et index composé introduits pour remplacer le filtrage en mémoire.
  [`db.js:9`](../../src/db.js#L9)
- Migration de schéma : nouvel index `[status+plannedDayId]` + backfill des tâches existantes (`null`/`undefined` → `''`).
  [`db.js:55`](../../src/db.js#L55)
- Le Dépôt interroge directement l'index composé au lieu de filtrer en mémoire.
  [`TaskList.jsx:10`](../../src/components/TaskList.jsx#L10)
- Même index côté "Aujourd'hui" pour la liste de la modale d'affectation.
  [`TodayView.jsx:114`](../../src/components/TodayView.jsx#L114)

**Heuristique d'onboarding découplée**

- Catégories et journée type standard sont désormais gatées indépendamment.
  [`onboarding.js:60`](../../src/services/onboarding.js#L60)
- La création de la journée type ne saute plus si des catégories existent déjà.
  [`onboarding.js:74`](../../src/services/onboarding.js#L74)
- UUID de secours si `crypto.randomUUID` est indisponible/lève (contexte non sécurisé).
  [`onboarding.js:27`](../../src/services/onboarding.js#L27)
- Date au format ISO via `Intl.DateTimeFormat('en-CA')` plutôt qu'un assemblage manuel.
  [`onboarding.js:16`](../../src/services/onboarding.js#L16)

**Désaffectation et tâches orphelines**

- `unassignTask` remet la sentinelle et supprime `timeBlockId`, protégé par `isSubmitting`/`try-catch`.
  [`TodayView.jsx:167`](../../src/components/TodayView.jsx#L167)
- Les tâches planifiées dont la plage n'existe plus restent visibles (le filtre n'exige plus un `timeBlockId` tronqué).
  [`TodayView.jsx:128`](../../src/components/TodayView.jsx#L128)

**États de chargement et course d'onboarding**

- `isLoading` attend la fin de l'onboarding et la résolution de `dayTemplate`, pas seulement `plannedDay`.
  [`TodayView.jsx:181`](../../src/components/TodayView.jsx#L181)
- Un `dayTemplate` manquant (référence cassée) résout en `null` plutôt qu'en rester `undefined`, pour éviter un chargement infini.
  [`TodayView.jsx:198`](../../src/components/TodayView.jsx#L198)

**Date du jour et minuit**

- `useTodayISO` planifie un `setTimeout` jusqu'au minuit suivant pour recalculer la date.
  [`TodayView.jsx:36`](../../src/components/TodayView.jsx#L36)
- Écoute `visibilitychange` en complément, pour resynchroniser après veille/limitation d'onglet.
  [`TodayView.jsx:59`](../../src/components/TodayView.jsx#L59)
- Le libellé visible dérive de `todayISO` (`parseISODate`) plutôt que d'un second `new Date()`.
  [`TodayView.jsx:185`](../../src/components/TodayView.jsx#L185)

**Modale d'affectation (focus, erreurs, fermeture)**

- Le bouton déclencheur est mémorisé pour restaurer le focus à la fermeture.
  [`TodayView.jsx:136`](../../src/components/TodayView.jsx#L136)
- Fermeture (backdrop/Échap/Annuler) ignorée tant qu'une soumission est en cours.
  [`TodayView.jsx:147`](../../src/components/TodayView.jsx#L147)
- Message d'erreur affiché à l'intérieur du `<dialog>` pendant une affectation, pour ne pas rester masqué derrière la modale.
  [`TodayView.jsx:305`](../../src/components/TodayView.jsx#L305)

**Routage strict**

- Hash inconnu : vue "Page introuvable" dédiée plutôt qu'un repli silencieux vers "Aujourd'hui".
  [`App.jsx:13`](../../src/App.jsx#L13)

**Tests et style (périphérique)**

- Nouveaux tests : désaffectation, tâches orphelines, restauration du focus, heuristique découplée.
  [`TodayView.test.jsx:113`](../../src/components/TodayView.test.jsx#L113)
- Nouveaux tests d'onboarding découplé (catégorie existante sans journée type, idempotence stricte).
  [`onboarding.test.js:1`](../../src/services/onboarding.test.js#L1)
