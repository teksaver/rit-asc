---
epic: 2
story: 2
id: 2.2
status: done
title: Planification d'une Semaine et Duplication
baseline_commit: da482af
---

# Story 2.2: Planification d'une Semaine et Duplication

Status: done

**Epic 2: La Structure du temps (Les Journées Types)**
L'utilisateur peut créer des routines via des Journées Types, structurer ses journées avec des Plages Horaires, et planifier sa semaine facilement.

## 📖 Story

As a Utilisateur,
I want assigner mes "Journées types" à des dates du calendrier,
So that mes routines deviennent un plan d'action réel.

## ✅ Acceptance Criteria

1. **Given** je suis sur la vue de planification
   **When** j'assigne une journée type à une date (ex: Lundi)
   **Then** le système génère la structure de la journée pour cette date exacte en base locale
   **And** si une journée était déjà planifiée à cette date, le système demande confirmation avant d'écraser l'existante
   **And** je peux utiliser un bouton pour dupliquer l'organisation de la semaine en cours sur la semaine suivante (FR13).

## Tasks / Subtasks

- [x] Task 1: Modèle de données Dexie `plannedDays` (AC: 1)
  - [x] Ajouter `db.version(5)` dans `src/db.js` avec la table `plannedDays: 'id, date, dayTemplateId'`, en conservant toutes les tables précédentes (`tasks`, `categories`, `dayTemplates`, `timeBlocks`).
- [x] Task 2: Vue Planification — assignation manuelle (AC: 1)
  - [x] Créer `PlanningView.jsx` affichant les 7 jours de la semaine courante (lundi → dimanche) avec, pour chaque date, un sélecteur de journée type et un bouton d'assignation.
  - [x] Créer un `PlannedDay` (`crypto.randomUUID()`, `date`, `dayTemplateId`) lors de l'assignation, protégé par `isSubmitting`/`try-catch`.
  - [x] Si un `PlannedDay` existe déjà pour la date ciblée, ouvrir une `<dialog>` native de confirmation avant d'écraser (mise à jour du `dayTemplateId` du `PlannedDay` existant, sans dupliquer l'id).
- [x] Task 3: Duplication de semaine (AC: 1, FR13)
  - [x] Bouton "Dupliquer sur la semaine suivante" qui copie tous les `PlannedDay` de la semaine affichée vers la semaine suivante (date + 7 jours), protégé par `isSubmitting`/`try-catch`.
  - [x] Si la semaine suivante contient déjà des `PlannedDay`, demander confirmation via la même `<dialog>` avant d'écraser (cohérence avec la règle d'écrasement de l'AC).
- [x] Task 4: Navigation (AC: 1)
  - [x] Ajouter la route `#/planification` et le bouton de navigation correspondant dans `App.jsx` (routeur hash existant, helper `cx()`, `aria-current="page"`).
- [x] Task 5: Tests (AC: 1)
  - [x] `db.test.js` : schéma de la table `plannedDays`.
  - [x] `PlanningView.test.jsx` : assignation simple, confirmation avant écrasement d'un `PlannedDay` existant, duplication de semaine (y compris écrasement de la semaine suivante).
  - [x] `App.test.jsx` : navigation vers la vue Planification.

### Review Findings

