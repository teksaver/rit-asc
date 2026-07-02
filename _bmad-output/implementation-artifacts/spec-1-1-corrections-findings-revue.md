---
title: 'Corrections des findings de revue - Story 1.1 (Dépôt)'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
context: []
baseline_commit: '39591d315b6883da073a84705074c2a613084b85'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La revue de code de la Story 1.1 (Dépôt/mitraillette) a identifié 12 findings `[Patch]` non résolus : IDs auto-increment au lieu d'UUID v4, schéma Dexie non conforme à l'architecture (`status` avec valeur `done` au lieu de `completed`, absence de `categoryId`/`plannedDayId`/`checklist`), `TaskList` qui n'affiche pas seulement les tâches `inbox`, vidage non instantané du champ de saisie, promesses non gérées, absence d'état de chargement/erreur, tests fragiles, absence d'état désactivé à la soumission, lacunes ARIA, absence de balise `<main>`, et exports incohérents dans `db.js`.

**Approach:** Corriger chaque finding directement dans les fichiers concernés en alignant le code sur `epic-1-context.md` (schéma de données, statuts), sans changer le comportement "mitraillette" ni le design system existant. Les 3 findings `[Defer]` (Reduced Motion, CSS Reset, Error Boundary) restent hors scope, déjà déférés dans `deferred-work.md`.

## Boundaries & Constraints

**Always:**
- IDs des entités `tasks` en UUID v4 (via `crypto.randomUUID()`), pas d'auto-increment.
- Statuts de tâche limités à `inbox | planned | completed` (jamais `done`).
- Champ de saisie se vide et reprend le focus de façon perçue comme instantanée (optimistic UI), même en cas de latence Dexie.
- Toute promesse issue d'un handler d'événement est gérée (pas de rejet non catché).
- `TaskList` n'affiche que les tâches `status: 'inbox'`.
- Conserver Vanilla CSS, Dexie.js, offline-first — aucune nouvelle dépendance.

**Ask First:** Si la migration du schéma Dexie (passage de `++id` à `id` UUID) nécessite une nouvelle version de schéma Dexie incompatible avec des données déjà persistées localement chez un utilisateur réel — halte et demande si un script de migration est requis ou si un simple bump de version (perte des données locales de dev) suffit.

**Never:** Ne pas implémenter l'enrichissement (catégorie/priorité/checklist UI) — Story 1.3/1.4. Ne pas changer le style visuel du Design System "Zen".

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ajout rapide (mitraillette) | Frappe "Entrée" sur un titre non vide | Tâche créée avec `id` UUID v4, `status: 'inbox'`; champ vidé et refocalisé immédiatement, avant résolution de la promesse Dexie | Si `db.tasks.add` rejette, erreur catchée et affichée sans crash, texte restauré dans le champ |
| Double frappe rapide "Entrée" | Deux ajouts successifs très rapprochés | Les deux tâches sont créées, aucune tâche dupliquée/perdue | Champ désactivé le temps de l'ajout précédent si nécessaire pour éviter une course |
| Tâche marquée terminée | Clic sur la case à cocher d'une `TaskCard` | `status` passe à `completed` (jamais `done`) et disparaît de la liste `inbox` | N/A |
| Chargement initial de la liste | `useLiveQuery` pas encore résolu | Aucun flash de "dépôt vide" incorrect; état de chargement distinct de l'état vide réel | Si la requête Dexie échoue, message d'erreur doux affiché (pas de crash) |

</frozen-after-approval>

## Code Map

- `src/db.js` -- schéma Dexie à corriger (UUID v4, statuts, champs manquants) + export unique cohérent
- `src/components/ProgressiveInput.jsx` -- vidage instantané, gestion promesse, état désactivé anti-course
- `src/components/TaskCard.jsx` -- statut `completed` au lieu de `done`, ARIA
- `src/components/TaskList.jsx` -- filtre `status: 'inbox'`, états loading/erreur
- `src/App.jsx` -- balise sémantique `<main>`
- `src/db.test.js` -- tests schéma à adapter (UUID, statuts)
- `src/components/ProgressiveInput.test.jsx` -- fiabiliser les tests existants
- `_bmad-output/implementation-artifacts/1-1-saisie-mitraillette-de-taches-simples.md` -- cocher les findings `[Patch]` résolus

## Tasks & Acceptance

