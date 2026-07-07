---
epic: 4
story: 1
id: 4.1
status: done
title: Vue Semaine et Export
baseline_commit: 9374d782acddf9bf18bf6f1ab7c928ec82e3eadf
---

# Story 4.1: Vue Semaine et Export

**Status:** done
**Epic:** 4 (Vue d'Ensemble, Suggestions et Sauvegardes)

## 📖 Story Requirements (Foundation)

**User Story Statement:**
As a Utilisateur, I want voir ma semaine d'un coup d'œil et pouvoir l'exporter, So that j'ai une synthèse claire et imprimable de mon planning.

**Acceptance Criteria (BDD):**
- **Given** je suis sur l'onglet "Semaine"
- **Then** je vois une synthèse de toutes mes journées prévues pour la semaine en cours
- **And** je dispose d'un bouton "Export" qui génère une vue imprimable (PDF/Impression système) du planning de la semaine (FR12).

**Business Context & Value:**
L'utilisateur a besoin de prendre du recul sur son organisation de la semaine, et éventuellement de l'imprimer pour l'afficher (ex: sur le frigo). Cette vue doit être une synthèse claire, reprenant les données déjà stockées dans Dexie pour la semaine courante. L'export doit être simple et s'appuyer sur les fonctionnalités natives de l'appareil (Impression système / Sauvegarder au format PDF).

## 📋 Tasks / Subtasks

- [x] **Task 1: ATDD / Tests Unitaires de la requête de la semaine**
  - [x] Écrire un test unitaire (dans `src/components/WeekView.test.jsx` ou utilitaire séparé) pour calculer correctement le lundi et le dimanche de la semaine en cours. → `src/services/weekRange.test.js` (7 cas : milieu de semaine, dimanche, lundi, bornes, franchissement mois/année).
  - [x] Mocker IndexedDB via `fake-indexeddb` pour valider que la requête Dexie (`db.plannedDays.where('date').between(...)`) récupère les bonnes journées. → `WeekView.test.jsx` « n'inclut que les journées de la semaine courante (borne Dexie between) ».
- [x] **Task 2: Implémentation du calcul des dates et requête Dexie**
  - [x] Développer la fonction utilitaire pour obtenir les dates ISO (`YYYY-MM-DD`) du lundi et du dimanche de la semaine courante (AD-6: utiliser les API natives sans lib tierce). → `src/services/weekRange.js` (`getWeekRange`, `getWeekDates`, `Intl.DateTimeFormat('en-CA')`).
  - [x] Implémenter la logique de récupération (avec `useLiveQuery`) des `PlannedDay` et des tâches correspondantes pour cette plage de dates.
- [x] **Task 3: Création du composant `WeekView`**
  - [x] Créer `src/components/WeekView.jsx` et `src/components/WeekView.css`.
  - [x] Afficher la synthèse de la semaine de façon responsive (NFR1).
  - [x] Ajouter un bouton "Exporter" qui déclenche un simple `window.print()`.
- [x] **Task 4: Intégration de la vue dans la navigation principale (`App.jsx`)**
  - [x] Ajouter un onglet "Semaine" dans `src/App.jsx` (`<nav className="app__nav">`).
  - [x] Mettre à jour le routeur rudimentaire (`viewFromHash`, `navigate`, `titlesByView`) pour gérer `#/semaine`.
- [x] **Task 5: CSS pour l'impression système (`@media print`)**
  - [x] Ajouter des règles `@media print` dans `src/components/WeekView.css` pour masquer la navigation (`.app__nav`) et le bouton d'export, neutraliser ombres/fonds, éviter les coupures de cartes (`break-inside: avoid`) et déployer la grille sur toute la largeur.

### Review Findings

- [x] [Review][Patch] Omission des tâches planifiées non assignées à un bloc horaire — corrigé : ajout d'une section « Tâches sans plage horaire » par jour (`week-view__day-orphaned`), même principe que `TodayView` (`orphanedTasks`). Test ajouté.
- [x] [Review][Patch] Race condition sur l'état de chargement provoquant un affichage erroné [src/components/WeekView.jsx:434-445] — corrigé : les 5 `useLiveQuery` (dont `dayTemplates`/`timeBlocks`/`categories`/`plannedTasks`) n'ont plus de valeur par défaut ; `isLoading` attend désormais que les cinq aient résolu, plus de flash "Modèle supprimé" si une requête secondaire résout après `plannedDays`.
- [x] [Review][Patch] Surcharge de la mémoire avec l'historique complet des tâches [src/components/WeekView.jsx] — corrigé : `plannedTasks` est borné via `anyOf(plannedDayIds)` aux jours de la semaine affichée (dépend de `plannedDays`), au lieu de charger tout l'historique des tâches planifiées.
- [x] [Review][Patch] Boucles de rendu O(N²) inefficaces [src/components/WeekView.jsx] — corrigé : `tasksByPlannedDayId` regroupe les tâches par jour une seule fois ; chaque bloc filtre désormais sur `dayTasks` (borné au jour) au lieu de la liste complète des tâches de la semaine.
- [x] [Review][Patch] Duplication inutile de la configuration du formateur de date [src/services/weekRange.js] — corrigé : suppression du `ISO_DATE_FORMATTER`/`todayISO()` dupliqué dans `WeekView.jsx`, réutilisation de `toISODate()` déjà exporté par `weekRange.js`.
- [x] [Review][Patch] Bogues liés au changement d'heure (DST) dans les calculs de dates [src/services/weekRange.js] — vérifié, pas de correction nécessaire : `addDays` utilise `date.setDate(date.getDate() + amount)` (arithmétique calendaire locale), pas d'arithmétique en millisecondes. Testé en Node avec `TZ=Europe/Paris` autour des transitions DST 2026-03-29 et 2026-10-25 : aucune dérive.
- [x] [Review][Patch] Tri fragile des heures et heures indéfinies [src/components/WeekView.jsx:25] — vérifié, pas de correction nécessaire : reproduit exactement le comparateur déjà utilisé dans `ConfigurationView.jsx:62` (et validé sans fragilité réelle lors de la revue de la story 3.2) ; `startTime` provient exclusivement d'un `<input type="time">`, jamais `undefined` en pratique.
- [x] [Review][Patch] Crash possible avec des dates mal formées ou indéfinies [src/services/weekRange.js:16] — vérifié, pas de correction nécessaire : dans le périmètre de cette story, `parseISODate` n'est appelé qu'avec des chaînes ISO générées en interne (`getWeekDates`/`toISODate`), jamais avec une donnée brute non validée issue de Dexie. Un garde spéculatif ajouterait de la validation à un chemin non atteignable.
- [x] [Review][Patch] État survol (hover) manquant sur le bouton d'export [src/components/WeekView.css] — corrigé : `.week-view__export:hover { filter: brightness(0.92); }`.
- [x] [Review][Patch] Optimisation d'impression imparfaite (contraste) [src/components/WeekView.css] — corrigé : en `@media print`, `.week-view__day-template` et `.week-view__block-category` repassent sur `--color-text-primary` (le violet accent et le gris secondaire étaient peu lisibles imprimés en noir et blanc).
- [x] [Review][Defer] Données obsolètes si l'application reste ouverte [src/components/WeekView.jsx] — deferred, pre-existing

### Review Findings — Round 2 (après application des 10 patches ci-dessus)

Revue à 3 agents (Blind Hunter, Edge Case Hunter, Acceptance Auditor) sur le diff complet depuis `baseline_commit`. Auditeur de conformité : **0 finding**, spec et project-context.md respectés.

- [x] [Review][Patch] En-tête de semaine non testé [src/components/WeekView.test.jsx] — corrigé : test ajouté vérifiant le texte exact « Semaine du 06/07 au 12/07 ».
- [x] [Review][Patch] Tâche avec `timeBlockId` d'un autre jour non couverte par un test [src/components/WeekView.test.jsx] — corrigé : test ajouté, une tâche pointant vers la plage horaire d'un autre jour est bien traitée comme « sans plage horaire ».
- [x] [Review][Patch] Absence d'`aria-live` sur les états chargement/vide [src/components/WeekView.jsx] — corrigé : `aria-live="polite"` ajouté aux paragraphes `week-view__loading` et `week-view__empty`.
- [x] [Review][Defer] Chargement intégral de `dayTemplates`/`timeBlocks`/`categories` sans borne — deferred, pre-existing (même pattern que `TodayView`/`PlanningView`).
- [x] [Review][Defer] Aucune gestion d'erreur/boundary sur le rejet d'un `useLiveQuery` — deferred, pre-existing, systémique à toute l'app.
- [x] [Review][Reject — vérifié] Validation `parseISODate` sur date malformée — non atteignable dans le périmètre de cette story (déjà vérifié en Round 1).
- [x] [Review][Reject — vérifié] Tri fragile de `sortByStartTime` — non atteignable, `startTime` vient toujours d'un `<input type="time">` (déjà vérifié en Round 1, cf. précédent story 3.2).
- [x] [Review][Reject — vérifié] `plannedDaysByDate` écraserait un doublon de date — impossible : `plannedDays.date` est un index **unique** (`&date`) depuis le schéma Dexie v7 (`src/db.js:74`).
- [x] [Review][Reject — vérifié] `dayTemplateId` jamais assigné sur un `PlannedDay` — impossible : `upsertPlannedDay` (`PlanningView.jsx:87-88`) garde `if (!dayTemplateId) return` avant toute écriture.
- [x] [Review][Reject — vérifié] Blocs horaires orphelins d'un modèle supprimé — non atteignable : `ConfigurationView.jsx` n'expose aucune fonctionnalité de suppression de modèle de journée.
- [x] [Review][Reject] Incohérence de style de test `.click()` vs `fireEvent.click` — vérifié faux : chaque fichier de test est cohérent avec sa propre convention préexistante (`App.test.jsx` utilise `.click()` partout, `WeekView.test.jsx` utilise `fireEvent.click` partout).
- [x] [Review][Reject] Absence de navigation semaine précédente/suivante — hors périmètre : l'AC ne demande que la semaine courante.
- [x] [Review][Reject] Grille d'impression à 2 colonnes (dernière ligne inégale pour 7 jours) — inhérent à une semaine de 7 jours, choix déjà délibéré du Round 1 (« déployer la grille sur toute la largeur »).
- [x] [Review][Reject] Absence de `useMemo` sur les maps dérivées — sur-ingénierie au regard du volume de données réel de l'app (mono-utilisateur, local-first).
- [x] [Review][Reject] Ordre des clés `semaine` incohérent entre les maps `hashByView`/`titlesByView`/boutons de nav — sans effet fonctionnel (l'ordre des clés d'un objet JS n'affecte pas le lookup), pattern déjà présent avant cette story.
- [x] [Review][Reject] `window.print()` pourrait lever une exception — non pertinent pour le contexte de déploiement réel (PWA installée sur l'appareil de l'utilisateur, pas d'iframe restreinte).
- [x] [Review][Reject] Recalcul de « today » sans mémoïsation — doublon du finding déjà différé « Données obsolètes si l'application reste ouverte » ci-dessus.
- [x] [Review][Reject] Locale `fr-FR` codée en dur — cohérent avec le reste de l'app, i18n hors périmètre.

## 🛠 Developer Context & Guardrails

### Technical & Architecture Requirements (MUST FOLLOW)
1. **Local-First (AD-1) & Dates (AD-6) :** Les requêtes se font via `useLiveQuery` sur Dexie. Pour les calculs de la semaine courante (du Lundi au Dimanche), utilisez impérativement l'API native `Intl.DateTimeFormat('en-CA')` pour assurer le format ISO `YYYY-MM-DD` dans le fuseau local, sans recourir à des dépendances telles que moment.js ou date-fns.
2. **Fonctionnalité d'Export (PDF/Impression) :** N'ajoutez **aucune librairie de génération PDF** (respect du poids de l'app et limitation des dépendances). Utilisez simplement `window.print()` et gérez le rendu propre via CSS `@media print`.
3. **PWA Responsive (NFR1) :** Assurez-vous que la vue "Semaine" s'affiche correctement sur Mobile (défilement vertical ou carrousel) et Tablette/Bureau (vue en colonnes ou grille).
4. **Charte UX (UX-DR1) :** Respectez les couleurs Zen (background: #F9FAFB, text: #1F2937, accent: #6366F1). Conservez les hitboxes d'au moins 44x44px pour le bouton d'export.

### Existing Code Patterns to Preserve
- **Routage :** Le routage dans `App.jsx` est basé sur le hash (`#/`). Assurez-vous d'étendre la logique existante (`viewFromHash`, `navigate`, et le dictionnaire `titlesByView`) de manière cohérente pour inclure la vue `Semaine`.
- **Lecture de la base :** Inspectez comment `TodayView.jsx` ou `PlanningView.jsx` utilisent `useLiveQuery` pour charger les structures de journées. Ne réinventez pas les appels Dexie, réutilisez ou inspirez-vous de ces modèles.
- **Fichiers concernés :** 
  - Update `src/App.jsx`
  - Update `src/App.css` (éventuellement)
  - Create `src/components/WeekView.jsx`
  - Create `src/components/WeekView.css`
  - Create `src/components/WeekView.test.jsx`

### Testing Requirements (AD-8: Test-First / ATDD)
- Mocker `window.print` dans les tests (Vitest `vi.spyOn(window, 'print').mockImplementation(() => {})`) pour vérifier que le bouton appelle bien la fonctionnalité système.
- Tester le composant `WeekView` avec RTL (`@testing-library/react`) et s'assurer qu'il gère élégamment l'état vide (aucune journée planifiée cette semaine).

## 📚 Project Context Reference
- **Système de couleurs "Zen" :** background: #F9FAFB, accent: #6366F1, success: #10B981.
- Aucune story ne doit deviner des solutions en cas d'ambiguïté. Demandez une clarification si besoin.
- Toujours utiliser `crypto.randomUUID()` s'il faut générer des IDs, mais cela ne devrait pas être nécessaire ici car c'est une vue en lecture (hors export).

---

## 🤖 Dev Agent Record

### Implementation Plan
Cycle red-green-refactor suivi tâche par tâche :
1. **Utilitaire de dates** (`src/services/weekRange.js`) extrait de la logique déjà présente dans `PlanningView.jsx` (Lundi→Dimanche), rendu testable en isolation et fondé sur `Intl.DateTimeFormat('en-CA')` (AD-6, format ISO local sans dérive UTC).
2. **Composant `WeekView`** en lecture seule s'appuyant sur `useLiveQuery` (AD-1). Requête bornée `db.plannedDays.where('date').between(mondayISO, sundayISO, true, true)`. Modèles, plages horaires, catégories et tâches planifiées chargés puis filtrés en mémoire — comme `TodayView` — pour éviter une `useLiveQuery` chaînée au timing fragile.
3. **Export** : `window.print()` uniquement (aucune lib PDF ajoutée), rendu papier/PDF piloté par `@media print`.
4. **Navigation** : onglet « Semaine » ajouté dans `App.jsx` (route `#/semaine`, `viewFromHash`/`navigate`/`titlesByView` étendus de façon cohérente).

### Completion Notes
- **AC couvertes** : onglet « Semaine » affichant la synthèse des 7 jours (Lundi→Dimanche) de la semaine courante + bouton « Exporter » déclenchant l'impression système (FR12).
- **Tests** : 14 nouveaux cas (7 `weekRange.test.js`, 6 `WeekView.test.jsx`, 1 routage `App.test.jsx`). Suite complète verte : **116/116**. Lint oxlint : 0. Build Vite : OK.
- **État vide** géré élégamment (message d'invitation + « Aucune journée planifiée » par jour).
- **Aucune nouvelle dépendance NPM** ajoutée.
- ⚠️ **Vérification manuelle requise (PO/Testeur)** : le rendu réel de `window.print()` / export PDF, la mise en page `@media print` et le responsive Mobile/Tablette/Bureau ne sont pas simulables sous `jsdom`. À valider dans un navigateur réel (cf. runbook navigateur — action item rétro Epic 3).

### File List
- **Create** `src/services/weekRange.js`
- **Create** `src/services/weekRange.test.js`
- **Create** `src/components/WeekView.jsx`
- **Create** `src/components/WeekView.css`
- **Create** `src/components/WeekView.test.jsx`
- **Update** `src/App.jsx`
- **Update** `src/App.test.jsx`

### Change Log
- 2026-07-06 : Implémentation Story 4.1 « Vue Semaine et Export » — vue de synthèse hebdomadaire en lecture seule (useLiveQuery/Dexie), export via `window.print()` + CSS `@media print`, onglet de navigation `#/semaine`, utilitaire de dates partagé. 14 tests ajoutés, suite 116/116 verte.
- 2026-07-06 : Application des patches de revue de code — tâches sans plage horaire affichées (au lieu de masquées), race condition de chargement corrigée (5 `useLiveQuery` attendues), requête `plannedTasks` bornée à la semaine affichée (mémoire + O(N²)), suppression d'un formateur de date dupliqué, état hover sur le bouton Export, contraste renforcé en impression. 3 findings vérifiés sans correction nécessaire (DST, tri des heures, garde date malformée — non atteignables dans le périmètre de cette story). 1 test ajouté, suite 117/117 verte, lint 0, build OK.
- 2026-07-07 : Round 2 de revue (Blind Hunter, Edge Case Hunter, Acceptance Auditor — auditeur conformité : 0 finding). 3 patches (tests en-tête de semaine et `timeBlockId` étranger, `aria-live` sur les états chargement/vide), 2 findings différés (chargement intégral des tables de config, absence de gestion d'erreur `useLiveQuery` — systémiques, pré-existants), 12 findings rejetés après vérification (non atteignables dans le code livré ou hors périmètre de l'AC). 2 tests ajoutés, suite 119/119 verte, lint 0, build OK.

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created

## Suggested Review Order

**Calcul de la semaine (utilitaire partagé)**

- Point d'entrée : bornes lundi→dimanche dérivées d'une seule date ISO, sans dépendance tierce (AD-6).
  [`weekRange.js:36`](../../src/services/weekRange.js#L36)

- Le dimanche est rattaché à la semaine qui s'achève, pas à celle qui commence.
  [`weekRange.js:29`](../../src/services/weekRange.js#L29)

- Arithmétique calendaire (`setDate`/`getDate`), pas de millisecondes : immunise contre les bascules DST.
  [`weekRange.js:21`](../../src/services/weekRange.js#L21)

**Chargement des données et correction de la race condition (finding review)**

- Les 5 `useLiveQuery` n'ont plus de valeur par défaut : `isLoading` attend qu'elles résolvent toutes, plus de flash "Modèle supprimé".
  [`WeekView.jsx:29`](../../src/components/WeekView.jsx#L29)

- `plannedTasks` est bornée aux `plannedDayId` de la semaine affichée (`anyOf`) au lieu de tout l'historique des tâches.
  [`WeekView.jsx:35`](../../src/components/WeekView.jsx#L35)

- Tâches groupées par jour une seule fois ; chaque bloc filtre sur `dayTasks` (borné) au lieu de la liste complète.
  [`WeekView.jsx:64`](../../src/components/WeekView.jsx#L64)

**Rendu et tâches sans plage horaire (finding review)**

- Tâches dont le `timeBlockId` ne correspond à aucun bloc du jour : affichées séparément au lieu d'être masquées.
  [`WeekView.jsx:106`](../../src/components/WeekView.jsx#L106)

- Section « Tâches sans plage horaire », même principe que l'orphelinage dans `TodayView`.
  [`WeekView.jsx:152`](../../src/components/WeekView.jsx#L152)

**Intégration navigation**

- Nouvel onglet « Semaine » branché sur le routeur hash existant (`viewFromHash`/`navigate`/`titlesByView`).
  [`App.jsx:187`](../../src/App.jsx#L187)

**Impression et accessibilité (findings review)**

- État hover ajouté sur le bouton d'export, absent jusqu'ici.
  [`WeekView.css:36`](../../src/components/WeekView.css#L36)

- Contraste renforcé en impression : le texte accent/secondaire repasse en couleur principale.
  [`WeekView.css:202`](../../src/components/WeekView.css#L202)

- `aria-live="polite"` sur les états chargement/vide.
  [`WeekView.jsx:83`](../../src/components/WeekView.jsx#L83)

**Tests (périphériques)**

- Tests unitaires du calcul de semaine (7 cas : bornes, franchissement mois/année, DST implicite).
  [`weekRange.test.js:1`](../../src/services/weekRange.test.js#L1)

- Tests du composant : synthèse, état vide, borne Dexie, export, tâches sans plage horaire, `timeBlockId` étranger, en-tête.
  [`WeekView.test.jsx:1`](../../src/components/WeekView.test.jsx#L1)

- Test de routage vers l'onglet Semaine.
  [`App.test.jsx:71`](../../src/App.test.jsx#L71)
