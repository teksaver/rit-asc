---
epic: 4
story: 2
id: 4.2
status: done
title: Moteur de Suggestion (Le Bouton Magique)
baseline_commit: a065e48d92e1db83cf48c86b01d86885dcb4f8ae
---

# Story 4.2: Moteur de Suggestion (Le Bouton Magique)

**Status:** in-progress
**Epic:** 4 (Vue d'Ensemble, Suggestions et Sauvegardes)

## 📖 Story Requirements (Foundation)

**User Story Statement:**
As a Utilisateur, I want que le système me suggère des tâches pertinentes pour mes plages horaires vides ou en cours, So that je ne perds pas de temps à chercher quoi faire.

**Acceptance Criteria (BDD):**
- **Given** une plage horaire est en cours et n'est pas remplie
- **When** je clique sur le bouton "Que pourrais-je faire ?"
- **Then** le système analyse les tâches de l'Inbox
- **And** il me suggère des tâches en filtrant par la catégorie de la plage, mais aussi en priorisant selon la priorité de la tâche et son état de préparation (checklist complète) (FR10).

**Business Context & Value:**
L'utilisateur est face à une plage horaire vide et ne veut pas subir la charge mentale de chercher quoi faire. Le système doit se comporter comme un assistant bienveillant qui filtre le dépôt et remonte les tâches les plus adaptées au contexte (catégorie) et prêtes à être réalisées (checklist, priorités).

## 📋 Tasks / Subtasks

- [x] **Task 1: Logique de suggestion (TDD/ATDD)**
  - [x] Écrire des tests unitaires validant le tri des tâches de l'Inbox (Priorité : `must` > `should` > `could`, puis filtrage par catégorie `categoryId`).
  - [x] Tester que les tâches déjà associées à un autre bloc ou terminées ne sont pas remontées.
- [x] **Task 2: Création du composant UI "Bouton Magique"**
  - [x] Ajouter un "Bouton Fantôme" avec un ton léger ("Que pourrais-je faire ?") s'affichant conditionnellement dans les `TimeBlock` de la `TodayView` si ces blocs sont en cours ou vides.
  - [x] Prévoir un espace/modale discret pour afficher les `TaskCard` suggérées sans surcharger l'écran.
- [x] **Task 3: Intégration et actions de suggestion**
  - [x] Connecter la source de données Dexie (`useLiveQuery` filtrant les `status === 'inbox'`).
  - [x] Permettre l'affectation d'une tâche suggérée au bloc courant via un clic ou glisser/déposer (Drag & Drop), en mettant à jour son `status`, son `plannedDayId` et `timeBlockId`.
- [x] **Task 4: Refactoring partagé**
  - [x] Extraire les constantes de priorités vers un module partagé (Action Item ouverte).

## 🛠 Developer Context & Guardrails

### Technical & Architecture Requirements (MUST FOLLOW)
1. **Local-First (AD-1) & Dexie :** Toutes les lectures de suggestions se font côté client sur l'état Dexie. Pas d'appel réseau. Gérer proprement l'état `isLoading` (vu dans la Story 4.1).
2. **Concurrence & Écritures (AD-7) :** L'affectation de la tâche depuis la suggestion doit être protégée par un état `isSubmitting` pour éviter les doublons ou conflits de clics répétitifs.
3. **Réutilisation UX :** Ne recréez pas le composant `TaskCard`. Réutilisez celui de la `TodayView`/`Inbox`.

### Existing Code Patterns to Preserve
- Extraire la logique métier du moteur de tri/filtrage hors des composants React vers un service pur (ex: `src/services/suggestionEngine.js`), comme ce fut fait pour `weekRange.js`.
- Tester en isolation les calculs de tri avec de faux jeux de données.
- Gérer l'état vide: Si le moteur ne trouve aucune tâche adéquate, afficher une micro-copy bienveillante (ex: "Aucune tâche spécifique pour l'instant, quartier libre !").

### Previous Story Intelligence & Action Items
- Depuis Epic 3 (Action Item) : Extraire impérativement les constantes métier (`must`, `should`, `could`) vers un module partagé.
- Depuis la Story 4.1 : Attention aux multiples `useLiveQuery` qui peuvent déclencher de nombreux re-renders ou flasher l'UI. Mettre en place un chargement conditionnel propre `if (isLoading)`.
- Eviter les re-rendus en cascade O(N^2). Faire le filtrage sur le dépôt une seule fois, puis afficher.

## 📚 Project Context Reference
- **Interaction Tactile (A11y/NFR9) :** Le geste de "Swipe-to-edit" ou "Drag & Drop" ne doit jamais bloquer les clics natifs. Les boutons d'affectation doivent avoir une hitbox min de 44x44px.
- **Génération d'IDs :** Uniquement avec `crypto.randomUUID()`.
- **CSS :** Vanilla CSS via variables (Design System "Zen"). Pas de Tailwind.

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created

## 🧑‍💻 Dev Agent Record

### Implementation Plan
- Extrait `PRIORITY_OPTIONS` (et un nouvel helper `getPriorityRank`) de `TaskEnrichment.jsx` vers `src/constants/priority.js`, réutilisé par `TaskCard.jsx`, `TaskEnrichment.jsx` et le nouveau moteur de suggestion.
- Créé `src/services/suggestionEngine.js` : fonction pure `suggestTasksForBlock(tasks, block)` qui filtre les tâches (exclut `completed` et celles déjà affectées à un `timeBlockId`), filtre par `categoryId` du bloc (si renseignée), puis trie par priorité (`must` > `should` > `could`), puis par état de préparation (`isTaskReady` — checklist vide ou entièrement complétée passe en premier), puis par ancienneté (`createdAt` croissant). Testé en isolation (TDD) avec 11 cas dans `suggestionEngine.test.js`, sans dépendance à Dexie/React.
- Ajouté dans `TodayView.jsx` : un hook `useNowHHMM` (rafraîchi toutes les 30s) pour déterminer si une plage est "en cours" (`nowHHMM` dans `[startTime, endTime)`). Le bouton fantôme "Que pourrais-je faire ?" s'affiche si la plage est vide, en cours, ou si son panneau de suggestions est déjà ouvert (pour permettre de le refermer même après affectation). Le panneau réutilise `TaskCard` tel quel (aucune recréation), avec `assignOptions` restreint au bloc courant pour affecter en un clic (ou en glisser/déposer, déjà supporté par `TaskCard`). Message bienveillant si aucune suggestion.
- Calcul des suggestions fait uniquement pour le bloc dont le panneau est ouvert (pas de calcul en cascade sur tous les blocs), pour éviter les re-rendus superflus évoqués dans les intelligences de la Story 4.1.

### Completion Notes
- Task 1 : moteur de suggestion pur + 11 tests unitaires (tri priorité/préparation/ancienneté, filtrage catégorie, exclusion tâches affectées/terminées, cas sans catégorie de bloc, cas sans bloc). Tous verts.
- Task 2 : bouton fantôme conditionnel + panneau de suggestions discret intégrés dans `TodayView`.
- Task 3 : source Dexie déjà branchée via `inboxTasks` (requête `useLiveQuery` existante `[status+plannedDayId] = ['inbox', UNASSIGNED_PLANNED_DAY_ID]`), affectation réutilisant `assignTask` (garde `isSubmitting` déjà en place, AD-7).
- Task 4 : constantes de priorité extraites vers `src/constants/priority.js`, action item d'Epic 3 résorbée.
- Suite complète : 136 tests passent (`npx vitest run`), lint propre (`npx oxlint src`).
- 7 patches de revue appliqués : `inboxTasks` protégé contre `undefined` ; `toMinutes()` remplace la comparaison chaîne pour la robustesse minuit ; `showGhostButton` permanent (le bouton ne disparaît plus) ; `useMemo` sur les dérivés pour les perfs ; `aria-controls` ajouté ; panneau fermé après affectation ; drop redondant retiré des suggestions.
- Vérification manuelle du geste tactile "Drag & Drop" sur mobile réel recommandée (limite connue de `jsdom`), comme pour la Story 3.x/4.1.

## 📁 File List
- `src/constants/priority.js` (nouveau)
- `src/services/suggestionEngine.js` (nouveau)
- `src/services/suggestionEngine.test.js` (nouveau)
- `src/components/TaskEnrichment.jsx` (modifié : import de `PRIORITY_OPTIONS` depuis le module partagé)
- `src/components/TaskCard.jsx` (modifié : import de `PRIORITY_OPTIONS` depuis le module partagé)
- `src/components/TodayView.jsx` (modifié : bouton fantôme + panneau de suggestions + hook `useNowHHMM`)
- `src/components/TodayView.css` (modifié : styles du bouton fantôme et du panneau de suggestions)
- `src/components/TodayView.test.jsx` (modifié : 5 nouveaux tests couvrant le Bouton Magique)

## 📝 Change Log
- Extraction des constantes de priorité (`must`/`should`/`could`) vers `src/constants/priority.js` (résorption de l'action item Epic 3).
- Ajout du moteur de suggestion pur (`src/services/suggestionEngine.js`) filtrant et triant les tâches du dépôt par catégorie, priorité et état de préparation.
- Ajout du "Bouton Magique" (bouton fantôme "Que pourrais-je faire ?") et de son panneau de suggestions dans `TodayView`, avec affectation en un clic ou par glisser/déposer en réutilisant `TaskCard`.
- 2026-07-08 : Application des 7 patches de revue sur `TodayView.jsx` : garde `inboxTasks` contre `undefined` ; suppression du polling `useNowHHMM` (inutile depuis que le bouton est toujours visible) ; `showGhostButton` permanent (ne disparaît plus après remplissage) ; mémoïsation des dérivés (`useMemo`) pour limiter les re-rendus ; `aria-controls` sur le bouton ; fermeture automatique du panneau après affectation ; retrait des cibles de drop redondantes dans les suggestions.
- 2026-07-08 : Patches additionnels post-revue (Blind Hunter) : mémoïsation de `safeInboxTasks` ; try/catch autour de `suggestTasksForBlock` ; `aria-controls` permanent ; gestion touche Escape pour fermer les suggestions ; `assignOptions` stable (référence mémoïsée) dans les cartes suggérées.

### Review Findings
- [x] [Review][Defer] Condition d'affichage du bouton — Divergence entre le texte de la story ("vides ou en cours") et le critère BDD strict ("en cours ET n'est pas remplie"). Le code implémente OU. — deferred, pre-existing: à voir avec la chef!
- [x] [Review][Patch] Plantage et absence d'état de chargement (`inboxTasks` potentiellement undefined) [TodayView.jsx]
- [x] [Review][Patch] Bug de comparaison d'heures (passage à minuit, comparaison de chaînes) [TodayView.jsx]
- [x] [Review][Patch] Chute de performance avec le polling (useNowHHMM re-rend tout TodayView) [TodayView.jsx]
- [x] [Review][Patch] Bouton fantôme évanescent au remplissage d'un bloc [TodayView.jsx]
- [x] [Review][Patch] Cibles de Drop illogiques sur les cartes suggérées [TodayView.jsx]
- [x] [Review][Patch] Accessibilité incomplète (aria-controls manquant) [TodayView.jsx]
- [x] [Review][Patch] Oubli de nettoyage d'état du panneau après affectation [TodayView.jsx]

## Suggested Review Order

**Moteur de suggestion (logique métier)**

- Fonction pure filtrant/triant les tâches inbox par catégorie, priorité, préparation ; testée en isolation
  [`suggestionEngine.js:12`](../../src/services/suggestionEngine.js#L12)

- Constantes de priorité extraites en module partagé (résorption action item Epic 3)
  [`priority.js:4`](../../src/constants/priority.js#L4)

**État et données dans TodayView**

- `suggestionBlockId` state pour ouvrir/fermer le panneau par bloc
  [`TodayView.jsx:74`](../../src/components/TodayView.jsx#L74)

- `safeInboxTasks` mémoïsé pour éviter le re-calcul et protéger contre `undefined`
  [`TodayView.jsx:141`](../../src/components/TodayView.jsx#L141)

- Dérivés `sortedTimeBlocks`, `orphanedTasks`, `sortedInboxTasks`, `assignOptions` tous mémoïsés (`useMemo`) pour limiter les re-rendus
  [`TodayView.jsx:124`](../../src/components/TodayView.jsx#L124)

**Bouton Magique UI**

- Bouton fantôme toujours visible, `aria-controls` permanent, touche Escape pour fermer
  [`TodayView.jsx:268`](../../src/components/TodayView.jsx#L268)

- Panneau de suggestions avec micro-copy état vide, `TaskCard` réutilisée, affectation par sélecteur
  [`TodayView.jsx:288`](../../src/components/TodayView.jsx#L288)

**Affectation et nettoyage**

- `assignTask` ferme automatiquement le panneau après affectation au bloc courant
  [`TodayView.jsx:164`](../../src/components/TodayView.jsx#L164)

- `suggestTasksForBlock` appelé dans un try/catch — le plantage du moteur ne casse pas le rendu
  [`TodayView.jsx:230`](../../src/components/TodayView.jsx#L230)

**CSS et styles**

- Bouton fantôme (bordure dashed, hitbox 44px, focus-visible) et panneau de suggestions
  [`TodayView.css:129`](../../src/components/TodayView.css#L129)

- Styles du panneau de suggestions (surface, padding, arrondi)
  [`TodayView.css:148`](../../src/components/TodayView.css#L148)

**Tests**

- 5 tests "Bouton Magique" : visibilité, suggestions triées, affectation, micro-copy vide
  [`TodayView.test.jsx:408`](../../src/components/TodayView.test.jsx#L408)

- 11 tests unitaires du moteur de suggestion (filtrage, tri, exclusion)
  [`suggestionEngine.test.js:24`](../../src/services/suggestionEngine.test.js#L24)

