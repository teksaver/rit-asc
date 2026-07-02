---
baseline_commit: 3e751a98c333d062bb4268db3302875c926bb7be
---

# Story 1.3: Enrichissement des tâches (Priorité et Catégorie)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Utilisateur,
I want pouvoir modifier une tâche du Dépôt pour lui ajouter une catégorie et un niveau de priorité,
So that je prépare la tâche pour qu'elle puisse être planifiée dans ma semaine.

## Acceptance Criteria

1. **Given** j'ai une tâche dans mon Dépôt
   **When** j'ouvre ses détails (ex: via un swipe vers la droite ou un bouton)
   **Then** je peux créer/sélectionner une catégorie (FR6) et choisir une priorité parmi les 3 niveaux (Non négociable, Reportable, Pas obligé)
   **And** la carte de la tâche (Task Card) se met à jour en affichant ces métadonnées sous forme de tags (UX-DR2).

## Tasks / Subtasks

- [x] Task 1: Schéma Dexie v3 — table `categories` (AC: 1)
  - [x] Ajouter `db.version(3).stores(...)` avec la table `categories: 'id, name'` (id UUID v4, name, color en champ non indexé).
  - [x] Conserver `categoryId` sur `tasks` (déjà présent depuis la v2).
- [x] Task 2: Composant d'enrichissement (catégorie + priorité) (AC: 1)
  - [x] Créer `TaskEnrichment` : sélection d'une catégorie existante (chips) ou création à la volée (`crypto.randomUUID()`, couleur pastel auto-assignée).
  - [x] 3 pastilles de priorité (Non négociable/must, Reportable/should, Vraiment pas obligé/could) — "could" présélectionné par défaut si aucune priorité existante.
  - [x] Accessible clavier (chips/pastilles activables via Enter/Espace, focus visible) — implémentés en `<button>` natifs, focusables et activables au clavier par défaut.
- [x] Task 3: Intégration dans TaskCard (AC: 1)
  - [x] Ajouter un bouton "modifier" visible (fallback desktop) + geste de swipe vers la droite pour ouvrir le panneau d'enrichissement.
  - [x] Ne pas casser le toggle de la case à cocher existante ni son accessibilité.
  - [x] Afficher les tags (catégorie, priorité) sous forme de pilules discrètes grisées quand renseignés.
- [x] Task 4: Tests (AC: 1)
  - [x] Test schéma Dexie `categories` (`src/db.test.js`).
  - [x] Tests unitaires `TaskEnrichment` (sélection catégorie existante, création à la volée, sélection priorité).
  - [x] Tests `TaskCard` (ouverture via bouton, via swipe, affichage des tags, non-régression du toggle checkbox).

## Developer Context & Guardrails

### Technical Requirements

- **Interaction UI** : Implémenter le swipe-to-edit vers la droite sur la `TaskCard` pour ouvrir le menu d'enrichissement (selon l'EXPERIENCE.md). Gérer un fallback (ex: bouton ou clic long) pour les utilisateurs Desktop (souris).
- **Enrichissement** : Créer un composant pour l'enrichissement (ex: modale douce ou extension de carte).
- **Priorité** : Gérer les 3 niveaux de priorité ("must": Non négociable, "should": Reportable, "could": Vraiment pas obligé). Le niveau par défaut devrait implicitement être "could" pour éviter toute pression.
- **Catégorie** : Permettre de sélectionner une catégorie existante ou d'en créer une nouvelle à la volée.

### Architecture Compliance

- **Dexie.js (`src/db.js`)** : Incrémenter la version de Dexie et ajouter la table `categories` respectant le schéma (`id` PK, `name`, `color`). Attention : les identifiants doivent être des UUID v4 (règle AD-1 & Conventions).
- **Relation Tâche-Catégorie** : La table `tasks` doit pouvoir stocker un `categoryId` référant à la catégorie.
- Continuer à utiliser strictement IndexedDB (local-first) et `useLiveQuery` pour garantir la réactivité sans latence.

