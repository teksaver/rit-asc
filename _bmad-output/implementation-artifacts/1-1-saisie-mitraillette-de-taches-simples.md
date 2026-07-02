---
baseline_commit: NO_VCS
---

# Story 1.1: Saisie "Mitraillette" de Tâches Simples (Le Dépôt)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Utilisateur fatigué,
I want taper rapidement mes tâches dans un champ persistant et valider d'une touche,
so that je me vide l'esprit en quelques secondes sans friction.

## Acceptance Criteria

1. **Given** je suis sur la vue "Dépôt" (après initialisation du projet React/Vite AR1 et configuration de Dexie.js AR2)
   **When** je tape un texte et que j'appuie sur "Entrée"
   **Then** la tâche est sauvegardée immédiatement en base locale avec une transition douce (UX-DR5)
   **And** le champ reste actif, vidé, prêt à recevoir la tâche suivante.

## Tasks / Subtasks

- [x] Task 1: Initialisation de l'architecture de base (AC: 1)
  - [x] Créer un nouveau projet React avec Vite en mode Vanilla CSS.
  - [x] Nettoyer le template par défaut.
  - [x] Installer les dépendances nécessaires (`dexie`, `dexie-react-hooks`, `lucide-react` pour les icônes).
- [x] Task 2: Configuration de la base locale Dexie.js (AC: 1)
  - [x] Créer le fichier d'initialisation de Dexie (`src/db.js`).
  - [x] Définir le schéma de la base (Table `tasks` avec `++id, title, status, createdAt, category, priority`).
- [x] Task 3: Mise en place du Design System "Zen" (AC: 1)
  - [x] Configurer les variables CSS (Background: `#F9FAFB`, Surface: `#FFFFFF`, Accent: `#6366F1`, Success: `#10B981`, Text: `#1F2937`).
  - [x] Appliquer la typographie système sans-serif.
- [x] Task 4: Implémentation du Dépôt et du Progressive Input (AC: 1)
  - [x] Créer le layout principal de l'application (Mobile-first PWA struct).
  - [x] Créer le composant d'entrée "Progressive Input" avec focus persistant.
  - [x] Gérer l'événement 'Enter' pour ajouter dans Dexie et vider le champ instantanément.
- [x] Task 5: Affichage des Tâches et Micro-animations (AC: 1)
  - [x] Créer le composant "Task Card" (fond blanc, bordures douces, case à cocher circulaire).
  - [x] Mettre en place la liste réactive branchée sur Dexie (`useLiveQuery`).
  - [x] Ajouter l'animation d'apparition douce (fade-in/slide-up) lors de l'ajout (UX-DR5).

## Dev Notes

- **Architecture:** Il s'agit de la toute première Story. Le développeur **doit** initialiser le projet dans le répertoire de travail.
- **Base de données:** Utilisation stricte de Dexie.js (IndexedDB). Aucune API réseau, 100% hors-ligne.
- **UX/Design:** 
  - Ne pas utiliser de rouge "alerte". 
  - Boutons et hitboxes doivent faire minimum 44x44px. 
  - L'ambiance doit être très douce et épurée (bords arrondis de 16px sur les cartes).
