# Epic 4 Context: Vue d'Ensemble, Suggestions et Sauvegardes

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

L'utilisateur peut prendre du recul sur sa semaine avec une vue synthétique exportable, combler les temps morts via un moteur de suggestion contextuel, et sécuriser ses données par sauvegarde/restauration JSON. L'épic inclut aussi l'intégration PWA (installabilité, offline), la récupération sur base corrompue, le CI/CD GitHub Actions, et la fiabilisation des écritures contre les doubles soumissions.

## Stories

- Story 4.1: Vue Semaine et Export
- Story 4.2: Moteur de Suggestion (Le Bouton Magique)
- Story 4.3: Sécurité et Sauvegarde (Import/Export JSON)
- Story 4.4: Intégration PWA et Hors-ligne
- Story 4.5: Récupération d'une Base de Données Corrompue
- Story 4.6: Déploiement Continu (CI/CD GitHub Pages)
- Story 4.7: Fiabilisation des Écritures et Robustesse Tactile

## Requirements & Constraints

- Suggestion engine invoked per time block, filters inbox tasks by block category, prioritizes by task priority and checklist completion state.
- Weekly synthesis view with PDF/system print export.
- Full database export/import as JSON file (all Dexie tables serialized), accessible from Settings tab.
- PWA manifest and service worker via `vite-plugin-pwa` for installability and offline asset caching.
- Recovery screen on failed `db.open()` (schema migration abort, corrupted store) with a reset button and explicit data-loss warning; reset leads to fresh onboarding state.
- CI/CD: auto-build and deploy to GitHub Pages on merge to `main`; failed builds must not replace the current deployment.
- Every write path must include UI-side guard (`isBusy`/`isSubmitting`) AND a schema-level unique constraint to prevent duplicates from rapid submissions or multi-tab concurrency.
- Touch interactions (swipe-to-edit, drag-and-drop) must not block basic clicks or checkbox taps; minimum 44×44px hitboxes.
- The app runs entirely offline; IndexedDB is the single source of truth for all business data.

## Technical Decisions

- **Local-First (AD-1):** All business data persisted in Dexie.js/IndexedDB. LocalStorage reserved for non-critical UI prefs only. JSON export must serialize every Dexie table.
- **Write Concurrency (AD-7):** Every Dexie write requires an `isBusy` UI guard paired with a composite unique index (`&index`) defined at schema level.
- **Recoverable Migrations (AD-5):** Schema migrations are versioned and additive. Unique constraints and their data cleanup must live in separate consecutive versions (cleanup in N, `&index` in N+1). On `db.open()` failure, show recovery screen with reset.
- **Tasks are Timeless (AD-4):** `TASK` entity has no `duration`, `dueTime`, or `recurrence`. Time context lives only in `TIME_BLOCK` containers.
- **Manual Planning (AD-2):** No auto-generated future `PlannedDay` — planning is always an explicit duplication action.
- **Data Model:** `TASK` (id, title, status, priority, categoryId, plannedDayId, checklist), `CATEGORY` (id, name, color), `DAY_TEMPLATE` (id, name), `TIME_BLOCK` (id, dayTemplateId, categoryId, startTime, endTime), `PLANNED_DAY` (id, date, dayTemplateId). IDs are UUID v4; dates are `YYYY-MM-DD`.
- **Reactive UI:** State mutations via Dexie `useLiveQuery` hooks.
- **Deployment:** GitHub Pages via GitHub Actions workflow.
- **PWA Integration:** `vite-plugin-pwa` for manifest + service worker (deferred from earlier epics). Push notifications deferred to v2.

## UX & Interaction Patterns

- 4-tab navigation: Aujourd'hui, Semaine, Dépôt, Configuration.
- **Semaine tab:** Day-by-day weekly synthesis with an export button.
- **Configuration tab:** Day template manager, category manager, and JSON backup export/import.
- **Magic Button:** Ghost text "Que pourrais-je faire ?" appears in empty or partially-filled time blocks; triggers suggestion engine.
- **Palette Zen:** Soft pastel tones (Time Block backgrounds tinted by category color), white Task Cards with circular checkbox and discrete category pills, system sans-serif typography, smooth transitions.
- **Fast Input:** Enter key submits and clears field for next entry without losing focus.

## Cross-Story Dependencies

- Story 4.2 (Suggestion) depends on category classification (Story 1.3), priority state, and checklist completion data from the task model.
- Story 4.3 (JSON Backup) must serialize all Dexie stores; restore replaces the full database.
- Story 4.5 (Corruption Recovery) depends on the onboarding flow (Story 2.3) for the clean restart state after reset.
- Story 4.7 (Write Reliability) applies to all existing write operations across the entire codebase — must be retrofitted into earlier-wired forms and modals, not just new code.
- PWA integration (Story 4.4) and CI/CD (Story 4.6) are infrastructure stories with no functional data dependencies but enable distribution and delivery.
