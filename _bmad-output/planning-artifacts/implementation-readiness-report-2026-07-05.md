---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
---

# Implementation Readiness Assessment Report

**Date:** 2026-07-05
**Project:** RouteIn

## Document Inventory

### PRD
- **Sharded:** `_bmad-output/planning-artifacts/prds/prd-RouteIn-2026-07-02/prd.md` (7 609 octets, modifié 05 juil. 19:22)

### Architecture
- **Sharded:** `_bmad-output/planning-artifacts/architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md` (8 615 octets, modifié 05 juil. 19:28)

### Epics & Stories
- **Whole:** `_bmad-output/planning-artifacts/epics.md` (15 018 octets, modifié 05 juil. 19:22)

### UX Design
- **Sharded:** `_bmad-output/planning-artifacts/ux-designs/ux-RouteIn-2026-07-02/DESIGN.md` (3 565 octets, modifié 02 juil. 21:13)
- **Sharded:** `_bmad-output/planning-artifacts/ux-designs/ux-RouteIn-2026-07-02/EXPERIENCE.md` (4 584 octets, modifié 02 juil. 21:13)

### Documents additionnels détectés (hors périmètre standard)
- **Spec :** `_bmad-output/planning-artifacts/specs/spec-RouteIn/SPEC.md` (4 388 octets, modifié 05 juil. 19:31) — non tracké par git, potentiellement pertinent pour la traçabilité des exigences.

## Issues Found

Aucun doublon (whole + sharded) détecté pour aucun type de document. Aucun document requis manquant.

## Files Selected for Assessment

- PRD: `prds/prd-RouteIn-2026-07-02/prd.md`
- Architecture: `architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md`
- Epics: `epics.md`
- UX: `ux-designs/ux-RouteIn-2026-07-02/DESIGN.md` + `EXPERIENCE.md`
- Spec (complémentaire): `specs/spec-RouteIn/SPEC.md`

## PRD Analysis

### Functional Requirements

_Note : le PRD ne numérote pas ses exigences (FR1, FR2…). La numérotation ci-dessous est introduite pour les besoins de la traçabilité de cette évaluation, basée sur les sections 3 (Fonctionnalités Principales) et 5 (Hors Périmètre)._

FR1: Création sans friction ("saisie mitraillette") — la création d'une tâche ne requiert que son nom, aucun autre champ (catégorie, durée, priorité, récurrence) n'est obligatoire.
FR2: Enrichissement à la carte — l'utilisateur peut renseigner les métadonnées dès la création ou plus tard.
FR3: Enrichissement contextuel au report — lorsqu'une tâche incomplète n'est pas réalisée, l'interface suggère de l'enrichir (ex : catégorie) pour faciliter son prochain placement.
FR4: Journées types — création de modèles de journées (ex : télétravail, repos), assignables aux jours de la semaine ou placées librement.
FR5: Plages horaires typées — chaque journée type est découpée en blocs de temps dédiés à des catégories/activités définies manuellement par l'utilisateur.
FR6: Fiche tâche détaillée optionnelle — indépendante du calendrier, permettant l'enrichissement (catégorie, priorité) ; périodicité complexe et heures strictes volontairement hors périmètre.
FR7: Prérequis simplifiés (checklists internes) — liste textuelle de sous-actions à l'intérieur de la fiche tâche ; l'interface signale si une tâche nécessite encore de la préparation.
FR8: 3 niveaux de priorité — Non négociable, Reportable, Vraiment pas obligé (niveau par défaut).
FR9: Saut de cycle (anti-accumulation) — une tâche de routine "Reportable" non réalisée est reportée au prochain créneau libre dédié à sa catégorie, jamais simplement au lendemain.
FR10: Moteur de suggestion (fonctionnalité optionnelle) — propose des tâches pertinentes (échéance, priorité, catégorie, préparation) pour remplir les plages horaires creuses ou génériques.
FR11: Vue hebdomadaire — affichage d'une vue synthétique de la semaine.
FR12: Export & impression — export au format PDF et possibilité d'impression.
FR13: Fonctionnement hors-ligne intégral (local-first) — l'application fonctionne sans connexion Internet, données stockées localement.
FR14: Manipulation intuitive — Drag & Drop pour assigner une tâche à une plage horaire.
FR15: Swipe-to-edit — modification ou report rapide d'une tâche par geste tactile.
FR16 (contrainte négative): Pas d'intégration calendrier natif (lecture/écriture) avec Google Calendar / Apple Calendar / agenda natif — système fermé.
FR17 (contrainte négative): Pas de widgets natifs d'écran d'accueil.

