---
epic: 4
story: 1
id: 4.1
status: review
title: Vue Semaine et Export
baseline_commit: 9374d782acddf9bf18bf6f1ab7c928ec82e3eadf
---

# Story 4.1: Vue Semaine et Export

**Status:** review
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

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created