- **Aesthetic Guidance:** Appliquez de subtiles ombres portées (très diffuses, 10% d'opacité) pour décoller la Task Card du fond de la page.

### Project Structure Notes

- Privilégier une structure claire: `src/components`, `src/db`, `src/styles`.
- Utiliser uniquement Vanilla CSS (`index.css` ou des fichiers `.css` dédiés importés). Pas de TailwindCSS.

### References

- [Source: planning-artifacts/architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md]
- [Source: planning-artifacts/ux-designs/ux-RouteIn-2026-07-02/DESIGN.md]
- [Source: planning-artifacts/ux-designs/ux-RouteIn-2026-07-02/EXPERIENCE.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npm run test` (Vitest) — 2 fichiers, 3 tests, tous passants.
- `npm run build` (Vite) — build production OK.
- `npm run lint` (oxlint) — aucune erreur/avertissement sur le code source.
- Vérification visuelle manuelle via Playwright headless (saisie de 2 tâches, cocher une tâche) — comportement conforme à l'AC1 et au Design System.

### Completion Notes List

- Projet React 19 + Vite 8 scaffoldé en Vanilla CSS (pas de TailwindCSS), template par défaut nettoyé (assets, App.css, icônes inutilisés supprimés).
- Dexie 4.x initialisé dans `src/db.js` avec la table `tasks` (`++id, title, status, createdAt, category, priority`), 100% local/offline, aucun appel réseau.
- Design tokens du DESIGN.md appliqués via variables CSS dans `src/styles/theme.css` (couleurs, radius, spacing, ombre de carte à 10% d'opacité) — pas de rouge d'alerte.
- Composant `ProgressiveInput` : champ persistant en bas d'écran, ajout en base Dexie sur "Entrée", champ vidé et refocus immédiatement, hitbox ≥44px, ignore les saisies vides/espaces.
- Composant `TaskList` branché sur `useLiveQuery` (Dexie) pour réactivité automatique, état vide géré avec message doux.
- Composant `TaskCard` : carte blanche à coins arrondis 16px, case à cocher circulaire (hitbox 44x44px), toggle de statut, animation d'apparition fade-in/slide-up (0.3s) à l'ajout.
- Tests unitaires ajoutés : schéma Dexie (`src/db.test.js`) et comportement du Progressive Input, y compris le cas de saisie vide ignorée (`src/components/ProgressiveInput.test.jsx`), exécutés avec Vitest + fake-indexeddb + Testing Library.
- Vérification manuelle en navigateur headless : saisie rapide de plusieurs tâches, persistance immédiate, champ vidé et refocus, cases à cocher fonctionnelles — conforme à AC1 et à l'esthétique "zen" attendue.

### File List

- `package.json`
- `.gitignore`
- `index.html`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/App.css`
- `src/index.css`
- `src/db.js`
- `src/db.test.js`
- `src/setupTests.js`
- `src/styles/theme.css`
- `src/components/ProgressiveInput.jsx`
- `src/components/ProgressiveInput.css`
- `src/components/ProgressiveInput.test.jsx`
- `src/components/TaskCard.jsx`
- `src/components/TaskCard.css`
- `src/components/TaskList.jsx`
- `src/components/TaskList.css`
- `public/favicon.svg` (conservé du template par défaut)

### Review Findings

- [x] [Review][Patch] Contradiction ID Generation — Architecture Spine exige UUID v4, modifier l'auto-increment `++id` pour utiliser des UUIDs v4.
- [x] [Review][Patch] Schéma DB incomplet et incorrect [`src/db.js`]
- [x] [Review][Patch] Valeur de statut invalide (`done` au lieu de `completed`) [`src/components/TaskCard.jsx`]
- [x] [Review][Patch] TaskList ne filtre pas sur le statut "Dépôt" (`inbox`) [`src/components/TaskList.jsx`]
- [x] [Review][Patch] Effacement de l'input non instantané ("Mitraillette" UX) [`src/components/ProgressiveInput.jsx`]
- [x] [Review][Patch] Unhandled Promise Rejections dans les Event Handlers [`src/components/ProgressiveInput.jsx`]
- [x] [Review][Patch] États de chargement et d'erreur manquants pour useLiveQuery [`src/components/TaskList.jsx`]
- [x] [Review][Patch] Tests potentiellement instables (Flaky Tests) [`src/components/ProgressiveInput.test.jsx`]
- [x] [Review][Patch] Conditions de course à la soumission (pas d'état désactivé) [`src/components/ProgressiveInput.jsx`]
- [x] [Review][Patch] Déficiences Accessibilité / ARIA [`src/components/TaskCard.jsx`]
- [x] [Review][Patch] Manquement de balise sémantique `<main>` [`src/App.jsx`]
- [x] [Review][Patch] Exports de modules inconsistants [`src/db.js`]
- [x] [Review][Defer] Ignorance des préférences utilisateur (Reduced Motion) [`src/components/TaskCard.css`] — deferred, pre-existing
- [x] [Review][Defer] CSS Reset incomplet et Viewport Units [`src/index.css`] — deferred, pre-existing
- [x] [Review][Defer] Missing Error Boundary et Graceful Degradation [`src/main.jsx`] — deferred, pre-existing

## Change Log

- 2026-07-02 — Implémentation complète de la Story 1.1 : scaffold React/Vite, Dexie.js, design system Zen, Progressive Input, Task Card réactive avec micro-animations. Tests unitaires, build et lint validés. Statut passé à "review".
- 2026-07-02 — Correction des 9 findings `[Review][Patch]` de la revue : `id` en UUID v4 (`crypto.randomUUID()`) au lieu de `++id`, schéma Dexie complété (`categoryId`, `plannedDayId`, `checklist`) et export unique de `db` (nommé) dans `src/db.js` ; vidage/refocus optimiste du champ, `try/catch` sur `db.tasks.add` et garde anti-course (ref `isSubmittingRef`) sans casser le flux "mitraillette" dans `src/components/ProgressiveInput.jsx` ; statut `completed` (plus jamais `done`) et case à cocher exposée en `role="checkbox"`/`aria-checked` dans `src/components/TaskCard.jsx` ; filtre `status === 'inbox'`, distinction chargement (`undefined`)/vide/erreur dans `src/components/TaskList.jsx` ; balise `<main>` sémantique dans `src/App.jsx` ; tests adaptés au nouveau schéma (`src/db.test.js`) et assertion de vidage instantané rendue synchrone (`src/components/ProgressiveInput.test.jsx`). `npm run test`, `npm run build` et `npm run lint` passent tous. Les 3 findings `[Review][Defer]` restent hors scope, inchangés.