Total FRs: 17 (15 fonctionnalités positives + 2 exclusions de périmètre à respecter comme contraintes)

### Non-Functional Requirements

NFR1: Application web responsive, conçue potentiellement comme PWA.
NFR2: Compatibilité multi-navigateurs (Chrome, Safari, Firefox, Edge) et multi-écrans (mobile, tablette, bureau).
NFR3: Stockage local exclusif (IndexedDB/LocalStorage ou équivalent) pour un fonctionnement 100% hors-ligne.
NFR4: Mécanisme manuel d'import/export intégral des données (format structuré, ex JSON) pour pallier la volatilité du stockage navigateur.
NFR5: Fiabilité des données locales — mutations en base (ex Dexie.js) protégées contre erreurs et conditions de course, pour empêcher toute perte de données silencieuse.
NFR6: Récupérabilité d'une base illisible/corrompue — écran de récupération avec option de réinitialisation (avertissement explicite de perte de données) plutôt qu'un écran bloqué.
NFR7: Cibles tactiles (hitboxes) d'au moins 44x44px.
NFR8: Accessibilité visuelle — contrastes conformes (texte sombre sur fond clair), support du Dynamic Type.
NFR9: Robustesse des interactions tactiles — les gestes complexes (swipe, drag & drop) ne doivent pas interférer avec les actions de base (clic, coche).

Total NFRs: 9

### Additional Requirements

- **Contraintes de périmètre (Section 5, Hors Périmètre) :** aucune intégration calendrier externe, aucun widget natif — traitées ci-dessus comme FR16/FR17 (contraintes négatives) car elles impactent directement ce qui ne doit PAS être développé, et doivent donc être vérifiées comme "non présentes" dans les epics/stories.
- **Postulat produit (Vision) :** l'« amnésie bienveillante » (protection contre la culpabilité / effet boule de neige) est un principe transversal qui infuse plusieurs FR (FR9 notamment) — à vérifier comme fil conducteur dans les epics, pas seulement comme feature isolée.
- **Public cible (Section 2) :** aucune exigence fonctionnelle directe, mais context motivant les FR liés à la structuration des routines et à la réduction de charge mentale.

### PRD Completeness Assessment

- Le PRD est concis et couvre vision, cible, fonctionnalités, périmètre exclu et NFR — structure globalement complète.
- **Défaut mineur de forme :** l'ordre des sections est incohérent — la section "5. Hors Périmètre" est physiquement placée avant la section "4. Exigences Non-Fonctionnelles" dans le fichier. Cela n'affecte pas le contenu mais nuit à la lisibilité/maintenance du document.
- **Absence de numérotation FR/NFR native** dans le document source — la traçabilité vers les epics sera donc qualitative (par thème) plutôt que par ID strict. Recommandation : envisager d'ajouter des identifiants FR/NFR explicites dans le PRD pour fiabiliser les futures traçabilités.
- Le document `SPEC.md` (hors périmètre standard de ce PRD) contient potentiellement des détails complémentaires ou dérivés — à croiser lors de la validation de couverture des epics si des écarts apparaissent.

## Epic Coverage Validation

**Constat préalable important :** `epics.md` possède sa **propre numérotation FR/NFR** (FR1-FR14, NFR1-NFR6), distincte de celle attribuée au PRD dans cette évaluation. La comparaison ci-dessous est donc faite **par contenu sémantique**, pas par identifiant numérique — les deux numérotations ne correspondent pas terme à terme.

### Coverage Matrix — Functional Requirements