**Execution:**
- [x] `src/db.js` -- passer la table `tasks` en clé primaire `id` (UUID v4 généré à l'insertion, pas `++id`), ajouter `categoryId`, `plannedDayId`, `checklist` au schéma (nullable/vide par défaut), ne garder qu'un seul export (`db` nommé, retirer le `export default` redondant ou l'inverse — choisir une convention et l'appliquer partout) -- aligne le schéma sur `epic-1-context.md` et lève l'incohérence d'export
- [x] `src/components/ProgressiveInput.jsx` -- générer l'`id` UUID v4 et vider/refocaliser le champ de façon optimiste avant l'`await db.tasks.add`, englober l'appel dans un `try/catch` pour éviter les rejets non gérés, désactiver brièvement le champ ou neutraliser les soumissions concurrentes tant que l'ajout précédent n'est pas confirmé -- corrige les findings "effacement non instantané", "promesses non gérées", "conditions de course"
- [x] `src/components/TaskCard.jsx` -- remplacer toute valeur de statut `done` par `completed` (lecture et écriture), revoir les attributs ARIA de la case à cocher (rôle/état correctement exposés à un lecteur d'écran) -- corrige "statut invalide" et "déficiences ARIA"
- [x] `src/components/TaskList.jsx` -- filtrer la requête `useLiveQuery` sur `status === 'inbox'`, distinguer explicitement l'état "chargement" (valeur par défaut sentinelle, ex. `undefined`) de l'état "liste vide", et gérer une erreur de requête avec un message doux -- corrige "TaskList ne filtre pas", "états de chargement/erreur manquants"
- [x] `src/App.jsx` -- remplacer le conteneur de contenu principal par une balise `<main>` sémantique -- corrige "manquement de balise sémantique"
- [x] `src/db.test.js` -- adapter les assertions de schéma pour un `id` UUID v4 (regex/format) et un statut `inbox`/`completed` -- garde la couverture de test alignée sur le nouveau schéma
- [x] `src/components/ProgressiveInput.test.jsx` -- fiabiliser l'assertion de vidage instantané (vérifier la valeur du champ synchronement après `keyDown`, avant toute résolution de promesse) -- corrige "tests potentiellement instables"
- [x] `_bmad-output/implementation-artifacts/1-1-saisie-mitraillette-de-taches-simples.md` -- cocher les 9 findings `[Patch]` une fois résolus, ajouter une entrée au Change Log -- traçabilité de la revue

**Acceptance Criteria:**
- Given le champ de saisie contient un titre, when l'utilisateur appuie sur "Entrée", then une tâche est créée avec un `id` UUID v4 et `status: 'inbox'`, et le champ est vidé/refocalisé avant que la promesse Dexie ne soit résolue.
- Given une tâche est marquée terminée, when on relit son enregistrement, then `status` vaut `completed` (jamais `done`), et elle n'apparaît plus dans `TaskList`.
- Given `db.tasks.add` échoue (ex. quota dépassé), when l'ajout est tenté, then aucune exception non gérée ne remonte à la console et un retour visuel doux informe l'utilisateur.
- Given la page se charge, when le contenu principal est inspecté, then il est contenu dans une balise `<main>`.

## Spec Change Log

## Design Notes

Pour l'UUID v4, utiliser `crypto.randomUUID()` (disponible nativement dans tous les navigateurs ciblés, aucune dépendance à ajouter). Le champ `checklist` peut être initialisé à `[]` par défaut pour ne pas complexifier Story 1.1 tout en respectant le schéma cible de l'épique.

## Verification

**Commands:**
- `npm run test` -- expected: tous les tests passent, y compris les tests adaptés au nouveau schéma
- `npm run build` -- expected: build production sans erreur
- `npm run lint` -- expected: aucune erreur/avertissement

**Manual checks (if no CLI):**
- Vérifier au clavier (lecteur d'écran ou audit ARIA) que la case à cocher de `TaskCard` annonce correctement son état.

## Suggested Review Order

**Schéma de données (UUID + migration)**

- Point d'entrée : nouveau schéma avec `id` UUID, `categoryId`, `plannedDayId` ; version bumpée pour migrer proprement les bases locales existantes.
  [`db.js:5`](../../src/db.js#L5)

**Saisie optimiste et robustesse (ProgressiveInput)**

- Génération de l'UUID protégée par `try/catch` pour éviter un blocage définitif si `crypto.randomUUID()` échoue.
  [`ProgressiveInput.jsx:18`](../../src/components/ProgressiveInput.jsx#L18)
- Échec Dexie catché : restaure le texte sans écraser une saisie plus récente, affiche un message doux.
  [`ProgressiveInput.jsx:40`](../../src/components/ProgressiveInput.jsx#L40)
- Le message d'erreur se réinitialise dès que l'utilisateur retape, pour ne jamais rester bloqué.
  [`ProgressiveInput.jsx:55`](../../src/components/ProgressiveInput.jsx#L55)

**Statut et accessibilité (TaskCard)**

- `done` → `completed`, écriture protégée par `.catch()` pour ne jamais laisser un rejet non géré.
  [`TaskCard.jsx:7`](../../src/components/TaskCard.jsx#L7)
- Case à cocher passée en `role="checkbox"` + `aria-checked` avec activation clavier Entrée/Espace.
  [`TaskCard.jsx:19`](../../src/components/TaskCard.jsx#L19)

**Filtrage et états de chargement (TaskList)**

- Filtre sur `status === 'inbox'` ; `undefined` distingue le chargement de la liste vide, `'error'` gère l'échec de requête sans crash.
  [`TaskList.jsx:10`](../../src/components/TaskList.jsx#L10)

**Sémantique (App)**

- Contenu principal encapsulé dans une balise `<main>`.
  [`App.jsx:11`](../../src/App.jsx#L11)

**Tests**

- Assertions de schéma adaptées à l'UUID v4 et au vidage instantané du champ vérifié de façon synchrone.
  [`db.test.js:1`](../../src/db.test.js#L1)
  [`ProgressiveInput.test.jsx:15`](../../src/components/ProgressiveInput.test.jsx#L15)
