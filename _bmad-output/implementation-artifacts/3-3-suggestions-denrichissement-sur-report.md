---
epic: 3
story: 3
id: 3.3
status: done
title: Suggestions d'enrichissement sur report
baseline_commit: fc71ed3341772843d4c22efa87484c45f6ee1cd5
---

# Story 3.3: Suggestions d'enrichissement sur report

**Status:** done
**Epic:** 3 (Le Moteur d'Amnésie Bienveillante)

## 📖 Story Requirements (Foundation)

**User Story Statement:**
As a Utilisateur, I want que le système m'aide à catégoriser une tâche du Dépôt que je n'arrête pas de repousser, So that la tâche puisse intégrer le mécanisme de Saut de Cycle.

**Acceptance Criteria (BDD):**
- **Given** une tâche sans catégorie stagne dans le Dépôt depuis plus de 48 heures
- **When** j'ouvre l'application
- **Then** l'interface me suggère discrètement, via un indicateur visuel, d'assigner une catégorie à cette tâche (FR3).

**Business Context & Value:**
Le but est d'accompagner l'utilisateur vers l'utilisation de l'amnésie bienveillante (le saut de cycle) sans le forcer. Si une tâche traîne longtemps dans l'Inbox (le Dépôt) sans être planifiée, c'est souvent parce qu'elle n'est pas qualifiée (pas de catégorie). En suggérant doucement de lui donner une catégorie, on permet à l'utilisateur de l'intégrer au flux automatique sans générer de culpabilité.

## 📋 Tasks / Subtasks

- [x] **Task 1: ATDD / Tests Unitaires de l'Indicateur de Stagnation**
  - [x] Mettre à jour `src/components/TaskCard.test.jsx` pour vérifier l'apparition de l'indicateur visuel si la tâche a été créée il y a plus de 48h ET n'a pas de `categoryId` ET est dans le Dépôt (`plannedDayId === UNASSIGNED_PLANNED_DAY_ID` ou absence de `timeBlockId`).
  - [x] S'assurer que l'indicateur ne s'affiche pas pour les tâches ayant déjà une catégorie, ni pour les tâches de moins de 48h, ni pour les tâches déjà terminées (`status === 'completed'`).
- [x] **Task 2: Implémentation du calcul de stagnation**
  - [x] Dans `src/components/TaskCard.jsx`, ajouter la logique vérifiant la condition de stagnation : `Date.now() - new Date(task.createdAt).getTime() > 48 * 60 * 60 * 1000`.
  - [x] Appliquer cette vérification aux tâches éligibles (pas de `categoryId`, pas de `timeBlockId`, non terminées).
- [x] **Task 3: Ajout de l'indicateur visuel**
  - [x] Mettre à jour `src/components/TaskCard.jsx` pour intégrer un indicateur visuel discret (ex: un point ou un contour doux avec animation subtile sur le bouton d'édition `SlidersHorizontal`) lorsque la tâche est stagnante.
  - [x] Ajouter les styles CSS correspondants dans `src/components/TaskCard.css`, en respectant la charte "Zen" (utiliser la couleur d'accentuation `var(--color-accent)` et interdire absolument le rouge).
- [x] **Task 4: Vérification d'intégration**
  - [x] Exécuter tous les tests (`npm test`) pour confirmer qu'aucune régression n'affecte le reste de la `TaskCard` et de la `TaskList`.

### Review Findings

- [x] [Review][Patch] Stale UI via Synchronous Evaluation [src/components/TaskCard.jsx:47-51] — corrigé : tick périodique (15 min) via `setInterval`/`useEffect` pour réévaluer `isStagnant` sans dépendre d'un re-render externe fortuit.
- [x] [Review][Patch] Null/falsy createdAt fallback to epoch [src/components/TaskCard.jsx:47-51] — corrigé : garde explicite `Boolean(task.createdAt)` avant le calcul (évite `new Date(null)` → epoch 1970).
- [x] [Review][Patch] Time-Bomb Testing Setup [src/components/TaskCard.test.jsx] — corrigé : horloge figée via `vi.useFakeTimers({ shouldAdvanceTime: true })` + `vi.setSystemTime()` au lieu d'un `Date.now()` réel évalué au chargement du fichier.
- [x] [Review][Patch] Accessibility Violation (WCAG 2.2.2) [src/components/TaskCard.css] — corrigé : `@media (prefers-reduced-motion: reduce)` désactive l'animation de pulsation infinie (indicateur visuel statique conservé).
- [x] [Review][Patch] Incorrect Dépôt (Inbox) Condition Logic [src/components/TaskCard.jsx] — corrigé : ajout de la vérification `plannedDayId === UNASSIGNED_PLANNED_DAY_ID` (alignée sur TaskList/TodayView) ; une tâche déjà planifiée pour un jour précis (mais sans plage horaire) n'est plus considérée comme "dans le Dépôt".
- [x] [Review][Patch] Missing Test Case for Dépôt Qualification [src/components/TaskCard.test.jsx] — corrigé : nouveau cas de test pour une tâche planifiée sur un jour (plannedDayId réel, timeBlockId null), + cas createdAt manquant, + cas de réévaluation périodique.
- [x] [Review][Reject — false positive] Unauthorized Modification of UX Artifacts [DESIGN.md, EXPERIENCE.md] — non appliqué. Vérifié via `git diff {baseline_commit}` : ce sont des retraits ponctuels de la mention "Durée" dans deux fichiers UX, sans lien avec le code de cette story (TaskCard). L'arbre de travail n'étant pas isolé (pas de worktree dédié), le diff depuis `baseline_commit` capture aussi des modifications d'autres sessions BMAD concurrentes. Annuler ces lignes reviendrait à écraser un travail potentiellement volontaire d'une autre session sans certitude sur son origine ; laissé en l'état pour arbitrage humain plutôt que revert automatique.
- [x] [Review][Reject — false positive] Unauthorized Modification of Architecture and Epic Specs [ARCHITECTURE-SPINE.md, epics.md, .memlog.md] — non appliqué. Vérifié via `git diff {baseline_commit}` : ajout des NFR7-9, des stories 4.5/4.6/4.7 et des AD-6/AD-7/AD-8 — contenu cohérent avec `sprint-change-proposal-2026-07-05.md` et déjà reflété dans `sprint-status.yaml` (epic-4 stories backlog). Travail légitime d'un autre workflow (correct-course / architecture) partageant le même arbre de travail, sans rapport avec cette story TaskCard. Non annulé pour ne pas détruire ce travail.
- [x] [Review][Defer] Hardcoded Business Logic in UI Layer [src/components/TaskCard.jsx] — deferred, pre-existing

## 🛠 Developer Context & Guardrails

### Technical & Architecture Requirements (MUST FOLLOW)
1. **Local-First (AD-1) & Dates (AD-6) :** `createdAt` est stocké au format ISO string. Utiliser les API natives JS (`Date.now()`, `new Date()`) pour évaluer l'ancienneté (pas de librairie tierce).
2. **Esthétique Zen (UX-DR1) :** Interdiction stricte d'utiliser du rouge d'alerte pour l'indicateur. Utiliser la couleur `accent` (#6366F1 / indigo). L'indicateur doit être discret (fade-in, éventuellement une pulsation légère). Ne pas utiliser de texte anxiogène comme "En retard".
3. **Composants A11Y :** L'indicateur visuel doit être accessible. Assurez-vous que l'aria-label du bouton concerné reflète la suggestion (ex: "Modifier la tâche (catégorie suggérée)").
4. **Pas de génération d'ID ou de mutation de schéma :** Cette story est purement visuelle et de calcul local. Aucune modification du schéma Dexie (AD-5) n'est autorisée ou nécessaire.

### File Structure & Existing Code
- `src/components/TaskCard.jsx` : L'endroit principal où insérer la condition `isStagnant` et le nouvel affichage.
- `src/components/TaskCard.css` : Y ajouter les classes CSS de l'indicateur (ex: `.task-card__edit-button--stagnant`).
- `src/components/TaskCard.test.jsx` : Ajouter les cas de test pour cette nouvelle logique de rendu.
- `src/db.js` : Utiliser `UNASSIGNED_PLANNED_DAY_ID` si vous devez vérifier l'affectation à l'Inbox.

### Testing Requirements (AD-8: Test-First / ATDD)
- Le rendu du composant React `TaskCard` doit être testé avec `@testing-library/react`.
- Fournir une tâche avec un `createdAt` généré dynamiquement à `Date.now() - 50 * 60 * 60 * 1000` (ou en simulant les timers) pour vérifier correctement le seuil des 48h.

## 🧠 Previous Story Intelligence
- Dans l'Epic 1 et les tâches précédentes (ex: Story 3.2), nous avons retenu que l'Inbox correspondait au filtre `status === 'inbox'` et `plannedDayId === UNASSIGNED_PLANNED_DAY_ID`. L'absence de catégorie se vérifie avec `!task.categoryId`.
- Dans `TaskCard.jsx`, il y a déjà des flags booléens utiles comme `isCompleted` et `isAssignedToBlock`. Construisez `isStagnant` de manière similaire pour garder le composant lisible.
- Les swipes et drag & drop (Story 3.1) ne doivent pas être perturbés par l'indicateur visuel; ce dernier doit être purement cosmétique.

## 📚 Project Context Reference
- **Système de couleurs "Zen" :** background: #F9FAFB, accent: #6366F1, success: #10B981.
- Aucune story ne doit deviner des solutions en cas d'ambiguïté. Demandez au PM ou appliquez la règle la plus stricte.
- Respecter scrupuleusement la séparation des rôles (pas de base de données à modifier, juste une vue React).

## 🧾 Dev Agent Record

### Implementation Plan
- Ajout d'un flag `isStagnant` dans `TaskCard.jsx`, calculé de la même manière que les flags existants (`isCompleted`, `isAssignedToBlock`) : tâche non terminée, sans `categoryId`, non affectée à une plage horaire (`!task.timeBlockId`), et créée depuis plus de 48h (`Date.now() - new Date(task.createdAt).getTime() > 48 * 60 * 60 * 1000`).
- L'indicateur est purement visuel : classe CSS `task-card__edit-button--stagnant` sur le bouton d'édition existant (pastille + pulsation légère en couleur accent), et `aria-label` mis à jour dynamiquement ("Modifier la tâche (catégorie suggérée)") pour l'accessibilité.
- Aucune modification du schéma Dexie ni des gestes de swipe/drag & drop.

### Completion Notes
- ✅ Task 1-4 complètes : tests ATDD ajoutés (5 nouveaux cas dans `TaskCard.test.jsx`), logique de stagnation implémentée, indicateur visuel + styles CSS "Zen" (accent indigo, pas de rouge, pulsation discrète), suite complète exécutée sans régression (99 tests, 12 fichiers, tous verts) et lint (`oxlint`) propre sur les fichiers modifiés.
- Condition de stagnation vérifiée manuellement contre les 4 cas de la story : catégorie déjà présente, tâche récente (<48h), tâche terminée, tâche déjà affectée à une plage horaire — aucun de ces cas n'affiche l'indicateur.

### Debug Log
- Aucun blocage rencontré ; implémentation directe suivant les guardrails de la story.

## 📁 File List
- `src/components/TaskCard.jsx` (modifié)
- `src/components/TaskCard.css` (modifié)
- `src/components/TaskCard.test.jsx` (modifié)

## 📝 Change Log
- 2026-07-06 : Implémentation de la story 3.3 — indicateur discret de suggestion de catégorisation sur `TaskCard` pour les tâches stagnantes (>48h, sans catégorie, non planifiées).
- 2026-07-06 : Application des patches de revue de code — condition "Dépôt" alignée sur `plannedDayId === UNASSIGNED_PLANNED_DAY_ID`, garde contre `createdAt` manquant, tick périodique (15 min) pour réévaluer la stagnation sans re-render externe, `prefers-reduced-motion` sur l'animation de pulsation, horloge figée dans les tests. Deux findings [Review][Patch] rejetés comme faux positifs (voir Review Findings) : modifications de DESIGN.md/EXPERIENCE.md/ARCHITECTURE-SPINE.md/epics.md/.memlog.md non liées à cette story, issues d'autres workflows BMAD concurrents partageant le même arbre de travail — non annulées.

## Suggested Review Order

**Condition de stagnation (Dépôt)**

- Point d'entrée : `isInDepot` remplace le simple `!timeBlockId` par la vraie définition du Dépôt (alignée sur TaskList/TodayView).
  [`TaskCard.jsx:52`](../../src/components/TaskCard.jsx#L52)

- Garde contre `createdAt` manquant : évite `new Date(null)` → epoch 1970 qui aurait signalé à tort une vieille tâche legacy.
  [`TaskCard.jsx:61`](../../src/components/TaskCard.jsx#L61)

**Fraîcheur de l'indicateur (tick périodique)**

- Réévalue `isStagnant` toutes les 15 min sans dépendre d'un re-render externe fortuit.
  [`TaskCard.jsx:55`](../../src/components/TaskCard.jsx#L55)

**Accessibilité (WCAG 2.2.2)**

- Désactive le pulse infini pour `prefers-reduced-motion`, seule animation continue du composant.
  [`TaskCard.css:91`](../../src/components/TaskCard.css#L91)

**Tests**

- Horloge figée (`vi.setSystemTime`) au lieu d'un `Date.now()` réel évalué au chargement du fichier.
  [`TaskCard.test.jsx:309`](../../src/components/TaskCard.test.jsx#L309)

- Nouveau cas : tâche planifiée sur un jour précis mais sans plage horaire → plus dans le Dépôt.
  [`TaskCard.test.jsx:378`](../../src/components/TaskCard.test.jsx#L378)

- Nouveau cas : franchissement du seuil de 48h en cours de vie du composant, sans re-render externe.
  [`TaskCard.test.jsx:394`](../../src/components/TaskCard.test.jsx#L394)

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created