| FR (PRD, cette éval.) | Exigence PRD | FR équivalent dans epics.md | Couverture Epic/Story | Statut |
|---|---|---|---|---|
| FR1 | Saisie mitraillette (nom seul) | FR1 | Epic 1 / Story 1.1 | ✓ Couvert |
| FR2 | Enrichissement à la carte | FR2 | Epic 1 / Story 1.3 | ✓ Couvert |
| FR3 | Enrichissement contextuel au report | FR3 | Epic 3 / Story 3.3 | ✓ Couvert |
| FR4 | Journées types | FR4 | Epic 2 / Story 2.1 | ✓ Couvert |
| FR5 | Plages horaires typées | FR5 | Epic 2 / Story 2.1 | ✓ Couvert |
| FR6 | Fiche tâche (catégorie/priorité) | FR6 (catégorisation libre) | Epic 1 / Story 1.3 | ✓ Couvert |
| FR7 | Checklists internes (prérequis) | FR7 | Epic 1 / Story 1.4 | ✓ Couvert |
| FR8 | 3 niveaux de priorité | FR8 | Epic 1 / Story 1.3 | ✓ Couvert |
| FR9 | Saut de cycle (anti-accumulation) | FR9 | Epic 3 / Story 3.2 | ✓ Couvert |
| FR10 | Moteur de suggestion | FR10 | Epic 4 / Story 4.2 | ✓ Couvert |
| FR11 | Vue hebdomadaire | FR12 | Epic 4 / Story 4.1 | ✓ Couvert |
| FR12 | Export PDF/Impression | FR12 | Epic 4 / Story 4.1 | ✓ Couvert |
| FR13 | Fonctionnement hors-ligne (local-first) | NFR2 (reclassé NFR dans epics) + Story 4.4 | Epic 4 / Story 4.4 | ✓ Couvert (déplacé en NFR) |
| FR14 | Drag & Drop | FR14 | Epic 3 / Story 3.1 | ✓ Couvert |
| FR15 | Swipe-to-edit | FR14 (fusionné avec Drag & Drop) | Epic 3 / Story 3.1 | ✓ Couvert |
| FR16 | *(Contrainte négative)* Pas d'intégration calendrier natif | — | Aucun epic n'introduit cette intégration | ✓ Respecté (absence vérifiée) |
| FR17 | *(Contrainte négative)* Pas de widgets natifs | — | Aucun epic n'introduit de widget natif | ✓ Respecté (absence vérifiée) |

