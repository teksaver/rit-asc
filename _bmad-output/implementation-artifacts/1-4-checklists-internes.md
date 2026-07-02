---
baseline_commit: a7a3690
---

# Story 1.4: Checklists internes (Prérequis)

Status: review

## Story

As a Utilisateur,
I want pouvoir ajouter une liste de sous-étapes textuelles à une tâche,
So that je n'oublie pas les prérequis nécessaires pour accomplir cette tâche.

## Acceptance Criteria

1. **Given** je consulte les détails d'une tâche
   **When** j'ajoute un élément textuel de checklist
   **Then** cet élément s'affiche sous la tâche avec sa propre case à cocher
   **And** je peux cocher indépendamment chaque élément de la checklist.

## Tasks / Subtasks

- [x] Task 1: Modèle de données checklist (AC: 1)
  - [x] Ajouter un champ `checklist` (tableau `{ id, text, isCompleted }`) aux tâches créées par `ProgressiveInput` — aucun changement de schéma Dexie versionné requis (AD-1).
  - [x] Gérer sans erreur les tâches existantes sans `checklist` via un fallback `task.checklist ?? []`.
- [x] Task 2: Ajout d'éléments de checklist dans le panneau de détails (AC: 1)
  - [x] Ajouter dans `TaskEnrichment` une section "Checklist" avec un formulaire (champ texte + bouton "Ajouter") créant un nouvel item et le persistant dans Dexie via `db.tasks.update`.
  - [x] Générer les identifiants avec `crypto.randomUUID()` ; ignorer les soumissions vides ; conserver les items existants lors de l'ajout.
- [x] Task 3: Affichage et cochage indépendant dans TaskCard (AC: 1)
  - [x] Afficher les éléments de la checklist sous la tâche parente dans `TaskCard`, chacun avec sa propre case à cocher native (`<input type="checkbox">` dans un `<label>`, cible tactile ≥44px).
  - [x] Permettre de cocher/décocher chaque élément indépendamment avec persistance immédiate dans Dexie (pas de bouton "Sauvegarder").
  - [x] Empêcher les interactions avec la checklist (et plus généralement tout élément interactif de la carte) de déclencher le geste de swipe ou le statut de la tâche parente.
