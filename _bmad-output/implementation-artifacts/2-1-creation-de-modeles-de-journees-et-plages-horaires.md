---
epic: 2
story: 1
id: 2.1
status: done
title: Création de Modèles de Journées et Plages Horaires
baseline_commit: be1c824
---

# Story 2.1: Création de Modèles de Journées et Plages Horaires

Status: done

**Epic 2: La Structure du temps (Les Journées Types)**
L'utilisateur peut créer des routines via des Journées Types, structurer ses journées avec des Plages Horaires, et planifier sa semaine facilement.

## 📖 Story

As a Utilisateur,
I want créer des "Journées types" (ex: Télétravail) contenant des "Plages horaires" liées à mes catégories,
So that je définis des routines réutilisables qui structurent mon temps.

## ✅ Acceptance Criteria

1. **Given** je suis dans la vue Configuration
   **When** je crée un modèle de journée
   **Then** je peux y ajouter plusieurs plages horaires en définissant l'Heure de début, l'Heure de fin, et la Catégorie
   **And** les plages horaires s'affichent sous forme de conteneurs visuels (UX-DR3)
   **And** le système empêche les saisies invalides (heure de fin identique à l'heure de début) et signale les chevauchements de plages horaires, y compris pour les plages traversant minuit (ex: 22:00–01:00).

## Tasks / Subtasks

- [x] Task 1: Modèles de données Dexie (AC: 1)
  - [x] Ajouter `db.version(4)` dans `src/db.js` avec les tables `dayTemplates: 'id, name'` et `timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime'`.
- [x] Task 2: Vue Configuration — gestion des Journées Types (AC: 1)
  - [x] Créer `ConfigurationView` (liste des `dayTemplates` via `useLiveQuery`, formulaire de création par nom, sélection d'un modèle pour voir/éditer ses plages).
  - [x] Câbler `ConfigurationView` dans `App.jsx` avec une navigation simple entre la vue "Dépôt" et la vue "Configuration".
- [x] Task 3: Gestion des Plages Horaires (Time Blocks) (AC: 1)
  - [x] Formulaire d'ajout d'une plage horaire (heure de début, heure de fin, catégorie) pour le modèle de journée sélectionné, avec protection `isSubmitting`/`try-catch` contre les doublons.
  - [x] Afficher les plages horaires sous forme de conteneurs visuels teintés selon leur catégorie (bords arrondis 16px, ombre douce).
  - [x] Valider que l'heure de début et l'heure de fin ne sont pas identiques (durée nulle) ; bloquer et afficher une erreur sinon. Les plages traversant minuit (heure de fin < heure de début) sont autorisées.
  - [x] Détecter les chevauchements avec les plages horaires existantes du même modèle de journée, y compris pour les plages traversant minuit ; bloquer et afficher une erreur sinon.
- [x] Task 4: Tests (AC: 1)
  - [x] Tests `db.test.js` pour le schéma des tables `dayTemplates` et `timeBlocks`.
  - [x] Tests `ConfigurationView` : création d'un modèle de journée, ajout d'une plage horaire valide, rejet d'une plage horaire mal ordonnée, rejet d'un chevauchement.

## 🛠️ Developer Context & Guardrails

### Technical Requirements
- **Local-First / PWA**: Toute l'application est exécutée côté client sans backend. 
- **Persistance**: Les données doivent être sauvegardées localement via IndexedDB en utilisant **Dexie.js**. Pas de LocalStorage pour les données métiers, uniquement pour de l'état d'interface (si nécessaire).
- **Entités Métier**:
  - `DAY_TEMPLATE`: Doit contenir un `id` (UUID v4) et un `name`.
  - `TIME_BLOCK`: Doit contenir un `id` (UUID v4), `dayTemplateId` (FK), `categoryId` (FK), `startTime` (format "HH:mm"), `endTime` (format "HH:mm").
- **Génération d'ID**: Utilisez `crypto.randomUUID()` pour les identifiants uniques.
- **Réactivité**: Utilisez `useLiveQuery` de `dexie-react-hooks` pour relier l'état IndexedDB aux composants React.
- **Développement Vue Configuration**: Créer ou mettre à jour la vue de Configuration (`ConfigurationView` ou équivalent) pour gérer les modèles de journées et leurs plages.

### Architecture Compliance
- **Pas de génération future automatique (AD-2)**: Le système ne doit pas créer de `PlannedDay` à cette étape. On se concentre uniquement sur la création des `DAY_TEMPLATE` et `TIME_BLOCK` (templates).
- **Tâches minimalistes (AD-4)**: Bien que cette story ne manipule pas de tâches, gardez à l'esprit que la structure temporelle est portée exclusivement par le `TIME_BLOCK`. L'entité `TASK` ne portera pas de champs de durée ou d'heure limite.
- **Règles de nommage**: `camelCase` pour les propriétés en BDD (ex: `dayTemplateId`), `PascalCase` pour les composants React.
- **Modèles de base de données**: Implémenter les nouvelles tables `dayTemplates` et `timeBlocks` dans la configuration Dexie (`src/db.js`).

### UX & Design System (Zen)
- **Couleurs**: Utiliser les couleurs définies:
  - `background`: "#F9FAFB"
  - `surface`: "#FFFFFF"
  - `accent`: "#6366F1"
  - `muted`: "#E5E7EB"
- **Formes & Élévation**:
  - Les conteneurs "Time Block" (Plage horaire) doivent avoir un fond légèrement teinté selon leur catégorie.
  - Utilisez des bords arrondis généreux (`16px` pour les cartes).
  - Évitez les ombres portées intenses (seulement 10% d'opacité avec grand flou pour détacher la surface du fond).
- **Interaction (Micro-animations)**:
  - Ajoutez des animations douces lors de l'ajout/suppression d'une plage horaire (ex: fade-in, slide-up).

### Previous Story Intelligence (from Epic 1 Retro)
- **Conflits de Pointeurs (Pointer Events) & Robustesse Tactile**: Attention si des composants interactifs cohabitent avec des formulaires. Assurez-vous d'utiliser `event.stopPropagation()` ou de gérer proprement le `setPointerCapture` pour ne pas intercepter les clics normaux sur les inputs et boutons.
- **Fiabilité des mutations Dexie**: Toute mutation de base de données (ajout/édition de plage horaire ou modèle) DOIT être protégée par un bloc `try/catch` avec gestion de l'état `isSubmitting` pour empêcher les conditions de course (race conditions) et éviter de créer des doublons silencieux en cas de multi-clics.
- **Accessibilité**: Privilégiez les éléments HTML natifs (ex: `<button>`, `<input type="time">`) pour s'assurer d'une navigation au clavier propre et de comportements standards. Cibles tactiles ≥44x44px obligatoires.

### Latest Tech Information
- L'application est basée sur **React 19** et **Vite 8**. Utilisez les hooks React modernes (ex: `useId` si pertinent) et tirez parti de l'écosystème Vite pour des imports de CSS optimisés (Vanilla CSS modules).
- **Dexie.js v4**: Profitez des dernières simplifications d'API de Dexie v4 si applicables.

### Project Context Reference
- Reportez-vous à `_bmad-output/planning-artifacts/architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md` pour le schéma complet.
- Ne créez aucune récurrence infinie. Les données saisies ici sont juste des "modèles" statiques qui seront par la suite instanciés dans Story 2.2.

---
**Status Note**: Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npx vitest run` — 5 fichiers, 29 tests, tous passants (dont 7 nouveaux tests `db.test.js`/`ConfigurationView.test.jsx` pour cette story).
- `npx oxlint` — aucune erreur/avertissement.
- Vérification manuelle en navigateur (Vite dev server + Playwright headless) : navigation Dépôt ↔ Configuration, création d'une journée type, ajout d'une plage horaire valide, rejet d'une plage avec heure de fin antérieure au début, rejet d'un chevauchement — aucune erreur console.

### Completion Notes List

- `src/db.js` : ajout de `db.version(4)` avec les tables `dayTemplates: 'id, name'` et `timeBlocks: 'id, dayTemplateId, categoryId, startTime, endTime'`, sans modification des tables existantes.
- `ConfigurationView` (nouveau composant) : gère la liste des journées types (création par nom, sélection), et pour la journée sélectionnée, la liste de ses plages horaires triées par heure de début ainsi qu'un formulaire d'ajout (heure de début/fin au format `HH:mm`, catégorie existante). Les plages horaires sont affichées en conteneurs arrondis (16px) teintés avec la couleur de leur catégorie.
- Validation des plages horaires effectuée avant toute écriture Dexie : heure de fin > heure de début (comparaison en minutes), et absence de chevauchement avec les plages existantes du même modèle de journée (`startA < endB && startB < endA`). Message d'erreur accessible (`role="alert"`) affiché sans mutation en cas de rejet.
- Mutations Dexie (`db.dayTemplates.add`, `db.timeBlocks.add`) entourées de `try/catch` avec état `isSubmitting` par formulaire pour éviter les doublons en cas de double-clic/soumission rapide, conformément aux guardrails de la story et à l'intelligence de l'Epic 1.
- Navigation ajoutée dans `App.jsx` (état `view` local, boutons "Dépôt"/"Configuration") — pas de librairie de routing ajoutée (aucune nouvelle dépendance NPM, conforme aux règles du projet).
- Conforme à AD-2 : aucune génération de `PlannedDay` — uniquement des `DAY_TEMPLATE`/`TIME_BLOCK` statiques créés dans cette story.
- Aucune nouvelle catégorie créée par cette story : les catégories existantes (créées via `TaskEnrichment`) sont réutilisées dans le sélecteur de plage horaire ; si aucune catégorie n'existe encore, l'utilisateur doit d'abord en créer une depuis la vue Dépôt.

### File List

- `src/db.js` (modifié)
- `src/db.test.js` (modifié)
- `src/App.jsx` (modifié)
- `src/App.css` (modifié)
- `src/App.test.jsx` (nouveau)
- `src/components/ConfigurationView.jsx` (nouveau puis patché)
- `src/components/ConfigurationView.css` (nouveau puis patché)
- `src/components/ConfigurationView.test.jsx` (nouveau puis patché)

## Change Log

- 2026-07-04 — Implémentation complète de la Story 2.1 : tables Dexie `dayTemplates`/`timeBlocks` (v4), nouvelle vue `ConfigurationView` (création de journées types, ajout de plages horaires avec validation d'ordre et de chevauchement, affichage en conteneurs teintés par catégorie), navigation Dépôt/Configuration dans `App.jsx`. Tests unitaires, lint et vérification navigateur validés. Statut passé à "review".
- 2026-07-04 — Application des correctifs issus de la revue : routeur basique via `window.location.hash` (préserve l'historique navigateur, `App.test.jsx` ajouté) ; plages horaires traversant minuit désormais autorisées avec détection de chevauchement adaptée (segments jour) ; `aria-pressed` remplacé par `aria-current="page"` sur la nav ; helper `cx()` pour la construction des classes CSS ; `:focus-visible` ajouté sur tous les boutons/champs interactifs de `App.css`/`ConfigurationView.css` ; fallback `@media (prefers-reduced-motion: reduce)` sur l'animation d'entrée des plages. Tests unitaires mis à jour (durée nulle, plage traversant minuit, chevauchement traversant minuit) et vérification manuelle en navigateur (Vite dev server + Playwright headless) sans erreur console. Finding "Animations de sortie manquantes" repassé en Defer (aucune suppression n'existe encore dans cette story).
- 2026-07-04 — 2e passe de revue (quick-dev, 3 sous-agents : Blind Hunter, Edge Case Hunter, Acceptance Auditor). Correctifs appliqués : ordre des règles CSS corrigé pour que `@media (prefers-reduced-motion: reduce)` s'applique réellement (la règle de base `animation` était déclarée après et l'annulait silencieusement, cascade CSS) ; message d'erreur ajouté quand le nom de journée type est vide/blanc (auparavant échec silencieux sans feedback) ; structure ARIA du `listbox` corrigée (`role="presentation"` sur le `<li>` interposé entre `listbox` et `option`) ; navigation évitée si le hash cible est déjà le hash courant (`App.jsx`) ; `App.test.jsx` fiabilisé (le `beforeEach` force désormais une vraie transition de hash avant chaque test pour ne plus dépendre de l'état d'historique laissé par les tests précédents). `npx vitest run` (34/34) et `npx oxlint` (aucune erreur) validés après correctifs.

### Review Findings

- [x] [Review][Patch] Navigation Browser-History (`App.jsx`) — Le basculement `useState` casse l'historique du navigateur. (Décision: Implémenter un routeur basique) — fixed: routeur basique via `window.location.hash` + écoute `hashchange` (aucune dépendance ajoutée).
- [x] [Review][Defer] Modification/Suppression de plages/modèles (`ConfigurationView.jsx`) — L'UI liste les éléments mais n'inclut pas d'édition/suppression. — deferred (Raison : Non prévu dans cette story)
- [x] [Review][Patch] Plages horaires sur deux jours (`ConfigurationView.jsx`) — La validation bloque les plages passant minuit. (Décision: Autoriser les plages traversant minuit et adapter la détection de chevauchement) — fixed: `toDaySegments`/`blocksOverlap` découpent une plage passant minuit en segments avant comparaison ; seule l'égalité stricte début=fin est désormais bloquée.
- [x] [Review][Patch] Mauvais usage de l'attribut ARIA (`App.jsx`) — fixed: remplacement de `aria-pressed` (sémantique "bouton bascule") par `aria-current="page"` (sémantique navigation).
- [x] [Review][Patch] Construction fragile des classes CSS (`App.jsx`) — fixed: extraction d'un helper `cx(...)` (filter+join) réutilisé dans `App.jsx` et `ConfigurationView.jsx`.
- [x] [Review][Patch] Absence d'états de focus clavier visibles (`:focus-visible`) — fixed: ajout de styles `:focus-visible` sur les boutons de nav/journées/soumission ; les champs du formulaire de plage utilisaient `:focus`, remplacés par `:focus-visible`.
- [x] [Review][Patch] Absence de fallback `prefers-reduced-motion` — fixed: `@media (prefers-reduced-motion: reduce)` désactive l'animation d'entrée des plages horaires dans `ConfigurationView.css`.
- [x] [Review][Defer] Animations de sortie manquantes — deferred (Raison : aucune fonctionnalité de suppression n'existe encore dans cette story ; rien à animer en sortie tant que la suppression de plages/modèles reste différée — cf. finding ci-dessus)
- [x] [Review][Defer] Implémentation PWA différée [`ARCHITECTURE-SPINE.md`] — deferred, pre-existing
- [x] [Review][Defer] Écart dans le rapport de readiness [`implementation-readiness-report-2026-07-04.md`] — deferred, pre-existing
- [x] [Review][Defer] Mises à jour de dépendances fantômes [`ARCHITECTURE-SPINE.md`] — deferred, pre-existing
- [x] [Review][Defer] Dette technique assumée dans Epic 2 [`epics.md`] — deferred, pre-existing
- [x] [Review][Defer] Logique domaine dans les composants UI [`ConfigurationView.jsx`] — deferred, pre-existing
- [x] [Review][Defer] Absence de fallback pour les API critiques (crypto.randomUUID) [`db.test.js`] — deferred, pre-existing
- [x] [Review][Patch] Bug de cascade CSS annulant `prefers-reduced-motion` (`ConfigurationView.css`) — La règle `@media (prefers-reduced-motion: reduce) { animation: none }` était déclarée AVANT la règle de base `.configuration-view__block { animation: ... }` ; à spécificité égale, la règle la plus tardive dans le fichier l'emportait, annulant silencieusement le fallback pour les utilisateurs "reduce motion" — fixed: règle de base déplacée avant le bloc `@media`.
- [x] [Review][Patch] Échec silencieux sur nom de journée type vide (`ConfigurationView.jsx`) — soumettre le formulaire avec un nom vide/blanc ne donnait aucun feedback à l'utilisateur — fixed: message d'erreur affiché (`role="alert"`).
- [x] [Review][Patch] Structure ARIA invalide du `listbox` (`ConfigurationView.jsx`) — le `<li>` sans rôle entre `<ul role="listbox">` et `<button role="option">` casse la relation attendue par certains lecteurs d'écran — fixed: `role="presentation"` ajouté sur le `<li>`.
- [x] [Review][Patch] Fragilité de test liée à l'historique du navigateur (`App.test.jsx`) — le `beforeEach` ne réinitialisait pas de façon déterministe l'état de `window.history`, rendant `history.back()` dépendant de l'ordre d'exécution des tests — fixed: le `beforeEach` force une double transition de hash pour garantir un état d'historique déterministe avant chaque test.
- [x] [Review][Patch] Entrées d'historique redondantes en recliquant l'onglet de navigation actif (`App.jsx`) — fixed: `navigate()` ne modifie plus le hash s'il est déjà égal à la cible.
- [x] [Review][Defer] Pas de protection contre les doublons de noms de journées types [`ConfigurationView.jsx`] — deferred (Raison : non requis par les AC de cette story)
- [x] [Review][Defer] Sélecteur de catégorie sans message d'aide quand la liste est vide [`ConfigurationView.jsx`] — deferred (Raison : non requis par les AC de cette story)
- [x] [Review][Defer] Race condition multi-onglets sur la détection de chevauchement [`ConfigurationView.jsx`] — deferred (Raison : lecture/écriture Dexie non transactionnelle ; hors scope pour un usage mono-utilisateur local)
- [x] [Review][Reject] Validation regex stricte HH:mm suggérée par un reviewer — rejetée : `<input type="time">` natif garantit déjà une valeur vide ou un format HH:mm valide.
- [x] [Review][Reject] Autoriser un bloc 00:00–00:00 pour représenter 24h — rejetée : contredit l'AC1 qui exige explicitement de bloquer une heure de fin identique à l'heure de début.
- [x] [Review][Reject] Correction du hash dans l'URL en cas de valeur inconnue — rejetée : pas de deep-linking externe pour cette PWA locale, le fallback silencieux vers "Dépôt" est suffisant.

## Suggested Review Order

**Schéma de données (Dexie)**

- Point d'entrée : nouvelles tables `dayTemplates`/`timeBlocks` en v4, base de tout le reste.
  [`db.js:18`](../../src/db.js#L18)

**Validation & détection de chevauchement**

- Découpe une plage traversant minuit en segments jour pour rendre la comparaison triviale.
  [`ConfigurationView.jsx:17`](../../src/components/ConfigurationView.jsx#L17)

- Comparaison de segments par intersection stricte de bornes.
  [`ConfigurationView.jsx:21`](../../src/components/ConfigurationView.jsx#L21)

- Combine les deux fonctions ci-dessus pour un chevauchement inter-jours correct.
  [`ConfigurationView.jsx:25`](../../src/components/ConfigurationView.jsx#L25)

- Bloque uniquement l'égalité stricte début=fin (AC1), autorise les plages traversant minuit.
  [`ConfigurationView.jsx:109`](../../src/components/ConfigurationView.jsx#L109)

- Vérifie le chevauchement contre les plages existantes du même modèle avant écriture Dexie.
  [`ConfigurationView.jsx:114`](../../src/components/ConfigurationView.jsx#L114)

**Formulaires & mutations Dexie (protection doublons)**

- Création de journée type avec `isSubmitting`/`try-catch` et message d'erreur si nom vide (patch de cette revue).
  [`ConfigurationView.jsx:73`](../../src/components/ConfigurationView.jsx#L73)

- Ajout de plage horaire avec la même protection contre les doubles soumissions.
  [`ConfigurationView.jsx:97`](../../src/components/ConfigurationView.jsx#L97)

**Navigation (routeur hash)**

- Dérive la vue affichée depuis le hash courant, source de vérité unique.
  [`App.jsx:11`](../../src/App.jsx#L11)

- Écoute `hashchange` pour rester synchronisé avec le bouton retour du navigateur.
  [`App.jsx:18`](../../src/App.jsx#L18)

- Navigue en ne poussant un nouveau hash que s'il diffère du courant (patch : évite les entrées d'historique redondantes).
  [`App.jsx:24`](../../src/App.jsx#L24)

**Accessibilité & design Zen**

- `role="presentation"` sur le `<li>` pour préserver la relation `listbox`/`option` (patch de cette revue).
  [`ConfigurationView.jsx:158`](../../src/components/ConfigurationView.jsx#L158)

- États `:focus-visible` sur les champs et boutons interactifs.
  [`ConfigurationView.css:90`](../../src/components/ConfigurationView.css#L90)

- L'animation d'entrée est désormais réellement désactivée sous `prefers-reduced-motion` (ordre de cascade corrigé — patch de cette revue).
  [`ConfigurationView.css:158`](../../src/components/ConfigurationView.css#L158)

**Tests (périphérique)**

- Schéma des nouvelles tables Dexie.
  [`db.test.js`](../../src/db.test.js#L1)

- Historique de navigation fiabilisé (reset déterministe du hash avant chaque test — patch de cette revue).
  [`App.test.jsx:6`](../../src/App.test.jsx#L6)

- Création de journée type, ajout/rejet de plage horaire, chevauchement traversant minuit.
  [`ConfigurationView.test.jsx`](../../src/components/ConfigurationView.test.jsx#L1)
