---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
---

# Implementation Readiness Assessment Report

**Date:** 2026-07-04
**Project:** RouteIn

## Document Inventory

### PRD
- Whole document: `_bmad-output/planning-artifacts/prds/prd-RouteIn-2026-07-02/prd.md` (5877 bytes, modifié le 2026-07-02)

### Architecture
- Whole document: `_bmad-output/planning-artifacts/architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md` (4860 bytes, modifié le 2026-07-02)

### UX Design
- Folder: `_bmad-output/planning-artifacts/ux-designs/ux-RouteIn-2026-07-02/`
  - `DESIGN.md` (3565 bytes)
  - `EXPERIENCE.md` (4584 bytes)

### Epics & Stories
- Whole document: `_bmad-output/planning-artifacts/epics.md` (13781 bytes, modifié le 2026-07-02)

### Documents complémentaires notés (contexte)
- `_bmad-output/specs/spec-epic-2-journees-types/SPEC.md` (modifié le 2026-07-04 — le plus récent)
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-07-02.md` (rapport précédent)
- `_bmad-output/implementation-artifacts/epic-1-retro.md`, `epic-1-context.md` (Epic 1 déjà implémenté)

## Issues Found

- Aucun doublon (complet + sharded) détecté pour PRD, Architecture, Epics ou UX.
- Aucun document requis manquant.
- L'Epic 1 semble déjà implémenté ; cette évaluation portera principalement sur la préparation de l'Epic 2 et la cohérence globale des specs.

**Documents retenus pour l'évaluation :**
- PRD: `prds/prd-RouteIn-2026-07-02/prd.md`
- Architecture: `architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md`
- UX: `ux-designs/ux-RouteIn-2026-07-02/DESIGN.md` + `EXPERIENCE.md`
- Epics: `epics.md`
- Contexte additionnel: `specs/spec-epic-2-journees-types/SPEC.md`

## PRD Analysis

_Source : `prds/prd-RouteIn-2026-07-02/prd.md` (document unique, lu intégralement). Le PRD ne contient pas d'identifiants FR/NFR natifs ; les IDs ci-dessous reprennent, quand la correspondance est claire, la numérotation déjà utilisée dans `epics.md` afin de faciliter la traçabilité de l'étape suivante._

### Functional Requirements (ancrés textuellement dans le PRD)

FR1: Création de tâche via un champ unique obligatoire (le nom) — aucun autre champ requis à la création (§3.1).
FR2: Possibilité de renseigner les métadonnées (catégorie, durée, priorité, récurrence) dès la création ou plus tard — "enrichissement à la carte" (§3.1).
FR3: Suggestion contextuelle d'enrichissement (ex: catégorie) lorsqu'une tâche incomplète n'est pas réalisée et reportée (§3.1).
FR4: Création de "Journées types" (modèles de journée, ex: Télétravail, Repos), assignables aux jours de la semaine ou placées librement (§3.2).
FR5: Découpage de chaque Journée type en "Plages horaires typées" (blocs de temps liés à une catégorie/activité, avec heure de début/fin) (§3.2).
FR6: Définition manuelle et libre des catégories par l'utilisateur, subjectives (§3.2).
FR7 (fiche tâche): Fiche tâche détaillée **optionnelle**, indépendante du calendrier, comportant durée estimée, catégorie, **périodicité**, heure de début/limite (§3.3).
FR7 (checklists): Checklists textuelles internes ("prérequis simplifiés") à l'intérieur de la fiche tâche, avec indicateur visuel de préparation nécessaire (§3.3).
FR8: Gestion de 3 niveaux de priorité — Non négociable, Reportable, Vraiment pas obligé (niveau par défaut) (§3.4).
FR9: Mécanisme de "Saut de cycle" (amnésie bienveillante) — une tâche de routine "Reportable" non réalisée est reportée au **prochain créneau libre dédié à sa catégorie**, jamais simplement au lendemain (§3.4).
FR10: Moteur de suggestion (fonctionnalité **optionnelle**) proposant des tâches pertinentes (échéance, priorité, catégorie, préparation) pour les plages creuses ou génériques (§3.5).
FR12 (vue): Vue hebdomadaire synthétique de la semaine (§3.6).
FR12 (export): Export au format PDF et impression du planning (§3.6).
FR-local: Fonctionnement intégralement hors-ligne (Local-first), données stockées localement sur l'appareil (§3.7) — redondant avec NFR3 ci-dessous (le PRD liste cette exigence à la fois comme fonctionnalité coeur §3.7 et comme NFR §4.1).

Total FRs ancrés dans le texte du PRD : **10 thèmes fonctionnels distincts** (une partie correspondant à des FR composites dans epics.md, ex. FR7 couvre deux aspects distincts, FR12 en couvre deux).

**Écart de nommage :** le terme "mitraillette" (saisie rapide en rafale) utilisé dans `epics.md`, `project-context.md` et les stories n'apparaît nulle part dans le PRD — c'est une reformulation/interprétation du principe "création sans friction" du §3.1. Non bloquant, mais à noter.

**IDs présents dans `epics.md` mais sans ancrage textuel explicite dans le PRD :**
- FR11 "Vue principale (Aujourd'hui)" — non décrite comme fonctionnalité distincte dans le PRD (dérivée logiquement du concept de Plages horaires, mais jamais énoncée).
- FR13 "duplication d'une semaine passée" — la planification manuelle est bien dans le PRD (§3.2 implicitement), mais la **duplication de semaine** n'est mentionnée nulle part dans le PRD.
- FR14 "Drag & Drop et Swipe-to-edit" — mécanismes d'interaction non mentionnés dans le PRD (probablement issus des documents UX).

### Non-Functional Requirements (ancrés textuellement dans le PRD)

NFR1: Application web responsive, potentiellement PWA (§4.1).
NFR2: Compatibilité des principaux navigateurs (Chrome, Safari, Firefox, Edge) et adaptation à toutes les tailles d'écran (Mobile, Tablette, Bureau) (§4.1).
NFR3: Stockage exclusivement local (IndexedDB/LocalStorage ou équivalent) garantissant un fonctionnement 100% hors-ligne (§4.1).
NFR4: Mécanisme manuel d'export de l'intégralité des données (Journées types, tâches, historiques) en fichier structuré (JSON), avec import pour restauration complète (§4.2).

Total NFRs ancrés dans le texte du PRD : **4**.

**IDs présents dans `epics.md` mais absents du PRD lu :**
- NFR5 "Hitboxes 44x44px" — absent du PRD ; apparaît dans `project-context.md` et `epics.md` uniquement (probablement dérivé des documents UX, jamais remonté dans le PRD).
- NFR6 "Contrastes / Dynamic Type" — même constat.

### Additional Requirements / Constraints

- **Hors périmètre (§5, mais positionné AVANT la section 4 "NFR" dans le document — anomalie de structure/numérotation, purement cosmétique) :**
  - Aucune intégration calendrier native (lecture/écriture Google/Apple Calendar).
  - Aucun widget natif d'écran d'accueil.
- Le postulat produit (charge cognitive d'initiation, effet boule de neige, culpabilité) est un principe directeur transverse plutôt qu'une exigence técnique — sert de critère d'arbitrage UX mais n'est pas testable en soi.

### PRD Completeness Assessment

- Le PRD est clair sur la vision produit et les principes directeurs, mais **n'utilise pas d'identifiants FR/NFR natifs** — la numérotation exploitée dans `epics.md` a été construite a posteriori par l'agent qui a créé les epics, sans qu'un retour n'ait mis à jour le PRD source. Risque de dérive de traçabilité si le PRD est modifié sans repasser par epics.md.
- **Écart significatif détecté :** le §3.3 exige explicitement que la fiche tâche permette de renseigner la **périodicité (récurrence)**, la **durée estimée** et une **heure de début/limite** propre à la tâche. Aucune story dans `epics.md` (Story 1.3 ne couvre que catégorie + priorité) ni l'architecture ne traite la récurrence ou la durée/heure limite d'une tâche — l'architecture mentionne même explicitement vouloir *empêcher* "un moteur de récurrence infinie complexe" (ARCHITECTURE-SPINE.md), ce qui suggère que cette exigence PRD a été sciemment mise de côté sans que le PRD ou les epics ne le documentent formellement. **Ceci est un candidat fort de gap de couverture à confirmer à l'étape 3.**
- Deux NFR (NFR5, NFR6) et trois FR (FR11, FR13, FR14) circulent dans `epics.md`/`project-context.md` sans existence dans le PRD source — dérive de traçabilité ascendante (le PRD n'a pas été mis à jour pour refléter les décisions UX/architecture ultérieures).
- Aucune exigence n'est quantifiée avec des critères de vérification objectifs (pas de seuils de performance, pas de définition de "fluide").

## Epic Coverage Validation

### Epic FR Coverage Extraite (depuis `epics.md`)

FR1 → Epic 1 (Story 1.1) — done
FR2 → Epic 1 (Story 1.3) — done, **partiel** (voir ci-dessous)
FR3 → Epic 3 (Story 3.3) — backlog
FR4 → Epic 2 (Story 2.1) — ready-for-dev
FR5 → Epic 2 (Story 2.1) — ready-for-dev
FR6 → Epic 1 (Story 1.3) — done
FR7 (checklists) → Epic 1 (Story 1.4) — done
FR8 → Epic 1 (Story 1.3) — done
FR9 → Epic 3 (Story 3.2) — backlog
FR10 → Epic 4 (Story 4.2) — backlog
FR11 → Epic 2 (Story 2.3) — backlog
FR12 (vue semaine) → Epic 4 (Story 4.1) — backlog
FR12 (export) → Epic 4 (Story 4.1) — backlog
FR13 → Epic 2 (Story 2.2) — backlog
FR14 → Epic 3 (Story 3.1) — backlog

### Coverage Matrix

| Exigence PRD | Contenu | Couverture Epic/Story | Statut |
| --- | --- | --- | --- |
| FR1 | Création tâche, nom seul | Epic 1 / Story 1.1 | ✓ Couvert |
| FR2 (catégorie+priorité) | Enrichissement à la carte | Epic 1 / Story 1.3 | ✓ Couvert |
| FR2 (**durée estimée, périodicité, heure début/limite**) | Fiche tâche complète (§3.3) | **AUCUNE STORY** | ❌ MANQUANT |
| FR3 | Suggestion contextuelle au report | Epic 3 / Story 3.3 | ✓ Couvert |
| FR4 | Journées types | Epic 2 / Story 2.1 | ✓ Couvert |
| FR5 | Plages horaires typées | Epic 2 / Story 2.1 | ✓ Couvert |
| FR6 | Catégories manuelles libres | Epic 1 / Story 1.3 | ✓ Couvert |
| FR7 (checklists) | Checklists internes | Epic 1 / Story 1.4 | ✓ Couvert |
| FR8 | 3 niveaux de priorité | Epic 1 / Story 1.3 | ✓ Couvert |
| FR9 | Saut de cycle | Epic 3 / Story 3.2 | ✓ Couvert |
| FR10 | Moteur de suggestion | Epic 4 / Story 4.2 | ✓ Couvert |
| FR12 | Vue semaine + export | Epic 4 / Story 4.1 | ✓ Couvert |
| FR-local (§3.7 hors-ligne) | Local-first | Transverse (AR2/Dexie, toutes stories) | ✓ Couvert (infrastructure, pas de story dédiée — acceptable) |
| NFR1 (**volet PWA**) | PWA installable (manifest, service worker) | **AUCUNE STORY, aucune dépendance `vite-plugin-pwa` installée** | ❌ MANQUANT |
| NFR1 (volet responsive) | Adaptation Mobile/Tablette/Bureau | Transverse (CSS, non vérifié par story dédiée) | ⚠️ Implicite, non testé explicitement |
| NFR2 | Compatibilité navigateurs | Aucune story dédiée | ⚠️ Non vérifié explicitement |
| NFR3 | Stockage local exclusif | Transverse (AR2/Dexie) | ✓ Couvert |
| NFR4 | Export/Import JSON | Epic 4 / Story 4.3 | ✓ Couvert |

### Missing Requirements

#### Critical Missing FRs

**FR2 (fiche tâche — durée estimée, périodicité, heure de début/limite)** — §3.3 du PRD exige explicitement que la fiche tâche permette de renseigner une durée estimée, une périodicité (récurrence) et une heure de début/limite propre à la tâche. Seule la catégorie et la priorité sont couvertes (Story 1.3). Aucune story ne traite la récurrence ou la planification temporelle au niveau de la tâche elle-même.
- **Impact :** Sans heure limite/durée sur la tâche, le moteur de suggestion (FR10) et la logique de "créneau adapté" perdent une partie de leurs critères de pertinence annoncés dans le PRD (§3.5 mentionne explicitement "l'échéance" comme critère de suggestion). L'architecture (`ARCHITECTURE-SPINE.md`) indique vouloir *empêcher* un moteur de récurrence complexe, ce qui pourrait être une décision de simplification volontaire — mais ni le PRD ni les epics ne documentent formellement cet arbitrage (scope cut) ni s'il s'agit d'un report (backlog) ou d'un abandon définitif.
- **Recommandation :** Clarifier avec le Product Owner si "périodicité" et "heure limite" sont un abandon de périmètre assumé (auquel cas mettre à jour le PRD et retirer la mention de §3.3) ou une story manquante à ajouter à l'Epic 1 ou 2.

**NFR1 — volet PWA** — Le PRD (§4.1) et `project-context.md` mentionnent une PWA avec `vite-plugin-pwa`, mais aucune dépendance n'est installée dans `package.json` et aucune story de l'epic-breakdown ne couvre le manifest, le service worker, ou l'installabilité.
- **Impact :** Le NFR "fonctionnement 100% hors-ligne" (§3.7/§4.1) est actuellement assuré uniquement par IndexedDB (les données survivent), mais sans service worker l'**application elle-même** (le shell HTML/JS) ne se chargera pas sans connexion réseau après un simple rafraîchissement navigateur — ce qui contredit une partie de la promesse "hors-ligne" du PRD.
- **Recommandation :** Ajouter une story dédiée (probablement dans Epic 4 ou une story technique transverse) pour l'intégration `vite-plugin-pwa` avant la fin du projet, ou documenter explicitement ce report.

#### High Priority Missing FRs

- **NFR2 (compatibilité navigateurs)** et **volet responsive de NFR1** : aucune story ne prévoit de vérification/test explicite multi-navigateurs ou multi-tailles d'écran ; actuellement implicite/best-effort via le CSS. Risque faible à moyen, à surveiller lors des tests manuels (cf. limite `jsdom` déjà documentée dans `project-context.md`).

### Coverage Statistics

- Total FR/NFR thématiques identifiés dans le PRD : 14 (10 FR + 4 NFR, en comptant les items composites séparément)
- Couverts intégralement par une story : 10
- Couverts partiellement : 1 (FR2)
- Non couverts (manquants) : 2 (FR2-fiche tâche complète, NFR1-PWA)
- Non vérifiés explicitement (mais probablement couverts implicitement) : 2 (NFR1-responsive, NFR2-compat navigateurs)
- **Taux de couverture stricte : ~71% (10/14)** ; ~86% en comptant les couvertures implicites/transverses comme acceptables.

## UX Alignment Assessment

### UX Document Status

**Trouvé.** `DESIGN.md` (design tokens, style "Zen") + `EXPERIENCE.md` (IA, flows, accessibilité) dans `ux-designs/ux-RouteIn-2026-07-02/`. Statut `final`, lus intégralement.

### UX ↔ PRD Alignment

- L'architecture de l'information (Tabs Aujourd'hui / Semaine / Dépôt / Configuration) et les flows (Marie/Marc) traduisent fidèlement la vision du PRD (charge cognitive réduite, amnésie bienveillante). Bon alignement narratif global.
- **Confirmation d'une origine UX pour des exigences absentes du PRD** (déjà repérées à l'étape 2) :
  - Les mécanismes **Swipe-to-edit** et **Drag & Drop** (§6 de `EXPERIENCE.md`, source de FR14) sont définis uniquement dans l'UX, jamais énoncés dans le PRD — le PRD ne décrit aucune modalité d'interaction concrète pour "manipuler" les tâches.
  - Les exigences d'accessibilité **NFR5 (hitboxes 44x44px)** et **NFR6 (contraste/Dynamic Type)** proviennent explicitement de `EXPERIENCE.md` §7 "Accessibility Floor" — le PRD (§4) ne les mentionne pas du tout alors que ce sont des NFR à part entière. Le PRD devrait être mis à jour pour les inclure formellement (actuellement l'UX est la seule source de vérité pour ces deux NFR).
- **Nouvelle incohérence détectée (croisement UX × Architecture) :** `EXPERIENCE.md` §6 précise que le "Swipe-to-edit" vers la droite "ouvre le menu d'enrichissement (**Catégorie, Durée**)", et §5 évoque une tâche qui "franchit son **heure limite**". Cela présuppose que la tâche porte une **durée** et une **heure limite** propres — exactement les champs du §3.3 du PRD (FR2) déjà signalés comme non couverts par aucune story à l'étape 3. **Ce même gap est donc visible sur les trois couches (PRD §3.3, UX §5/§6, et l'absence dans le modèle de données de l'architecture — voir ci-dessous) sans qu'aucun document ne l'ait formellement acté comme hors périmètre.** C'est le finding le plus consolidé de cette évaluation.

### UX ↔ Architecture Alignment

- **PWA :** l'architecture (`ARCHITECTURE-SPINE.md`, table Stack) liste explicitement `vite-plugin-pwa` en cohérence avec le "Form-factor PWA" de `EXPERIENCE.md` §1 — alignement documentaire correct. Mais comme noté à l'étape 3, **rien n'est encore installé ni implémenté** : l'alignement n'existe qu'au niveau des specs, pas du code.
- **Champ "Durée" / "Heure limite" absent du modèle de données :** l'entité `TASK` du schéma ERD (`ARCHITECTURE-SPINE.md`, Structural Seed) ne comporte **aucun champ** `duration`, `dueTime`, ni `recurrence`/`periodicity` — seulement `id, title, status, priority, categoryId, plannedDayId, checklist`. Ceci confirme au niveau du schéma que l'architecture n'a pas prévu la Durée/Périodicité/Heure-limite pourtant attendues par le PRD (§3.3) et par l'UX (menu d'enrichissement "Durée", "heure limite" dans le Saut de cycle).
- **Décision de scope non documentée en amont :** `AD-2` de l'architecture indique explicitement vouloir *empêcher* "un moteur de récurrence infinie complexe ou imprévisible" — ce qui ressemble à une décision consciente de retirer la "périodicité" du périmètre réel. Cette décision d'architecture contredit silencieusement le PRD §3.3 sans qu'aucune mise à jour du PRD ou des epics ne l'enregistre formellement.
- Le reste de l'alignement est bon : couleurs/catégories (`CATEGORY.color` ↔ Time Block teinté), stockage checklist en JSON (`TASK.checklist` ↔ "Checklists internes"), UUID v4, conventions de nommage — tout est cohérent entre UX, Architecture et `project-context.md`.

### Warnings

- ⚠️ Le PRD n'a pas été mis à jour pour refléter les NFR d'accessibilité (NFR5, NFR6) ni les mécanismes d'interaction (Drag & Drop, Swipe-to-edit) définis unilatéralement dans l'UX — dérive de traçabilité ascendante UX → PRD à corriger si le PRD doit rester la source de vérité contractuelle.
- ⚠️ **Décision à trancher avant Epic 2/3 :** la "Durée estimée" et "l'heure limite" de la tâche (attendues par le PRD et l'UX) sont absentes du schéma de données. Si elles ne sont pas ajoutées à `TASK` avant l'implémentation d'Epic 2/3, les stories 2.x/3.x qui en dépendent implicitement (Saut de cycle, Moteur de suggestion basé sur "l'échéance") risquent une reprise d'architecture (migration Dexie) plus tard. Recommandation : trancher **avant** de démarrer Epic 2.

## Epic Quality Review

_Revue de `epics.md` (4 epics, 14 stories au total dont 4 déjà `done`) selon les standards create-epics-and-stories : valeur utilisateur, indépendance des epics, dépendances inter-stories, dimensionnement, et rigueur des critères d'acceptation._

### Structure générale

- Les 4 epics sont bien **centrés utilisateur** (aucun "Setup Database"/"API Development" nu) : "L'Inbox", "La Structure du temps", "Le Moteur d'Amnésie Bienveillante", "Vue d'Ensemble, Suggestions et Sauvegardes". ✓
- Story 1.2 ("Environnement de Test Local") est une story technique (persona "Développeur") au sein de l'Epic 1 — **acceptable** : c'est une story de setup d'environnement pour projet greenfield, conforme à la règle qui l'autorise explicitement.
- Aucune dépendance arrière cassée détectée (aucune story ne référence une story future comme prérequis bloquant explicite).

### 🔴 Violations Critiques

Aucune violation critique détectée (pas d'epic purement technique, pas de story de taille "epic", pas de dépendance circulaire).

### 🟠 Problèmes Majeurs

1. **Indépendance d'Epic 2 fragilisée par Epic 3.** Epic 2 livre les Journées Types, Plages Horaires et la vue "Aujourd'hui", mais **aucune story d'Epic 1 ou 2 ne permet d'attacher une tâche à une Plage Horaire** — ce mécanisme n'existe que via le Drag & Drop de la Story 3.1 (FR14, Epic 3). Résultat : à l'issue d'Epic 2 seul, l'utilisateur voit des plages horaires vides sans aucun moyen de les remplir. C'est cohérent avec la description volontairement restreinte de l'Epic 2 ("structurer... et planifier", sans "affecter des tâches"), mais cela réduit fortement la valeur démontrable de l'epic pris isolément.
   - **Recommandation :** soit documenter explicitement dans `epics.md` que la valeur d'Epic 2 est partielle/structurelle tant qu'Epic 3 n'est pas livré, soit ajouter un mécanisme minimal non-D&D (ex: bouton "Assigner au Dépôt") pour rendre Epic 2 démontrable seul.
2. **Story 4.2 (Moteur de suggestion) sous-implémente FR10.** Le PRD §3.5 définit 4 critères de suggestion (échéance, priorité, catégorie, préparation) ; l'AC de la Story 4.2 ne filtre que par **catégorie**. C'est cohérent avec l'absence de champ "échéance/durée" déjà signalée, mais la **priorité** et la **préparation** (checklist complète ou non) sont également absentes des critères effectifs alors qu'aucune donnée ne manque pour les implémenter (elles existent déjà dans le modèle `TASK`).
   - **Recommandation :** enrichir l'AC de la Story 4.2 pour couvrir priorité et état de préparation, ou documenter explicitement une réduction de périmètre v1 assumée.
3. **Absence de story "Starter Template" dédiée.** L'architecture (AR1) exige un starter template React + Vite + Vanilla CSS ; la règle de best-practice demande que la Story 1 de l'Epic 1 soit "Set up initial project from starter template". Dans les faits, le scaffold a été réalisé de façon informelle lors du commit initial (`Initial commit: RouteIn PWA scaffold...`), en dehors du périmètre formel des stories. Rétroactif et non bloquant, mais à corriger dans le process pour les futurs projets démarrés sur ce même patron.

### 🟡 Concerns Mineurs

1. **Critères d'acceptation limités au chemin nominal**, sans cas d'erreur/limite, sur plusieurs stories :
   - Story 2.1 : aucune validation si l'heure de fin précède l'heure de début, ni gestion du chevauchement de deux plages horaires.
   - Story 2.2 : aucun AC pour le cas où une date possède déjà une Journée planifiée (écrasement ? refus ? fusion ?).
   - Story 3.1 : aucun AC pour un dépôt (drop) invalide ou hors cible.
2. **Story 2.3** ne couvre que le cas "toute première ouverture" (onboarding). Le comportement normal de la vue "Aujourd'hui" les jours suivants (quand une Journée planifiée existe déjà, ou n'existe pas encore) n'est pas explicitement spécifié par un AC dédié — actuellement implicite.
3. Story 1.2 (déjà `done`) a un AC légèrement vague ("tous les outils nécessaires (Node.js, Vite, etc.)") — sans impact puisque la story est terminée.

### Checklist de conformité (synthèse)

| Critère | Statut |
| --- | --- |
| Chaque epic livre une valeur utilisateur | ✓ |
| Chaque epic fonctionne indépendamment des epics suivants | ⚠️ Epic 2 partiellement (voir Majeur #1) |
| Stories correctement dimensionnées | ✓ |
| Aucune dépendance en avant bloquante | ✓ |
| Tables DB créées au moment du besoin | ✓ |
| Critères d'acceptation clairs | ⚠️ Chemins d'erreur souvent absents (voir Mineurs) |
| Traçabilité vers les FR maintenue | ⚠️ Voir gaps FR2/NFR1 (étapes 3 et 4) |

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK** — Epic 1 est terminé et solide. Epic 2 (Story 2.1 `ready-for-dev` sur la branche `epic-2`) peut démarrer, mais **une décision de scope doit être tranchée avant de coder Epic 2/3** pour éviter une migration de schéma Dexie a posteriori, et une erreur factuelle doit être corrigée dans la story déjà générée.

### Critical Issues Requiring Immediate Action

1. **Story 2.1 contient une information technique erronée.** La section "Latest Tech Information" indique "React 18 et Vite 5", alors que `package.json` et `project-context.md` confirment **React ^19.2.7 / Vite ^8.1.1**. À corriger avant que le développeur ne commence l'implémentation, pour éviter l'usage de patterns React 18 obsolètes.
2. **Décision de scope non tranchée : Durée / Périodicité / Heure-limite de la tâche.** Le PRD §3.3 et l'UX (`EXPERIENCE.md` §5-§6) attendent ces champs sur la fiche tâche, mais ils sont **absents du schéma `TASK`** dans `ARCHITECTURE-SPINE.md`, et l'architecture (AD-2) semble avoir tranché silencieusement pour les exclure ("empêcher un moteur de récurrence complexe"). Cette absence affaiblit directement Epic 3 (Saut de cycle basé sur "l'échéance") et Epic 4 (Moteur de suggestion, qui ne filtre déjà que par catégorie). **À trancher avec le Product Owner avant de démarrer le développement d'Epic 2**, sans quoi une migration Dexie sera nécessaire plus tard.
3. **NFR1 (PWA) jamais implémenté.** `vite-plugin-pwa` est prévu dans l'architecture mais absent de `package.json` ; aucune story ne couvre le manifest/service worker. À planifier explicitement (nouvelle story) ou à documenter comme reporté.

### Recommended Next Steps

1. Corriger immédiatement la section "Latest Tech Information" de la Story 2.1 (React 19 / Vite 8, pas React 18 / Vite 5).
2. Statuer avec Sylvain (Product Owner) sur le sort de "Durée estimée / Périodicité / Heure-limite" : soit les ajouter au modèle `TASK` maintenant (avant Epic 2), soit acter formellement leur abandon et mettre à jour le PRD (§3.3) et `epics.md` en conséquence.
3. Ajouter une story dédiée à l'intégration `vite-plugin-pwa` (manifest, service worker, installabilité) dans le backlog, ou documenter explicitement son report en `deferred-work.md`.
4. Enrichir l'AC de la Story 4.2 (Moteur de suggestion) pour couvrir priorité et état de préparation, en cohérence avec le §3.5 du PRD — ou documenter une réduction de scope v1 assumée.
5. Mettre à jour le PRD pour intégrer rétroactivement NFR5 (hitboxes 44x44px), NFR6 (contraste/Dynamic Type) et les mécanismes d'interaction (Drag & Drop, Swipe-to-edit) actuellement définis uniquement dans l'UX, afin que le PRD reste la source de vérité contractuelle.
6. Ajouter des critères d'acceptation pour les cas limites identifiés en Story 2.1 (chevauchement de plages), 2.2 (date déjà planifiée) et 3.1 (dépôt invalide).

### Final Note

Cette évaluation a identifié **3 problèmes critiques**, **3 problèmes majeurs** et **~6 concerns mineurs** répartis sur 5 catégories (couverture PRD, alignement UX/Architecture, qualité des epics, et un défaut factuel dans la story déjà générée pour Epic 2). Rien n'est bloquant au point d'empêcher tout travail, mais le point 2 (Durée/Périodicité/Heure-limite) mérite d'être tranché **avant** d'entamer le développement d'Epic 2 pour éviter une reprise d'architecture.

---
**Évaluation réalisée par :** Agent PM (Claude Code, bmad-check-implementation-readiness)
**Date :** 2026-07-04
