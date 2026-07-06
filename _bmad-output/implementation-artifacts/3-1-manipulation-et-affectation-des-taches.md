---
epic: 3
story: 1
id: 3.1
status: done
title: Manipulation et Affectation des Tâches (Drag & Drop)
baseline_commit: f9c0893e56a1b37d6be236dc547093983c8eb584
---

# Story 3.1: Manipulation et Affectation des Tâches (Drag & Drop)

**Status:** done
**Epic:** 3 (Le Moteur d'Amnésie Bienveillante)

## 📖 Story Requirements (Foundation)

**User Story Statement:**
As a Utilisateur, I want pouvoir glisser-déposer des tâches de mon Dépôt vers les plages horaires de ma journée, So that je m'engage facilement à accomplir ces tâches aujourd'hui.

**Acceptance Criteria (BDD):**
- **Given** je vois ma vue "Aujourd'hui"
- **When** je maintiens une tâche de l'Inbox et la lâche dans une plage horaire
- **Then** la tâche s'attache à cette plage (FR14)
- **And** si le dépôt (drop) est invalide ou hors cible, la tâche reprend sa place initiale
- **And** je peux la faire glisser vers la gauche (Swipe-to-edit) pour l'annuler et la renvoyer au Dépôt.

**Business Context & Value:**
Réduire la friction de l'engagement. L'assignation d'une tâche doit être aussi naturelle que de déplacer un objet physique, remplaçant les modales/dialogues par un geste direct (Drag & Drop). L'annulation d'une affectation doit être rapide via un geste naturel (Swipe-to-edit).

---

## Tasks / Subtasks

- [x] Task 1: Drag & drop tactile sur `TaskCard` (AC: 1, 2, 3)
  - [x] Ajouter au `TaskCard` un mode "drag" via Pointer Events : un maintien (long press sans mouvement significatif) ou un déplacement non-horizontal décolle visuellement la carte (`transform: translate(x,y)`), sans interférer avec le swipe droit existant (enrichissement) ni les clics natifs (checkbox, sous-tâches, bouton d'édition).
  - [x] À la relâche (`pointerup`), résoudre la zone de dépôt sous le pointeur ; si une plage horaire valide est trouvée, notifier le parent (callback `onDrop`) ; sinon la carte reprend sa place initiale (transition CSS de retour).
  - [x] Ajouter le swipe vers la gauche : si la tâche est assignée à une plage (`timeBlockId` renseigné), le swipe gauche la désaffecte (callback `onUnassign`) et la renvoie au Dépôt.
- [x] Task 2: Zones de dépôt et Dépôt non-bloquant dans `TodayView` (AC: 1, 2, 3)
  - [x] Marquer chaque `<li data-time-block>` comme zone de dépôt identifiable (porter l'id de la plage).
  - [x] Remplacer le `<dialog>` bloquant d'affectation par une section "Dépôt" toujours visible (non modale) listant les tâches Inbox non affectées sous forme de `TaskCard` draggables.
  - [x] Conserver un fallback accessible sans geste tactile (ex: action d'affectation par bouton/liste) pour les utilisateurs clavier/lecteur d'écran, en plus du geste naturel.
  - [x] Brancher le callback `onDrop` du `TaskCard` sur la mise à jour Dexie (`plannedDayId`, `timeBlockId`), protégée par `try/catch` et un état `isSubmitting`/équivalent pour éviter les écritures concurrentes.
  - [x] Brancher le callback `onUnassign` (swipe gauche) sur la désaffectation existante (même logique que le bouton "Retirer").
- [x] Task 3: Tests (AC: 1, 2, 3)
  - [x] `TaskCard.test.jsx` : décollement visuel au maintien/mouvement non-horizontal, appel de `onDrop` sur relâche au-dessus d'une zone valide, retour à la position initiale si la zone est invalide/hors cible, appel de `onUnassign` sur swipe gauche d'une tâche assignée, non-régression du swipe droit et des clics natifs.
  - [x] `TodayView.test.jsx` : Dépôt visible sans dialog bloquant, affectation d'une tâche par drop sur une plage horaire, désaffectation par swipe gauche, fallback accessible toujours fonctionnel.
- [x] Task 4: Vérification manuelle navigateur (AC: 1, 2, 3)
  - [x] `jsdom` ne simule pas fidèlement les interactions tactiles avancées (project-context.md) : demander une vérification manuelle en navigateur du drag & drop et du swipe gauche avant de clore la story.

---

## Dev Agent Record

### Completion Notes

- Tasks 1-3 implémentées et testées : `TaskCard.jsx` gère désormais le drag (long press ou mouvement non-horizontal via Pointer Events, `setPointerCapture`), la résolution de zone de dépôt (`document.elementFromPoint` + `closest('[data-time-block]')`), et le swipe gauche pour désaffecter. `TodayView.jsx` a remplacé le `<dialog>` bloquant par une section "Dépôt" toujours visible, avec un fallback accessible (sélecteur `<select>` "Affecter à" + bouton "Retirer") en plus du geste.
- 79 tests passent (unitaires `TaskCard.test.jsx` + `TodayView.test.jsx`), lint (`oxlint`) propre.
- **Vérification en navigateur réel (Chromium via Playwright)** effectuée pour compenser les limites de `jsdom` sur les événements tactiles avancés (règle `project-context.md`) : cette vérification a révélé un bug réel invisible en tests unitaires — la carte en cours de glissement (`z-index: 10`, transformée visuellement au-dessus de la zone de dépôt) était elle-même détectée par `document.elementFromPoint` au moment du `pointerup`, empêchant la résolution de la plage horaire sous-jacente et donc le drop. Corrigé en ajoutant `pointer-events: none` sur `.task-card--dragging` (le `pointerup` continue d'être livré à l'élément capturé via `setPointerCapture`, indépendamment de `pointer-events`). Après correctif, le flux complet (drag → drop → affectation Dexie, et swipe gauche → désaffectation) a été rejoué avec succès en navigateur réel, sans erreur console.
- **Task 4 — Vérification manuelle tactile (Sylvain, sur téléphone réel)** : effectuée via HTTPS local (serveur de dev exposé sur le réseau local avec certificat auto-signé, requis car `crypto.randomUUID()` exige un contexte sécurisé — indisponible en `http://<ip-locale>`). Drag & drop, swipe gauche (désaffectation) et swipe droit (enrichissement) confirmés fonctionnels sur appareil tactile réel.
  - Retour du PO : le swipe manquait de retour visuel pendant le geste (rien ne bougeait avant le relâchement). Ajout d'un suivi horizontal 1:1 du doigt (`isSwiping`/`swipeOffset`, classe `.task-card--swiping`) avec retour élastique via la transition CSS de base à la levée du doigt, sur le même principe que le décollement du drag. Nouveau test ajouté (`TaskCard.test.jsx`). Re-testé et validé sur appareil réel après correctif : "Oui c'est parfait".
- 80 tests passent, lint (`oxlint`) propre après l'ajout de l'animation de swipe.
- **Correctifs de revue (2e passe)** : les 11 findings `[Review][Patch]` ont été traités :
  - `touch-action: none` retiré de `.task-card--draggable` (bloquait le scroll vertical des listes au repos) et déplacé sur `.task-card--dragging` (bloque uniquement pendant le décollement effectif).
  - Réinitialisation du `<select>` de secours différée via `setTimeout(0)` pour laisser un lecteur d'écran annoncer la sélection avant le retour au placeholder.
  - Drag & drop étendu aux tâches déjà affectées (`assignedTasks`/`orphanedTasks` dans `TodayView.jsx`) pour permettre le déplacement direct d'une plage horaire à une autre.
  - Priorité inversée au swipe gauche : ferme d'abord le panneau d'enrichissement s'il est ouvert, désaffecte seulement sinon (évite une désaffectation accidentelle en voulant juste fermer le panneau).
  - `handlePointerDown` ignore désormais les gestes si `disabled` est vrai (le drag/swipe restait actif sur les cartes désactivées).
  - Hitbox du `<select>` d'affectation portée à 44px (NFR5).
  - Timer de long press nettoyé au démontage (`useEffect`) et avant chaque nouveau `pointerdown` (évitait un timer fantôme en cas de doubles appuis rapprochés).
  - `elementFromPoint` retournant un nœud non-Element : vérifié déjà protégé par le chaînage optionnel existant (`el?.closest?.(...)`), aucun changement de code nécessaire.
  - `stopPropagation()` ajouté sur le clic du bouton "Retirer" par défense en profondeur.
  - Fuite du mock `document.elementFromPoint` dans `TaskCard.test.jsx` corrigée par un `afterEach` de réinitialisation.
  - Écart entre les seuils de décision swipe/drag élargi (`DRAG_VERTICAL_THRESHOLD` 12→24px) pour rendre la discrimination geste moins fragile face au bruit naturel d'un swipe horizontal.
  - Suppression d'une ligne de texte corrompue/hors-sujet trouvée dans ce fichier (juste avant "Review Findings"), sans rapport avec la story — probable artefact d'injection ou de corruption, signalé à Sylvain.
  - 83 tests passent (suite complète), lint (`oxlint`) propre.

### File List

- `src/components/TaskCard.jsx` (modifié)
- `src/components/TaskCard.css` (modifié)
- `src/components/TaskCard.test.jsx` (modifié)
- `src/components/TodayView.jsx` (modifié)
- `src/components/TodayView.css` (modifié)
- `src/components/TodayView.test.jsx` (modifié)

## Change Log

- 2026-07-06 : Implémentation Tasks 1-3 (drag & drop tactile, Dépôt non-bloquant, tests) ; correctif du bug de résolution de zone de dépôt découvert via vérification en navigateur réel (`pointer-events: none` sur `.task-card--dragging`).
- 2026-07-06 : Task 4 — vérification manuelle tactile sur appareil réel (via HTTPS local) par Sylvain ; ajout d'une animation de suivi/retour élastique pendant le swipe suite à son retour. Story validée, prête pour code review.
- 2026-07-06 : Application des 11 correctifs `[Review][Patch]` issus de la revue de code (scroll bloqué, a11y select, drag inter-plages, conflit swipe/enrichissement, gestes non bloqués si `disabled`, hitbox 44px, fuite timer, fuite mock de test, seuils swipe/drag). Suite complète (83 tests) et lint verts.

---

## 🛠 Developer Context & Guardrails

### Technical & Architecture Requirements (MUST FOLLOW)
1. **Zéro Backend / Local First (AD-1) :** Toutes les modifications (`plannedDayId`, `timeBlockId`) se font sur `db.tasks` via Dexie.js. 
2. **Protection des Écritures (AD-7) :** Envelopper les updates de Drop et Swipe dans des `try/catch`. Bien que le D&D limite intrinsèquement les clics "mitraillette", assurez-vous que l'état local soit cohérent.
3. **Vanilla CSS Uniquement :** Tailwind est interdit. Utilisez des classes BEM et des variables CSS dans `TodayView.css` et `TaskCard.css`.
4. **Hitboxes (NFR5) :** Assurez-vous que les zones de drop et les cartes restent suffisamment grandes pour l'interaction tactile.

### Interaction Tactile Critique (NFR9 - Robustesse)
- **Pointer Events Requis :** Le projet utilise les *Pointer Events* (`onPointerDown`, `onPointerMove`, `onPointerUp`) pour gérer les gestes au lieu du Drag & Drop HTML5 classique (qui est instable sur mobile tactile).
- **Conflits de Gestes :** `TaskCard.jsx` implémente déjà un `Swipe` vers la droite pour l'enrichissement. Vous devez ajouter :
  - **Swipe vers la gauche** (si la tâche est assignée à un bloc) pour la désassigner (remettre `plannedDayId: UNASSIGNED_PLANNED_DAY_ID` et `timeBlockId: null`).
  - **Drag & Drop** : Un maintien (`long press` ou mouvement dans toutes les directions sans déclencher le swipe horizontal) qui "décolle" la carte.
- **NE BLOQUEZ PAS LES CLICS NATIFS :** C'est la règle d'or (`project-context.md`). L'appel à `setPointerCapture` doit être géré avec précaution pour ne pas empêcher le clic sur la case à cocher ou sur les sous-tâches de la checklist.

### File Structure & Existing Code
**Fichiers à modifier :**
- `src/components/TaskCard.jsx` : Ajouter la logique de drag (déplacement visuel libre `transform: translate(x,y)`) et la détection du drop, ainsi que le swipe gauche.
- `src/components/TodayView.jsx` : 
  - Actuellement, l'affectation se fait via une balise `<dialog>` (boutons "Affecter une tâche" et "Retirer").
  - **Défi d'UX (à résoudre par le Dev) :** Pour faire un D&D "de l'Inbox vers les plages horaires", les tâches de l'Inbox *doivent* être visibles dans `TodayView` sans bloquer l'écran avec un `<dialog>` modal. L'agent devra repenser l'UI (ex: afficher une zone "Dépôt" en bas de l'écran ou un tiroir non bloquant) pour permettre le glisser-déposer.
  - Définir les "Drop Zones" sur les balises `<li data-time-block>`.

---

## 📚 Project Context Reference
Voir `_bmad-output/project-context.md` pour les règles spécifiques à React et Dexie (notamment la gestion des conditions de course et l'utilisation exclusive d'UUID v4 si de nouvelles entités étaient créées, bien que ce ne soit pas le cas ici).

---

### Review Findings
- [x] [Review][Patch] UX Scroll Blocking — L'utilisation de `touch-action: none;` sur les cartes bloque le défilement vertical. Comment concilier drag & drop multidirectionnel et défilement ?
- [x] [Review][Patch] A11y Select Reset — Le `<select>` de secours se réinitialise immédiatement à `''` après sélection, ce qui peut être déroutant pour les lecteurs d'écran.
- [x] [Review][Patch] Support du Drag & Drop inter-plages horaires [src/components/TodayView.jsx]
- [x] [Review][Patch] Conflit de Swipe gauche si le panneau d'enrichissement est ouvert [src/components/TaskCard.jsx]
- [x] [Review][Patch] Gestes tactiles non bloqués quand la carte est désactivée (disabled) [src/components/TaskCard.jsx]
- [x] [Review][Patch] Hitbox du selecteur d'assignation trop petite (36px < 44px) [src/components/TaskCard.css]
- [x] [Review][Patch] Fuite du timer de "Long Press" (pas nettoyé au démontage ni sur les petits mouvements) [src/components/TaskCard.jsx]
- [x] [Review][Patch] Erreur possible de `elementFromPoint` retournant un noeud texte sans méthode `closest` [src/components/TaskCard.jsx]
- [x] [Review][Patch] Propagation de l'événement `onClick` non stoppée sur le bouton "Retirer" [src/components/TaskCard.jsx]
- [x] [Review][Patch] Fuite de l'état global du mock `document.elementFromPoint` dans les tests [src/components/TaskCard.test.jsx]
- [x] [Review][Patch] Seuils de déclenchement (Swipe vs Drag) trop fragiles (10px vs 12px) [src/components/TaskCard.jsx]
- [x] [Review][Defer] Création d'index uniques Dexie (AD-7) — deferred, pre-existing
- [x] [Review][Defer] Verrouillage global de la vue `TodayView` lors de la soumission — deferred, pre-existing

---

## Suggested Review Order

**Gestes tactiles (drag, swipe, long press)**

- Seuils de décision drag/swipe élargis (12→24px) pour ne plus confondre un swipe horizontal bruité avec un décollement.
  [`TaskCard.jsx:13`](../../src/components/TaskCard.jsx#L13)

- Garde `disabled` ajoutée en tête de `handlePointerDown` : plus aucun geste ne démarre sur une carte désactivée.
  [`TaskCard.jsx:103`](../../src/components/TaskCard.jsx#L103)

- Timer de long press nettoyé avant tout nouveau `pointerdown` et au démontage du composant.
  [`TaskCard.jsx:79`](../../src/components/TaskCard.jsx#L79)
  [`TaskCard.jsx:86`](../../src/components/TaskCard.jsx#L86)

- Le swipe gauche ferme d'abord le panneau d'enrichissement s'il est ouvert, il ne désaffecte que sinon.
  [`TaskCard.jsx:162`](../../src/components/TaskCard.jsx#L162)

- `stopPropagation` sur le clic "Retirer", en défense en profondeur.
  [`TaskCard.jsx:293`](../../src/components/TaskCard.jsx#L293)

**Défilement pendant le drag**

- `touch-action: none` retiré du repos (`--draggable`) et déplacé sur `--dragging` : le scroll vertical natif fonctionne tant que la carte n'est pas réellement décollée.
  [`TaskCard.css:31`](../../src/components/TaskCard.css#L31)

**Accessibilité**

- Réinitialisation du `<select>` de secours différée d'un tick pour laisser le lecteur d'écran annoncer la sélection.
  [`TaskCard.jsx:317`](../../src/components/TaskCard.jsx#L317)

- Hitbox du `<select>` d'affectation portée à 44px (NFR5).
  [`TaskCard.css:208`](../../src/components/TaskCard.css#L208)

**Drag & drop inter-plages horaires**

- Les tâches déjà affectées à une plage reçoivent maintenant `draggable`/`onDrop`/`onDragOver`, permettant un déplacement direct vers une autre plage.
  [`TodayView.jsx:221`](../../src/components/TodayView.jsx#L221)
  [`TodayView.jsx:248`](../../src/components/TodayView.jsx#L248)

**Tests**

- `afterEach` de réinitialisation du mock `document.elementFromPoint`, corrige la fuite d'état global entre tests.
  [`TaskCard.test.jsx:21`](../../src/components/TaskCard.test.jsx#L21)

- Nouveaux tests couvrant les gestes ignorés en `disabled` et la priorité swipe/panneau d'enrichissement.
  [`TaskCard.test.jsx:250`](../../src/components/TaskCard.test.jsx#L250)

- Nouveau test de drag & drop entre deux plages horaires.
  [`TodayView.test.jsx:201`](../../src/components/TodayView.test.jsx#L201)