**Écart de numérotation notable :** `epics.md` introduit deux éléments sans ancrage explicite et littéral dans le texte du PRD (élaborations raisonnables, probablement dérivées de l'Architecture/UX) :
- **Epics-FR11** (« Vue principale Aujourd'hui ») — le PRD ne mentionne qu'une vue hebdomadaire (section 3.6) ; une vue quotidienne n'est jamais explicitement demandée mais est une conséquence logique nécessaire pour exploiter Journées/Plages.
- **Epics-FR13** (« Planification par duplication d'une semaine passée ») — la fonction de duplication de semaine n'apparaît pas dans le texte du PRD (section 3.2 ne mentionne que l'assignation de modèles, pas la duplication).

Ces deux ajouts ne contredisent pas le PRD ni le périmètre exclu (Section 5) — ils représentent une extension de portée raisonnable mais **non tracée à la source**. À faire valider par le Product Owner (Sylvain) pour confirmer qu'ils sont intentionnels.

### Coverage Matrix — Non-Functional Requirements

| NFR (PRD, cette éval.) | Exigence PRD | NFR équivalent dans epics.md | Couverture Epic/Story | Statut |
|---|---|---|---|---|
| NFR1 | Web responsive / PWA | NFR1 | Epic 4 / Story 4.4 | ✓ Couvert |
| NFR2 | Compatibilité multi-navigateurs | NFR3 | Déclaré, pas de story dédiée | ✓ Couvert (déclaratif) |
| NFR3 | Stockage local exclusif (IndexedDB) | NFR2 + AR2 | Transversal (Dexie.js) | ✓ Couvert |
| NFR4 | Import/Export JSON | NFR4 | Epic 4 / Story 4.3 | ✓ Couvert |
| NFR5 | Fiabilité données locales (erreurs, conditions de course) | **absent** de la liste NFR d'epics.md | Aucune story ne porte d'AC dédié à ce sujet | ❌ **MANQUANT** |
| NFR6 | Récupérabilité base corrompue (écran de récupération) | **absent** de la liste NFR d'epics.md | Aucune story ne couvre ce cas | ❌ **MANQUANT** |
| NFR7 | Hitboxes 44x44px | NFR5 | Déclaré, pas de story dédiée | ✓ Couvert (déclaratif) |
| NFR8 | Contrastes + Dynamic Type | NFR6 | Déclaré, pas de story dédiée | ✓ Couvert (déclaratif) |
| NFR9 | Robustesse interactions tactiles (pas d'interférence swipe/clic) | **absent** de la liste NFR d'epics.md | Story 3.1 aborde partiellement (drop invalide) mais pas le conflit tactile swipe/clic | ❌ **MANQUANT** (partiel) |

### Missing Requirements

#### Critical Missing NFRs

**NFR5 — Fiabilité des données locales (erreurs, conditions de course) :**
- Impact : Risque de perte de données silencieuse ou de doublons lors de saisies rapides ("mitraillette"), un scénario explicitement au cœur de la proposition de valeur du produit (FR1). C'est déjà signalé comme règle de code dans `project-context.md`, mais **aucune story n'a d'AC vérifiable** pour ce comportement (ex : pas de test décrit garantissant l'absence de doublon en saisie rapide).
- Recommandation : Ajouter un AC explicite à la Story 1.1 (ou une story dédiée) couvrant la gestion des erreurs Dexie et la prévention des doublons/conditions de course.

**NFR6 — Récupérabilité d'une base illisible/corrompue :**
- Impact : Sans écran de récupération, une base corrompue bloquerait l'utilisateur sur un écran vide sans issue — contradiction directe avec la promesse de fiabilité du PRD (section 4.2). Aucun epic/story ne traite ce cas.
- Recommandation : Ajouter une story dédiée (probablement dans Epic 4, à côté de la Story 4.3 Sauvegarde) : détection d'échec d'ouverture de la base + écran de récupération avec option de réinitialisation.

#### High Priority Missing NFRs

**NFR9 — Robustesse des interactions tactiles (swipe vs clic) :**
- Impact : Le PRD et `project-context.md` signalent ce risque explicitement (interception de `setPointerCapture` bloquant les clics natifs). La Story 3.1 couvre le Drag & Drop et le Swipe-to-edit fonctionnellement, mais aucun AC ne garantit la non-interférence avec les clics/coches natifs.
- Recommandation : Ajouter un AC à la Story 3.1 précisant explicitement que le geste de swipe ne doit jamais bloquer un clic/tap sur un élément interactif (checkbox, bouton).

### Coverage Statistics

- Total PRD FRs (fonctionnels positifs) : 15 — **Couverts : 15/15 (100%)**
- Total PRD FRs (contraintes négatives) : 2 — **Respectées : 2/2 (100%)**
- Total PRD NFRs : 9 — **Couverts : 6/9 (67%)** — 3 NFR manquants (NFR5, NFR6, NFR9)
- Éléments epics.md sans ancrage PRD explicite (à valider) : 2 (Vue Aujourd'hui, Duplication de semaine)

## UX Alignment Assessment

### UX Document Status

**Trouvé.** `DESIGN.md` (design system : couleurs, typographie, composants) et `EXPERIENCE.md` (IA, tons, patterns d'interaction, flows) — statut `final`, datés du 2026-07-02.

### Résolutions apportées aux constats du Step 3

La lecture croisée UX + Architecture éclaircit deux points laissés ouverts à l'étape précédente :

- **« Vue Aujourd'hui » (epics-FR11)** — bien qu'absente du texte littéral du PRD, elle est explicitement spécifiée dans `EXPERIENCE.md` §2 (Information Architecture, "Tab 1 : Aujourd'hui (Home)"). **Ancrage confirmé côté UX**, non problématique.
- **« Duplication de semaine » (epics-FR13)** — absente du PRD et de l'UX, mais explicitement mandatée par `ARCHITECTURE-SPINE.md` (AD-2 : "action explicite (duplication de semaine) liant une Date à un DayTemplate"). **Ancrage confirmé côté Architecture**, non problématique.
- **NFR5 (fiabilité/conditions de course) et NFR6 (récupération de base corrompue)**, signalés au Step 3 comme absents de la couverture des epics, sont en réalité déjà traités comme **invariants contraignants de l'Architecture** : AD-7 (protection anti-doublon + contrainte d'unicité) et AD-5 (écran de récupération sur échec d'ouverture de base). Le problème n'est donc pas une architecture manquante, mais un **déficit de traçabilité Architecture → Epic/Story** : ces invariants ne sont opérationnalisés par aucun AC de story vérifiable (aucune story "écran de récupération", Story 1.1 ne mentionne pas de protection anti-doublon dans ses AC).

### Alignment Issues

**🔴 CRITIQUE — Conflit UX ↔ Architecture sur le champ « Durée » de la tâche :**
- `DESIGN.md` §7 (Task Card) : "Les métadonnées (catégorie, **durée**) apparaissent sous forme de pilules."
- `EXPERIENCE.md` §6 (Swipe-to-edit) : "Swiper vers la droite ouvre le menu d'enrichissement (Catégorie, **Durée**)."
- `ARCHITECTURE-SPINE.md` AD-4 (Tâches Minimalistes) : "L'entité `TASK` ne contient **intentionnellement aucun champ `duration`**... les tâches elles-mêmes sont intemporelles."
- Le PRD ne mentionne pas non plus de durée au niveau de la tâche (section 3.3).
- **Impact :** spécifications contradictoires — un développeur suivant l'UX ajouterait un champ que l'architecture interdit explicitement. Doit être tranché avant le développement des Stories 1.3 (enrichissement) et 3.1 (swipe-to-edit).
- **Recommandation :** retirer "Durée" de `DESIGN.md` et `EXPERIENCE.md`, sauf décision explicite de réviser AD-4.

**🟠 Pattern d'interaction non couvert par les stories :** le swipe-to-edit "vers la droite" (ouverture du menu d'enrichissement) décrit en `EXPERIENCE.md` §6 n'apparaît dans aucun AC de story. Story 3.1 ne couvre que le swipe gauche (annuler/renvoyer au Dépôt) ; Story 1.3 couvre l'enrichissement via l'ouverture des détails de la tâche, sans mention du geste swipe droit. Écart mineur entre le pattern d'interaction spécifié et les critères d'acceptation des stories.

**🟡 Fonctionnalité UX non planifiée :** la "Densité adaptative" (bascule vue Aérée/Dense, `DESIGN.md` §4) n'apparaît dans aucun epic/story. À clarifier si elle est intentionnellement différée ou oubliée.

### Warnings

- Aucun warning "UX manquante" — la documentation UX est complète et de bonne qualité.
- **Avant développement des Stories 1.3 et 3.1 :** trancher la contradiction sur le champ "Durée" (voir ci-dessus).
- **Avant le développement d'Epic 4 / infrastructure bas niveau :** les invariants AD-5 (écran de récupération) et AD-7 (anti-doublon) n'ont pas d'AC de story dédié — recommandation de créer une story explicite pour AD-5 et d'enrichir les AC de la Story 1.1 pour AD-7, afin d'éviter que ces garanties architecturales ne soient oubliées lors de l'implémentation.

## Epic Quality Review

Revue rigoureuse des 4 epics et 15 stories contre les standards de `create-epics-and-stories` (valeur utilisateur, indépendance des epics, absence de dépendances en avant, dimensionnement des stories, qualité des AC).

### Compliance Checklist par Epic

| Epic | Valeur utilisateur | Indépendance | Stories bien dimensionnées | Pas de dépendance en avant | Tables DB créées au bon moment | AC claires | Traçabilité FR |
|---|---|---|---|---|---|---|---|
| Epic 1 | ✓ (Story 1.2 technique tolérée) | ⚠️ Partiel | ✓ | ✓ | ✓ | ✓ | ✓ |
| Epic 2 | ✓ | ⚠️ Partiel | ✓ | ⚠️ Voir 2.3 | ✓ | ✓ | ✓ |
| Epic 3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Epic 4 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ (1 gap AC) | ✓ |

### 🔴 Critical Violations

**1. Aucune story de mise en place du starter template (violation directe de la règle 5A) :**
L'Architecture spécifie explicitement un starter template (AR1 : React + Vite + Vanilla CSS ; AR2 : Dexie.js/IndexedDB). Or aucune story ne produit ce livrable — la Story 1.1 présuppose silencieusement dans son *Given* : "après initialisation du projet React/Vite AR1 et configuration de Dexie.js AR2", sans qu'aucune story ne l'implémente réellement.
- **Recommandation :** créer une story "Epic 1 / Story 1.0 : Initialisation du projet depuis le starter template" couvrant le scaffolding React+Vite, l'installation des dépendances (Dexie.js, lucide-react, etc.) et la configuration initiale — à placer avant la Story 1.1.

**2. CI/CD absent de toute story :**
AR5 (Architecture) exige un déploiement automatisé GitHub Pages via GitHub Actions dès le merge sur `main`. Aucune story, dans aucun epic, ne couvre la mise en place de ce pipeline.
- **Recommandation :** ajouter une story dédiée (Epic 1 ou Epic 4, à trancher avec le Product Owner) pour le pipeline CI/CD et le déploiement GitHub Pages.

**3. (Rappel du Step 4) Écran de récupération de base corrompue (AD-5) sans story dédiée :**
Confirmé ici comme un vrai trou dans la structure des epics/stories, pas seulement un gap de couverture NFR — aucune story ne produit cet écran de récupération pourtant mandaté par l'Architecture comme filet de sécurité contre le blocage de l'application.

### 🟠 Major Issues

**1. Référence en avant dans la Story 2.3 :** l'AC mentionne explicitement "...en attendant l'Epic 3", ce qui introduit une dépendance textuelle sur un epic futur — contraire au principe d'indépendance des epics (Epic 2 doit fonctionner sans Epic 3). Le comportement de secours (bouton d'affectation manuelle) rend Epic 2 fonctionnellement indépendant, mais la formulation elle-même est un signal à corriger.
- **Recommandation :** reformuler l'AC pour décrire uniquement le comportement livré par Epic 2, sans référencer Epic 3 (l'amélioration future n'a pas besoin d'être mentionnée dans l'AC).

**2. Story 1.2 (technique) mal positionnée :** "Environnement de Test Local (Devcontainer & Docker-compose)" est une story orientée développeur (légitime pour un projet greenfield, cf. règle 5B), mais elle est numérotée après la première story utilisateur (1.1) plutôt qu'en amont de toute logique métier.
- **Recommandation :** la renuméroter avant la Story 1.1, idéalement fusionnée avec la story de scaffolding initial manquante (Critique #1).

**3. Story 4.3 (Import/Export JSON) sans gestion d'erreur d'import invalide :** l'AC ne couvre pas le cas d'un fichier `.json` corrompu ou de format invalide fourni à la restauration — un chemin d'erreur évident, et directement lié à NFR6 (récupérabilité).
- **Recommandation :** ajouter un AC : "Given un fichier .json invalide ou corrompu, When je clique sur Restaurer, Then le système affiche une erreur claire et n'altère pas la base existante."

**4. Stories 1.1/1.3 sans AC sur la protection anti-doublon (AD-7) :** confirme, au niveau des AC concrets (pas seulement au niveau NFR), que la protection contre les doublons/conditions de course n'est vérifiable par aucun critère testable.
- **Recommandation :** ajouter un AC à la Story 1.1 du type : "Given je presse Entrée plusieurs fois très rapidement sur le même texte, Then une seule tâche est créée en base."

### 🟡 Minor Concerns

- **Story 4.2 (Moteur de suggestion) :** ne précise pas le comportement si l'Inbox est vide ou si aucune tâche ne correspond aux critères de suggestion.
- **Story 1.4 (Checklists) :** ne précise pas de comportement/limite pour une checklist vide ou très longue.
- **Incohérence de numérotation FR/NFR** entre le PRD et `epics.md` (déjà signalée au Step 3) — n'empêche pas la compréhension actuelle mais fragilise la traçabilité à long terme.

### Positive Findings

- Plusieurs stories gèrent déjà très bien les cas limites : Story 2.1 (chevauchement de plages, heure de fin < début), Story 2.2 (confirmation avant écrasement), Story 3.2 (repli vers l'Inbox si aucune plage future ne correspond).
- Aucun epic n'est un "epic technique" sans valeur utilisateur — tous les 4 epics sont formulés autour d'un bénéfice utilisateur clair.
- Les dépendances *intra-epic* respectent l'ordre logique (chaque story ne s'appuie que sur les livrables de stories précédentes du même epic), à l'exception de la formulation de la Story 2.3 relevée ci-dessus.

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK.** La couverture fonctionnelle est excellente (100% des FR positifs du PRD sont couverts, contraintes de périmètre respectées), et la qualité générale des epics/stories est bonne (bonne gestion des cas limites sur plusieurs stories, epics bien centrés sur la valeur utilisateur). Mais **4 problèmes critiques** doivent être résolus avant de lancer le développement sans risque de rework ou de confusion d'implémentation — aucun n'exige de refonte en profondeur, ce sont des ajouts/clarifications ciblés.

### Critical Issues Requiring Immediate Action

1. **Conflit UX ↔ Architecture sur le champ "Durée" de la tâche** — `DESIGN.md` et `EXPERIENCE.md` mentionnent un champ "Durée" éditable sur les tâches, que l'invariant AD-4 de l'Architecture interdit explicitement. À trancher avant le développement des Stories 1.3 et 3.1.
2. **Aucune story de scaffolding initial (starter template)** — AR1 (React+Vite) et AR2 (Dexie.js) sont présupposés par la Story 1.1 mais jamais produits par une story dédiée.
3. **CI/CD absent de toute story** — AR5 (déploiement GitHub Pages/Actions automatisé) n'a aucune story porteuse.
4. **Écran de récupération de base corrompue (AD-5) sans story** — l'Architecture mandate ce filet de sécurité, mais aucun epic ne le livre.

### Recommended Next Steps

1. Trancher la contradiction "Durée" avec le Product Owner et corriger `DESIGN.md`/`EXPERIENCE.md` (ou amender AD-4 si la décision est de garder le champ).
2. Ajouter une story "Initialisation du projet (starter template)" en tête d'Epic 1, couvrant AR1 (scaffolding React+Vite) et AR2 (config Dexie.js) ; y intégrer ou faire suivre immédiatement d'une story CI/CD (GitHub Actions + Pages, AR5).
3. Ajouter une story (Epic 4, à côté de la Story 4.3) pour l'écran de récupération de base corrompue (AD-5), et enrichir l'AC de la Story 4.3 pour gérer un fichier d'import JSON invalide/corrompu.
4. Enrichir les AC des Stories 1.1 et 1.3 avec un critère de non-duplication en saisie rapide (AD-7), et ajouter un AC à la Story 3.1 garantissant que le swipe ne bloque jamais un clic natif (NFR9).
5. Reformuler l'AC de la Story 2.3 pour supprimer la référence à "l'Epic 3" et décrire uniquement le comportement livré par Epic 2.
6. (Qualité, non bloquant) Harmoniser la numérotation FR/NFR entre le PRD et `epics.md`, couvrir le pattern swipe-droite (menu d'enrichissement) dans les AC, et clarifier si la "Densité adaptative" (Aérée/Dense) est prévue ou différée.

### Final Note

Cette évaluation a identifié **14 constats** répartis en 3 catégories (Couverture des Epics, Alignement UX, Qualité des Epics) : **4 critiques**, **6 majeurs**, **4 mineurs**. Aucun ne remet en cause la structure globale du produit ou des epics — ce sont des compléments ciblés (stories manquantes, AC à enrichir, une contradiction de spec à trancher). Traiter les 4 points critiques avant de démarrer le sprint d'implémentation ; les autres peuvent être traités en cours de route ou consciemment différés par le Product Owner.

---

**Assessment réalisée par :** Agent PM (bmad-check-implementation-readiness)
**Date :** 2026-07-05