- [x] Task 4: Tests (AC: 1)
  - [x] Tests unitaires `TaskEnrichment` (ajout d'un item, ajout sans écraser les items existants, item vide ignoré).
  - [x] Tests `TaskCard` (affichage des cases à cocher par item, cochage indépendant, non-interférence avec le statut de la tâche parente, absence de section si checklist vide).

## Developer Context & Guardrails

### Technical Requirements

- **Checklist Structure**: Chaque tâche dans Dexie doit pouvoir contenir un champ `checklist` (un tableau d'objets, ex: `[{ id: '...', text: '...', isCompleted: false }]`).
- **Création de sous-tâche**: Le panneau de détails/enrichissement de la tâche doit proposer un champ texte persistant pour ajouter rapidement de nouvelles sous-tâches à la checklist.
- **Affichage**: Les éléments de la checklist doivent s'afficher sous la tâche parente (dans `TaskCard` ou `TaskEnrichment`).
- **Interaction**: L'utilisateur doit pouvoir cocher/décocher chaque sous-tâche. Ces actions doivent persister dans Dexie en temps réel sans nécessiter de bouton "Sauvegarder". L'interface doit être accessible au clavier (`role="checkbox"`, `tabIndex={0}`, etc).

### Architecture Compliance

- **Schéma Dexie (`src/db.js`)**: Aucune modification du schéma v3 (pas de `db.version(4)`) n'est requise si le champ `checklist` n'a pas besoin d'être indexé pour des recherches. Le champ peut simplement être ajouté aux objets insérés/mis à jour dans la table `tasks`. (Respect de la Règle AD-1 : "Checklists stockées en tant que structure JSON simple dans la tâche").
- **Identifiants UUID v4**: Utilisez `crypto.randomUUID()` pour générer les identifiants uniques de chaque élément de la checklist.

### UX & Design System

- **Esthétique Zen**: Les champs d'ajout et les cases à cocher des checklists doivent s'intégrer harmonieusement (pas de bordures agressives, feedback visuel doux).
- **Accessibilité**: Cible tactile d'au moins 44x44px (NFR5) et support du clavier.

### Existing Code Modifications

- **`src/components/TaskCard.jsx`** ou **`src/components/TaskEnrichment.jsx`**:
  - **Actuel**: `TaskCard` affiche le titre, la checkbox principale, les tags, et ouvre `TaskEnrichment` contenant les priorités et catégories.
  - **Changement**: Décider de l'emplacement optimal pour afficher et gérer la checklist (soit directement dans la `TaskCard` quand elle est "ouverte", soit dans `TaskEnrichment`). Ajouter la gestion du tableau `task.checklist`. Les mutations sur `task.checklist` doivent appeler `db.tasks.update(task.id, { checklist: nouvelleChecklist })`. 
  - **Attention**: S'assurer que le pointer event de swipe-to-edit ne rentre pas en conflit avec les interactions sur les éléments de la checklist.

### Previous Story Intelligence

- **Accessibilité des boutons**: La Story 1.3 a montré que l'utilisation d'éléments natifs `<button>` au lieu de `div` avec `role` simplifie grandement l'accessibilité au clavier. Pour les checkboxes de la checklist, privilégiez `<input type="checkbox">` natifs ou calquez le modèle de `TaskCard` mais assurez l'a11y.
- **Swipe Interactions**: La Story 1.3 a introduit un `handlePointerDown` sur `TaskCard`. Toute interaction (clic, saisie de texte) sur la checklist doit prévenir le déclenchement non désiré du swipe. Pensez à utiliser `event.stopPropagation()` sur les champs texte ou les boutons de la checklist.

### Git Intelligence Summary

- Le commit `a7a3690` a implémenté `TaskEnrichment`. Le code récent montre une forte séparation des responsabilités. L'intégration de la checklist devrait suivre ce même modèle.

### Testing Requirements

- Ajouter des tests unitaires pour l'ajout, le cochage et décochage d'items dans une checklist.
- Assurer que les clics dans la zone checklist n'interfèrent pas accidentellement avec le statut de la tâche parente ni avec le geste de swipe.

## Final Status Update

Ultimate context engine analysis completed - comprehensive developer guide created

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npx vitest run` — 4 fichiers, 22 tests, tous passants.
- `npx oxlint` — aucune erreur/avertissement.
- Vérification manuelle en navigateur (Vite dev server + Playwright headless) : ajout de deux items de checklist, cochage indépendant d'un item, statut de la tâche parente inchangé, aucune erreur console.

### Completion Notes List

- `task.checklist` (tableau `{ id, text, isCompleted }`) est géré sans migration de schéma Dexie (champ non indexé, conforme à AD-1) ; `ProgressiveInput` initialisait déjà ce champ à `[]` à la création d'une tâche.
- `TaskEnrichment` : nouvelle section "Checklist" avec formulaire (`<form onSubmit>`, cohérent avec le pattern déjà utilisé pour les catégories) qui ajoute un item à la suite des items existants, ignore les soumissions vides, et vide le champ après ajout.
- `TaskCard` : les items de checklist sont affichés en permanence sous la tâche (pas seulement quand le panneau de détails est ouvert), chacun avec un `<input type="checkbox">` natif dans un `<label>` pour une cible tactile confortable ; le cochage persiste immédiatement via `db.tasks.update`.
- **Bug découvert et corrigé pendant la vérification navigateur** : les correctifs de revue (non commités) de la Story 1.3 avaient introduit `event.currentTarget.setPointerCapture(...)` sur la `<li>` de `TaskCard`, ce qui interceptait tous les clics réels (souris/tactile) sur les éléments interactifs de la carte (case à cocher principale, bouton d'édition, et désormais les cases de checklist) — invisible en tests unitaires car `fireEvent.click` de jsdom ne simule pas le retargeting du pointer capture natif. Correctif : la capture de pointeur et le suivi du swipe ne s'activent plus quand le `pointerdown` cible un élément interactif (`button, input, a, label, [role="checkbox"], [role="button"]`), ce qui laisse les clics natifs remonter normalement tout en préservant le geste de swipe sur la carte.
- Interactions checklist protégées du geste de swipe via `stopPropagation` sur les conteneurs (`task-card__checklist` et le formulaire d'ajout dans `TaskEnrichment`).

### File List

- `src/components/TaskCard.jsx` (modifié)
- `src/components/TaskCard.css` (modifié)
- `src/components/TaskCard.test.jsx` (modifié)
- `src/components/TaskEnrichment.jsx` (modifié)
- `src/components/TaskEnrichment.css` (modifié)
- `src/components/TaskEnrichment.test.jsx` (modifié)

## Change Log

- 2026-07-02 — Implémentation complète de la Story 1.4 : ajout, affichage et cochage indépendant des éléments de checklist (`TaskEnrichment` pour l'ajout, `TaskCard` pour l'affichage/cochage), sans migration de schéma Dexie. Correction d'une régression de capture de pointeur (héritée des correctifs non commités de la Story 1.3) qui bloquait les clics réels sur les éléments interactifs de la carte. Tests unitaires, lint et vérification navigateur validés. Statut passé à "review".