### UX & Design System

- **Tags** : Les métadonnées (catégorie, priorité) sur `TaskCard` doivent apparaître sous forme de "pilules" (tags) discrètes et grisées (Design Guidelines).
- **Esthétique Zen** : Les catégories doivent utiliser des teintes pastel/douces (pas de rouge vif d'alerte).
- Les animations (ouverture du menu, apparition des tags) doivent être douces.

### Existing Code Modifications

- **`src/db.js`** :
  - **Actuel** : Définit les versions 1 et 2 avec la table `tasks`.
  - **Changement** : Créer une version 3 ajoutant la table `categories` et la relation sur `tasks`.
- **`src/components/TaskCard.jsx`** :
  - **Actuel** : Rendu basique (titre et checkbox) sans gestion du tactile.
  - **Changement** : Ajouter des écouteurs tactiles/pointeurs pour le swipe. Ajouter un bloc de tags affichant la catégorie et la priorité s'ils sont renseignés. Prendre soin de ne pas casser le toggle de la checkbox ni l'accessibilité actuelle.

### Previous Story Intelligence

- **Identifiants UUID v4** : La Story 1.1 a connu un correctif car elle n'utilisait pas d'UUID v4 par défaut. Lors de la création de catégories, utilisez `crypto.randomUUID()`.
- **Accessibilité** : La Story 1.1 a corrigé des rôles ARIA (`role="checkbox"`). Le nouveau menu d'enrichissement doit aussi être testable au clavier et lisible.

## Final Status Update

Ultimate context engine analysis completed - comprehensive developer guide created

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npm run test` (Vitest) — 4 fichiers, 16 tests, tous passants.
- `npm run build` (Vite) — build production OK.
- `npm run lint` (oxlint) — aucune erreur/avertissement.

### Completion Notes List

- Schéma Dexie passé en `version(3)` : ajout de la table `categories` (`id` UUID v4, `name`, `color` en champ non indexé), `categoryId` déjà présent sur `tasks` depuis la v2.
- Nouveau composant `TaskEnrichment` : chips de sélection des catégories existantes (via `useLiveQuery`), création à la volée d'une catégorie (dédoublonnage insensible à la casse, couleur pastel auto-assignée), 3 pastilles de priorité avec "Vraiment pas obligé" (could) présélectionné par défaut si aucune priorité n'est encore définie. Tout est en `<button>` natifs, donc accessible au clavier sans code additionnel.
- `TaskCard` étendu : bouton "Modifier la tâche" (icône `lucide-react`) togglant l'affichage de `TaskEnrichment`, geste de swipe vers la droite (pointer events, seuil 60px) ouvrant le même panneau, bloc de tags (catégorie + priorité) affiché uniquement si renseigné. Le toggle de la case à cocher et son accessibilité (`role="checkbox"`) sont inchangés.
- Tests ajoutés : schéma `categories`/relation `categoryId` (`src/db.test.js`), comportement complet de `TaskEnrichment` (défaut de priorité, persistance, création/déduplication de catégorie, sélection d'une catégorie existante), et `TaskCard` (non-régression du toggle, ouverture via bouton, ouverture via swipe, non-ouverture sur mouvement court, affichage/absence des tags).

### File List

- `src/db.js` (modifié)
- `src/db.test.js` (modifié)
- `src/components/TaskCard.jsx` (modifié)
- `src/components/TaskCard.css` (modifié)
- `src/components/TaskCard.test.jsx` (nouveau)
- `src/components/TaskEnrichment.jsx` (nouveau)
- `src/components/TaskEnrichment.css` (nouveau)
- `src/components/TaskEnrichment.test.jsx` (nouveau)

## Change Log

- 2026-07-02 — Implémentation complète de la Story 1.3 : schéma Dexie v3 (table `categories`), composant `TaskEnrichment` (catégorie + priorité), intégration dans `TaskCard` (bouton d'édition, swipe, tags). Tests unitaires, build et lint validés. Statut passé à "review".
