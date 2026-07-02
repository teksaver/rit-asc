# Epic 1 Context: L'Inbox et le "Vidage de tête" (Le Dépôt)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

This epic lets a tired user offload tasks from their mind instantly, with zero friction, and enrich them later with categories, priorities, and checklists. Task creation must require nothing but a name; every other field (category, priority, checklist) is optional and added on the user's own schedule. This is the foundational capture mechanism the rest of the app (planning, cycle-skipping, suggestions) builds on top of.

## Stories

- Story 1.1: Saisie "Mitraillette" de Tâches Simples (Le Dépôt)
- Story 1.2: Environnement de Test Local (Devcontainer & Docker-compose)
- Story 1.3: Enrichissement des tâches (Priorité et Catégorie)
- Story 1.4: Checklists internes (Prérequis)

## Requirements & Constraints

- Task creation requires only a single field (name/title); no other field is ever mandatory at creation time.
- The quick-capture input behaves in "mitraillette" (rapid-fire) mode: pressing Enter saves the task immediately and the field stays focused and empty, ready for the next entry.
- Enrichment (category, priority, checklist) can be added at creation or at any later time — never forced.
- Categories are free-form and user-defined (no fixed taxonomy).
- Priority has exactly 3 levels: Non négociable (must), Reportable (should), Vraiment pas obligé (could — this is the default, chosen to minimize pressure/guilt).
- Checklist items are simple text sub-steps inside a task, each independently checkable, used to track prerequisites (e.g., "buy paint" before "paint the room").
- Hitboxes (checkboxes, tap targets) must be at least 44x44px for touch accessibility.
- Text must be dark-on-light with sufficient contrast; support dynamic type sizing.
- The app must work fully offline (local-first); no network calls are involved in this epic's flows.
- Local dev environment must be reproducible via devcontainer/docker-compose, running Node.js/Vite and exposing the app on an accessible local port.

## Technical Decisions

- Stack: React 18.x + Vite 5.x, Vanilla CSS, Dexie.js 4.x over IndexedDB for all persistent business data (no backend/API).
- Single source of truth: all task/category writes go through Dexie.js; LocalStorage is reserved only for non-critical UI prefs (e.g., last open tab).
- UI reactivity: use Dexie's `useLiveQuery` so the UI redraws automatically on local data changes — no manual state syncing needed.
- Data conventions: IDs are UUID v4; dates are ISO-8601 (`YYYY-MM-DD`); checklist items are stored as a simple JSON array embedded in the task record.
- Naming: camelCase for DB properties, PascalCase for React components.
- Task entity shape (relevant fields): id, title, status (`inbox | planned | completed`), priority (`must | should | could`), categoryId (nullable FK), plannedDayId (nullable FK), checklist (JSON array). Category entity: id, name, color.
- Task status starts as `inbox` on creation and only changes when placed into a plan (out of scope for this epic, but the field exists from the start).

## UX & Interaction Patterns

- Visual style: "zen" palette — background `#F9FAFB`, surface white, accent indigo `#6366F1`, success sage `#10B981`; no red/alert color anywhere, including for empty or unenriched tasks.
- Task Card component: white rounded rectangle (16px radius), circular checkbox, metadata (category, priority) shown as discrete grey "pill" tags only when present.
- Progressive Input: a persistent text field (bottom bar or floating) for the mitraillette capture flow — type, hit Enter, task saves, field clears and stays focused.
- On task save, use a soft transition (fade-in/slide-up) rather than an abrupt UI change.
- Never show empty/required form fields (e.g., no date/time pickers) during quick capture — enrichment UI is a separate, later step.
- Checklist UI: show a progress counter on the task card (e.g., "0/2 étapes"); tapping expands the sub-list for in-place checking.
- Tone/microcopy: bienveillant (kind) language throughout — avoid words implying failure or lateness.

## Cross-Story Dependencies

- Story 1.2 (devcontainer/docker-compose) was inserted after Story 1.1 shipped — a backfilled dev-environment task, not a prerequisite Story 1.1 waited on. It standardizes local setup for Stories 1.3+ onward.
- Story 1.1 depends on the AR1/AR2 project scaffolding (React/Vite init, Dexie.js setup) being in place first.
- Stories 1.3 and 1.4 both operate on tasks created in Story 1.1's Inbox and extend the same Task Card / task detail UI, so their data model and card component should be designed together to avoid rework.
- Category creation (introduced in Story 1.3) is a dependency for Epic 2 (Time Blocks reference categories) and Epic 3 (cycle-skip logic matches tasks to categories) — category naming/color conventions set here should stay stable.