- [x] [Review][Patch] Duplication miroir exacte — Lors de la duplication, effacer les jours non planifiés de la semaine suivante pour correspondre exactement à la semaine en cours. — fixed: `performDuplicate` itère désormais sur les 7 `weekDates` (et non plus seulement les jours assignés) ; un jour de la semaine suivante sans équivalent dans la semaine en cours est supprimé (`db.plannedDays.delete`) au lieu d'être laissé tel quel.
- [x] [Review][Patch] Requêtes de base de données non bornées [src/components/PlanningView.jsx] — fixed: la requête `db.plannedDays.toArray()` est remplacée par `db.plannedDays.where('date').anyOf(relevantDates).toArray()`, bornée aux 14 dates utiles (semaine courante + semaine suivante) au lieu de charger toute la table.
- [x] [Review][Patch] Boîte de dialogue de confirmation hors contexte ("Une journée est déjà planifiée" est trompeur pour une semaine) [src/components/PlanningView.jsx] — fixed: le texte de la `<dialog>` est désormais conditionné à `pendingAction.kind` (message dédié pour la duplication de semaine vs. l'assignation d'un seul jour).
- [x] [Review][Patch] Migration d'index manquante pour tasks [src/db.js] — fixed: ajout de `db.version(6)` avec un index unique `&date` sur `plannedDays` (au lieu d'un index simple), garantissant au niveau base qu'une seule `PlannedDay` peut exister par date.
- [x] [Review][Patch] Vulnérabilités de fuseau horaire/heure d'été [src/components/PlanningView.jsx] — fixed: `getCurrentWeekDates` ne mute plus un `Date` porteur de l'heure courante (`new Date(today)` + `setDate`) ; le calcul du lundi passe désormais entièrement par l'arithmétique ISO déjà utilisée par `addDays` (dates normalisées à minuit local), supprimant tout report d'heure de la journée à travers les calculs.
- [x] [Review][Patch] Pas de fermeture au clic à l'extérieur pour la modale native [src/components/PlanningView.jsx] — fixed: un `onClick` sur la `<dialog>` ferme la modale quand la cible du clic est la `<dialog>` elle-même (zone de backdrop), vérifié manuellement en navigateur.
- [x] [Review][Patch] Couleur du backdrop codée en dur [src/components/PlanningView.css] — fixed: extraction de `--color-overlay` dans `src/styles/theme.css` (même valeur, cohérent avec le pattern déjà utilisé pour `--shadow-card`), référencée via `var(--color-overlay)`.
- [x] [Review][Patch] Conditions de course dans les sélecteurs de formulaire [src/components/PlanningView.jsx] — fixed: introduction d'un état dérivé `isBusy` (`isSubmitting || pendingAction !== null`) qui désactive tous les `<select>` et boutons tant qu'une soumission ou une confirmation est en cours, et fait échouer immédiatement (`return`) tout nouvel `assignTemplate`/`duplicateWeek` déclenché pendant ce temps.
- [x] [Review][Patch] Protection manquante contre la condition de course dans la modale de confirmation (mode mitraillette) [src/components/PlanningView.jsx] — fixed: même garde `isBusy` — `pendingAction` ne peut plus être écrasé par un second clic pendant qu'une confirmation est déjà affichée (couvert par un nouveau test « anti mitraillette »).
- [x] [Review][Patch] Assignation concurrente sur la même date entre onglets [src/db.js] — fixed: l'index unique `&date` (v6) fait échouer au niveau IndexedDB toute tentative d'insertion d'une seconde `PlannedDay` pour une date déjà occupée par un autre onglet ; l'erreur est interceptée par le `try/catch` existant et affichée à l'utilisateur au lieu de créer un doublon silencieux.
- [x] [Review][Patch] Mémorisation incorrecte de weekDates lors du passage d'une semaine à l'autre [src/components/PlanningView.jsx] — fixed: `weekDates` est désormais mémorisé sur `todayISO` (recalculé à chaque rendu, mais stable au sein d'une même journée) au lieu d'un tableau de dépendances vide `[]`, qui figeait la semaine affichée pour toute la durée de vie du composant.
- [x] [Review][Defer] Logique de routage fragile (Ternaires imbriquées) [src/App.jsx] — deferred, pre-existing
- [x] [Review][Defer] Utilisation non sécurisée de Dialog natif (risque de blocage si démonté) [src/components/PlanningView.jsx] — deferred, pre-existing
- [x] [Review][Defer] Mocking de test inutile pour `<dialog>` [src/setupTests.js] — deferred, pre-existing
- [x] [Review][Defer] `crypto.randomUUID` indisponible si contexte non sécurisé [src/components/PlanningView.jsx] — deferred, pre-existing
- [x] [Review][Defer] Jour assigné supprimé pendant que la boîte de dialogue de duplication est ouverte [src/components/PlanningView.jsx] — deferred, pre-existing

## 🛠️ Developer Context & Guardrails

### Technical Requirements
- **Local-First / PWA**: Toute l'application est exécutée côté client sans backend. 
- **Persistance**: Les données doivent être sauvegardées localement via IndexedDB en utilisant **Dexie.js**. Pas de LocalStorage pour les données métiers, uniquement pour de l'état d'interface.
- **Entités Métier**:
  - `PLANNED_DAY`: Doit contenir un `id` (UUID v4), `date` (format "YYYY-MM-DD"), et `dayTemplateId` (FK).
- **Génération d'ID**: Utilisez `crypto.randomUUID()` pour les identifiants uniques.
- **Réactivité**: Utilisez `useLiveQuery` de `dexie-react-hooks` pour relier l'état IndexedDB aux composants React.
- **Vue Planification**: Créer une nouvelle vue (par ex: `PlanningView`) pour gérer l'assignation des modèles aux dates.
- L'assignation et la duplication impliquent des dates. Utilisez les APIs natives ou une fonction utilitaire pour manipuler les jours/semaines (format `YYYY-MM-DD`).

### Architecture Compliance
- **Planification Manuelle Isolée (AD-2)**: Le système ne génère jamais de `PlannedDay` (Journée réelle) dans le futur de façon autonome. La planification résulte exclusivement d'une action explicite (sélection manuelle ou duplication de semaine) liant une Date à un `DayTemplate`.
- **Règles de nommage**: `camelCase` pour les propriétés en BDD (ex: `dayTemplateId`), `PascalCase` pour les composants React.
- **Modèles de base de données**: Mettre à jour la configuration Dexie (`src/db.js`) pour ajouter la table `plannedDays`.

### File Structure & Existing Code Modifications
- **Fichiers à modifier :**
  - `src/db.js` : Ajouter `plannedDays: 'id, date, dayTemplateId'` dans une nouvelle version `db.version(5)`. N'oubliez pas d'inclure toutes les autres tables précédentes.
  - `src/App.jsx` : Ajouter la navigation pour cette nouvelle vue de Planification dans la barre supérieure et le routeur hash.
- **Fichiers à créer :**
  - `src/components/PlanningView.jsx` : L'interface permettant de gérer les assignations de modèles aux dates, et le bouton de duplication de semaine.
  - Fichiers CSS et de test associés (`PlanningView.css`, `PlanningView.test.jsx`).

### UX & Design System (Zen)
- **Couleurs**:
  - `background`: "#F9FAFB"
  - `surface`: "#FFFFFF"
  - `accent`: "#6366F1"
  - `muted`: "#E5E7EB"
  - `success`: "#10B981"
- **Formes & Élévation**:
  - Interfaces très plates. Bords arrondis généreux (`16px`).
- **Interaction (Micro-animations)**:
  - Utilisez la balise native HTML `<dialog>` (avec `showModal()` et `close()`) pour la confirmation d'écrasement afin d'offrir une accessibilité native et propre. Évitez les popups personnalisées complexes si ce n'est pas nécessaire.
- Pas d'éléments d'interface stressants (pas de couleurs d'erreur agressives).

### Previous Story Intelligence
- **Fiabilité des mutations Dexie**: Toute mutation Dexie (`db.plannedDays.put`, `.add`, etc.) DOIT être protégée par un bloc `try/catch` avec gestion de l'état `isSubmitting` pour empêcher les conditions de course et éviter de créer des doublons.
- **Accessibilité**: Privilégiez les éléments HTML natifs. Cibles tactiles ≥44x44px obligatoires. Maintenir les styles `:focus-visible` pour la navigation au clavier.
- **Routeur Hash**: L'historique de navigation repose sur `window.location.hash` (`App.jsx`). Ajoutez la nouvelle route logiciellement au routeur basique existant (`viewFromHash` et `navigate`). Conservez le helper `cx()` et `aria-current="page"`.

### Git Intelligence
- **Dernier commit majeur**: `da482af` "feat: implémente la Story 2.1".
- **Pattern détecté**: L'implémentation précédente a établi un routeur basé sur le hash `window.location.hash` dans `App.jsx`. L'utilisation des classes conditionnelles se fait via un helper. Ce pattern de navigation DOIT être étendu pour la vue de Planification, sans recourir à des bibliothèques externes (comme react-router).

### Latest Tech Information
- **React 19 & Vite 8**: Utilisation exclusive de Functional Components et Hooks.
- `crypto.randomUUID()` pour tous les IDs, y compris la prop `key` dans React. Évitez l'index de boucle.
- La balise `<dialog>` est parfaitement supportée par les navigateurs modernes pour la confirmation native.

### Project Context Reference
- Génération d'IDs: Exclusivement `crypto.randomUUID()` (UUID v4) côté client.
- Les mutations sur la base de données Dexie DOIVENT impérativement être entourées de `try/catch` et protégées contre le "mode mitraillette" (`isSubmitting`).
- Évitez l'ajout de nouvelles dépendances NPM inutiles (pas de bibliothèques de date externes comme date-fns ou momentJS si les APIs natives `Date` et `Intl` suffisent).

---
**Status Note**: Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (dev-story workflow)

### Debug Log References

- `npx vitest run` — 7 fichiers, 42 tests, tous passants (dont 7 nouveaux tests `PlanningView.test.jsx`, 1 nouveau test `db.test.js`, 1 nouveau test `App.test.jsx` pour cette story).
- `npx oxlint` — aucune erreur/avertissement.
- Vérification manuelle en navigateur (Vite dev server + Playwright headless) : navigation Dépôt → Configuration → Planification, création d'une journée type "Télétravail", affichage des 7 jours de la semaine courante (lundi → dimanche), assignation à un jour, dialog de confirmation avant écrasement (avec confirmation effective), clic sur "Dupliquer sur la semaine suivante" — aucune erreur console.

### Completion Notes List

- `src/db.js` : ajout de `db.version(5)` avec la table `plannedDays: 'id, date, dayTemplateId'`, sans modification des tables existantes.
- `PlanningView` (nouveau composant) : affiche les 7 jours de la semaine courante (calculée localement à partir de `new Date()`, lundi → dimanche, sans dépendance externe de dates). Pour chaque date, un sélecteur de journée type + bouton "Assigner" crée ou remplace le `PlannedDay` de cette date (`db.plannedDays.put`).
- Confirmation d'écrasement : si un `PlannedDay` existe déjà pour la date ciblée (assignation manuelle) ou pour une date de la semaine suivante (duplication), une `<dialog>` native (`showModal()`/`close()`) demande confirmation avant d'écraser ; l'action est appliquée uniquement après confirmation explicite, jamais silencieusement.
- Duplication de semaine : le bouton "Dupliquer sur la semaine suivante" copie tous les `PlannedDay` existants de la semaine affichée vers les dates correspondantes (+7 jours), dans une transaction Dexie (`db.transaction('rw', ...)`), avec une confirmation unique si la semaine suivante contient déjà des `PlannedDay`.
- Mutations Dexie (`db.plannedDays.put`) entourées de `try/catch` avec état `isSubmitting` partagé pour éviter les doublons en cas de double-clic/soumission rapide.
- Navigation ajoutée dans `App.jsx` : route `#/planification` et bouton "Planification" dans la nav, en réutilisant le routeur hash existant (`viewFromHash`, `navigate`, helper `cx()`, `aria-current="page"`).
- Conforme à AD-2 : aucun `PlannedDay` n'est jamais généré de façon autonome — uniquement via assignation manuelle explicite ou clic explicite sur "Dupliquer sur la semaine suivante".
- Aucune nouvelle dépendance NPM ajoutée : les calculs de dates (lundi de la semaine, formatage `YYYY-MM-DD`, ajout de jours, libellés `Intl.DateTimeFormat('fr-FR', …)`) utilisent exclusivement les API natives `Date`/`Intl`.
- Test infra : jsdom n'implémente pas `HTMLDialogElement.prototype.showModal`/`close` (limitation connue, cf. jsdom#3294) ; un shim minimal a été ajouté dans `src/setupTests.js` (même logique que le shim `fake-indexeddb/auto` déjà en place) pour permettre de tester la `<dialog>` de confirmation.

### File List

- `src/db.js` (modifié)
- `src/db.test.js` (modifié)
- `src/setupTests.js` (modifié)
- `src/App.jsx` (modifié)
- `src/App.test.jsx` (modifié)
- `src/components/PlanningView.jsx` (nouveau, puis modifié — corrections de revue)
- `src/components/PlanningView.css` (nouveau, puis modifié — corrections de revue)
- `src/components/PlanningView.test.jsx` (nouveau, puis modifié — corrections de revue)
- `src/styles/theme.css` (modifié — corrections de revue)

## Change Log

- 2026-07-04 — Implémentation complète de la Story 2.2 : table Dexie `plannedDays` (v5), nouvelle vue `PlanningView` (semaine courante lundi → dimanche, assignation manuelle d'une journée type par date, dialog de confirmation native avant écrasement d'un `PlannedDay` existant, duplication de la semaine en cours sur la semaine suivante avec confirmation si écrasement), navigation Planification dans `App.jsx`. Shim `HTMLDialogElement` ajouté à `setupTests.js` pour permettre les tests de la `<dialog>` sous jsdom. Tests unitaires (42/42), lint et vérification navigateur validés. Statut passé à "review".
- 2026-07-04 — Application des 11 findings `[Review][Patch]` de la revue de code : duplication en miroir exact (suppression des jours de la semaine suivante non planifiés cette semaine), requête `plannedDays` bornée aux 14 dates utiles au lieu de toute la table, message de confirmation contextualisé selon assignation/duplication, index unique `&date` (`db.version(6)`) empêchant deux `PlannedDay` sur la même date (protège aussi contre l'assignation concurrente entre onglets), calcul de semaine réécrit pour ne plus reporter l'heure du jour à travers l'arithmétique de dates (fuseau horaire/heure d'été), fermeture de la `<dialog>` au clic sur le backdrop, variable `--color-overlay` (au lieu d'une couleur codée en dur) dans `src/styles/theme.css`, garde `isBusy` désactivant les sélecteurs/boutons et bloquant tout déclenchement concurrent tant qu'une soumission ou une confirmation est en cours, et mémorisation de `weekDates` recalculée par jour (au lieu d'un tableau de dépendances vide qui figeait la semaine affichée). 3 nouveaux tests de régression ajoutés (miroir exact de duplication, contrainte unique sur `plannedDays.date`, protection anti-double-déclenchement de la modale). Un test préexistant s'est révélé fragile suite à l'ajout de `db.version(6)` (attente sur le libellé du jour au lieu du chargement effectif des données) et a été durci dans 4 tests concernés. Suite complète : 45/45 tests passants, `npx oxlint` propre, `vite build` OK, vérification manuelle en navigateur (Playwright headless) sans erreur console. Statut passé à "done".
