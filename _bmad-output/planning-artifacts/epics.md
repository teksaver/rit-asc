stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - prds/prd-RouteIn-2026-07-02/prd.md
  - architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md
  - ux-designs/ux-RouteIn-2026-07-02/DESIGN.md
  - ux-designs/ux-RouteIn-2026-07-02/EXPERIENCE.md
---

# RouteIn - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for RouteIn, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Création de tâche avec champ unique (nom) et saisie mode "mitraillette" (Dépôt / Inbox).
FR2: Possibilité de définir les détails d'une tâche à la création ou ultérieurement (enrichissement à la carte).
FR3: Suggestions d'enrichissement contextuel lors d'un report de tâche.
FR4: Création de modèles de "Journées types" (ex: Télétravail, Repos).
FR5: Définition de "Plages horaires typées" (avec heure de début, de fin et catégorie) dans les "Journées types".
FR6: Catégorisation manuelle libre par l'utilisateur.
FR7: Création de checklists (sous-étapes) textuelles à l'intérieur d'une fiche tâche.
FR8: Gestion de 3 niveaux de priorité (Non négociable, Reportable, Vraiment pas obligé).
FR9: Mécanisme de "Saut de cycle" (amnésie bienveillante) reportant automatiquement les tâches "Reportables" ou "Pas obligées" ratées au prochain créneau libre de leur catégorie.
FR10: Moteur de suggestion proposant des tâches dans les plages horaires creuses.
FR11: Vue principale (Aujourd'hui) affichant la "Journée Type" active et ses plages.
FR12: Vue "Semaine" avec synthèse hebdomadaire et export PDF/Impression.
FR13: Planification par affectation manuelle ou duplication d'une semaine passée.
FR14: Manipulation des tâches via Drag & Drop et Swipe-to-edit.

### NonFunctional Requirements

NFR1: Application web responsive (PWA) adaptée Mobile, Tablette, Bureau.
NFR2: Fonctionnement intégralement hors-ligne (Local-first).
NFR3: Compatibilité Chrome, Safari, Firefox, Edge.
NFR4: Sauvegarde manuelle et restauration de toutes les données sous forme de fichier JSON (import/export).
NFR5: Hitboxes de 44x44px minimum pour une accessibilité tactile optimale.
NFR6: Respect des contrastes (Textes sombres sur fonds clairs) et support du Dynamic Type.

### Additional Requirements

AR1: Starter Template basé sur React + Vite + Vanilla CSS.
AR2: Stockage de la base de données locale sous IndexedDB géré via la librairie Dexie.js.
AR3: La logique de "Saut de cycle" ne repousse jamais les tâches dans le futur s'il n'y a pas de journée planifiée; elle les re-bascule dans l'Inbox le cas échéant.
AR4: Aucune génération infinie ou automatique de jours dans la base.
AR5: Hébergement statique sous GitHub Pages avec CI/CD GitHub Actions (Déploiement automatisé : dès qu'on merge sur la branche `main`, l'action se déclenche, build l'application et met à jour GitHub Pages).

### UX Design Requirements

UX-DR1: Implémentation du système de couleurs "Zen" (background: #F9FAFB, accent: #6366F1, success: #10B981) sans utiliser de rouge "alerte".
UX-DR2: Développement des composants "Task Cards" avec checkboxes rondes et métadonnées en tags.
UX-DR3: Développement des composants "Time Blocks" en tant que conteneurs visuels colorés par catégorie.
UX-DR4: Développement du champ persistant "Progressive Input" pour le vidage de tête rapide.
UX-DR5: Implémentation de transitions douces (fade-in, slide-up) à la validation d'une tâche.
UX-DR6: Pré-remplissage des données de départ (Onboarding sans écran vide).

### FR Coverage Map

- FR1: Epic 1 - Saisie mitraillette dans le Dépôt
- FR2: Epic 1 - Enrichissement des tâches à la création
- FR3: Epic 3 - Suggestion d'enrichissement sur report
- FR4: Epic 2 - Modèles de Journées types
- FR5: Epic 2 - Plages horaires typées
- FR6: Epic 1 - Création de catégories libres
- FR7: Epic 1 - Checklists internes (Prérequis)
- FR8: Epic 1 - Niveaux de priorité
- FR9: Epic 3 - Saut de cycle (Amnésie bienveillante)
- FR10: Epic 4 - Moteur de suggestion
- FR11: Epic 2 - Vue Aujourd'hui
- FR12: Epic 4 - Vue Semaine et Export
- FR13: Epic 2 - Planification et duplication manuelle
- FR14: Epic 3 - Drag & Drop et Swipe-to-edit

## Epic List

### Epic 1: L'Inbox et le "Vidage de tête" (Le Dépôt)
L'utilisateur peut se décharger mentalement en enregistrant des tâches instantanément, et les enrichir plus tard avec des catégories, priorités et checklists.
**FRs covered:** FR1, FR2, FR6, FR7, FR8

### Epic 2: La Structure du temps (Les Journées Types)
L'utilisateur peut créer des routines via des Journées Types, structurer ses journées avec des Plages Horaires, et planifier sa semaine facilement.
**FRs covered:** FR4, FR5, FR11, FR13

### Epic 3: Le Moteur d'Amnésie Bienveillante
L'utilisateur ne subit aucune culpabilité. Le système gère les échecs et repousse intelligemment les tâches manquées au prochain créneau cohérent de leur catégorie.
**FRs covered:** FR3, FR9, FR14

### Epic 4: Vue d'Ensemble, Suggestions et Sauvegardes
L'utilisateur peut prendre du recul sur sa semaine, combler les temps morts intelligemment via le moteur de suggestion et sécuriser ses données en JSON.
**FRs covered:** FR10, FR12

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: L'Inbox et le "Vidage de tête" (Le Dépôt)

L'utilisateur peut se décharger mentalement en enregistrant des tâches instantanément, et les enrichir plus tard avec des catégories, priorités et checklists.

### Story 1.1: Saisie "Mitraillette" de Tâches Simples (Le Dépôt)

As a Utilisateur fatigué,
I want taper rapidement mes tâches dans un champ persistant et valider d'une touche,
So that je me vide l'esprit en quelques secondes sans friction.

**Acceptance Criteria:**

**Given** je suis sur la vue "Dépôt" (après initialisation du projet React/Vite AR1 et configuration de Dexie.js AR2)
**When** je tape un texte et que j'appuie sur "Entrée"
**Then** la tâche est sauvegardée immédiatement en base locale avec une transition douce (UX-DR5)
**And** le champ reste actif, vidé, prêt à recevoir la tâche suivante.

### Story 1.2: Environnement de Test Local (Devcontainer & Docker-compose)

As a Développeur,
I want un environnement devcontainer et un fichier docker-compose configurés,
So that je puisse développer et tester l'application en local dans un environnement isolé et standardisé.

**Acceptance Criteria:**
**Given** le dépôt du projet
**When** je lance le projet avec docker-compose ou que j'ouvre le devcontainer
**Then** l'environnement de développement s'initialise avec tous les outils nécessaires (Node.js, Vite, etc.)
**And** l'application locale tourne sur un port exposé et accessible via mon navigateur local.

### Story 1.3: Enrichissement des tâches (Priorité et Catégorie)

As a Utilisateur,
I want pouvoir modifier une tâche du Dépôt pour lui ajouter une catégorie et un niveau de priorité,
So that je prépare la tâche pour qu'elle puisse être planifiée dans ma semaine.

**Acceptance Criteria:**

**Given** j'ai une tâche dans mon Dépôt
**When** j'ouvre ses détails
**Then** je peux créer/sélectionner une catégorie (FR6) et choisir une priorité parmi les 3 niveaux (Non négociable, Reportable, Pas obligé)
**And** la carte de la tâche (Task Card) se met à jour en affichant ces métadonnées sous forme de tags (UX-DR2).

### Story 1.4: Checklists internes (Prérequis)

As a Utilisateur,
I want pouvoir ajouter une liste de sous-étapes textuelles à une tâche,
So that je n'oublie pas les prérequis nécessaires pour accomplir cette tâche.

**Acceptance Criteria:**

**Given** je consulte les détails d'une tâche
**When** j'ajoute un élément textuel de checklist
**Then** cet élément s'affiche sous la tâche avec sa propre case à cocher
**And** je peux cocher indépendamment chaque élément de la checklist.

## Epic 2: La Structure du temps (Les Journées Types)

L'utilisateur peut créer des routines via des Journées Types, structurer ses journées avec des Plages Horaires, et planifier sa semaine facilement.

### Story 2.1: Création de Modèles de Journées et Plages Horaires

As a Utilisateur,
I want créer des "Journées types" (ex: Télétravail) contenant des "Plages horaires" liées à mes catégories,
So that je définis des routines réutilisables qui structurent mon temps.

**Acceptance Criteria:**

**Given** je suis dans la vue Configuration
**When** je crée un modèle de journée
**Then** je peux y ajouter plusieurs plages horaires en définissant l'Heure de début, l'Heure de fin, et la Catégorie
**And** les plages horaires s'affichent sous forme de conteneurs visuels (UX-DR3)
**And** le système empêche les erreurs de saisie (heure de fin antérieure au début) et signale les chevauchements de plages horaires.

### Story 2.2: Planification d'une Semaine et Duplication

As a Utilisateur,
I want assigner mes "Journées types" à des dates du calendrier,
So that mes routines deviennent un plan d'action réel.

**Acceptance Criteria:**

**Given** je suis sur la vue de planification
**When** j'assigne une journée type à une date (ex: Lundi)
**Then** le système génère la structure de la journée pour cette date exacte en base locale
**And** si une journée était déjà planifiée à cette date, le système demande confirmation avant d'écraser l'existante
**And** je peux utiliser un bouton pour dupliquer l'organisation de la semaine en cours sur la semaine suivante (FR13).

### Story 2.3: Vue Aujourd'hui et Peuplement Initial (Onboarding)

As a Nouvel Utilisateur,
I want voir une journée type immédiatement à l'ouverture de l'application,
So that je sais quoi faire sans avoir l'angoisse de la page blanche.

**Acceptance Criteria:**

**Given** j'ouvre l'application pour la toute première fois
**Then** le système génère silencieusement un modèle "Journée Standard" et l'assigne à la date d'aujourd'hui (UX-DR6)
**And** la vue "Aujourd'hui" affiche les plages horaires prêtes à recevoir des tâches de l'Inbox (FR11) via une sélection manuelle basique (bouton d'affectation) en attendant l'Epic 3
**And** les jours suivants, cette vue affiche la journée planifiée courante ou invite clairement à planifier si aucune n'existe.

## Epic 3: Le Moteur d'Amnésie Bienveillante

L'utilisateur ne subit aucune culpabilité. Le système gère les échecs et repousse intelligemment les tâches manquées au prochain créneau cohérent de leur catégorie.

### Story 3.1: Manipulation et Affectation des Tâches (Drag & Drop)

As a Utilisateur,
I want pouvoir glisser-déposer des tâches de mon Dépôt vers les plages horaires de ma journée,
So that je m'engage facilement à accomplir ces tâches aujourd'hui.

**Acceptance Criteria:**

**Given** je vois ma vue "Aujourd'hui"
**When** je maintiens une tâche de l'Inbox et la lâche dans une plage horaire
**Then** la tâche s'attache à cette plage (FR14)
**And** si le dépôt (drop) est invalide ou hors cible, la tâche reprend sa place initiale
**And** je peux la faire glisser vers la gauche (Swipe-to-edit) pour l'annuler et la renvoyer au Dépôt.

### Story 3.2: Le Saut de Cycle (Amnésie Bienveillante)

As a Utilisateur,
I want que les tâches ratées soient repoussées à la prochaine plage cohérente,
So that je ne me réveille jamais avec des listes anxiogènes de tâches en retard.

**Acceptance Criteria:**

**Given** la journée s'est terminée avec des tâches "Reportables" non cochées
**When** la date système bascule au lendemain
**Then** le système cherche la prochaine plage horaire planifiée (dans le futur) correspondant à la catégorie de la tâche et l'y déplace silencieusement (FR9)
**And** s'il ne trouve aucune journée planifiée pour cette catégorie dans le futur, la tâche retourne gentiment dans l'Inbox (AR3).

### Story 3.3: Suggestions d'enrichissement sur report

As a Utilisateur,
I want que le système m'aide à catégoriser une tâche du Dépôt que je n'arrête pas de repousser,
So that la tâche puisse intégrer le mécanisme de Saut de Cycle.

**Acceptance Criteria:**

**Given** une tâche sans catégorie stagne dans le Dépôt depuis plus de 48 heures
**When** j'ouvre l'application
**Then** l'interface me suggère discrètement, via un indicateur visuel, d'assigner une catégorie à cette tâche (FR3).

## Epic 4: Vue d'Ensemble, Suggestions et Sauvegardes

L'utilisateur peut prendre du recul sur sa semaine, combler les temps morts intelligemment via le moteur de suggestion et sécuriser ses données en JSON.

### Story 4.1: Vue Semaine et Export

As a Utilisateur,
I want voir ma semaine d'un coup d'œil et pouvoir l'exporter,
So that j'ai une synthèse claire et imprimable de mon planning.

**Acceptance Criteria:**

**Given** je suis sur l'onglet "Semaine"
**Then** je vois une synthèse de toutes mes journées prévues pour la semaine en cours
**And** je dispose d'un bouton "Export" qui génère une vue imprimable (PDF/Impression système) du planning de la semaine (FR12).

### Story 4.2: Moteur de Suggestion (Le Bouton Magique)

As a Utilisateur,
I want que le système me suggère des tâches pertinentes pour mes plages horaires vides ou en cours,
So that je ne perds pas de temps à chercher quoi faire.

**Acceptance Criteria:**

**Given** une plage horaire est en cours et n'est pas remplie
**When** je clique sur le bouton "Que pourrais-je faire ?"
**Then** le système analyse les tâches de l'Inbox
**And** il me suggère des tâches en filtrant par la catégorie de la plage, mais aussi en priorisant selon la priorité de la tâche et son état de préparation (checklist complète) (FR10).

### Story 4.3: Sécurité et Sauvegarde (Import/Export JSON)

As a Utilisateur,
I want pouvoir sauvegarder ma base de données locale dans un fichier, et la restaurer,
So that je ne perds jamais mon organisation.

**Acceptance Criteria:**

**Given** je suis dans la vue "Configuration"
**When** je clique sur "Sauvegarder"
**Then** le système génère un fichier `.json` de l'intégralité de la base IndexedDB (NFR4)
**And** quand j'utilise la fonction "Restaurer" avec un fichier `.json` valide, alors la base est remplacée par le contenu du fichier.

### Story 4.4: Intégration PWA et Hors-ligne

As a Utilisateur Mobile,
I want pouvoir installer l'application sur mon écran d'accueil et l'utiliser hors-ligne,
So that j'y accède comme à une application native, même dans les transports.

**Acceptance Criteria:**

**Given** je visite l'URL de l'application via mon navigateur
**Then** un manifeste PWA valide est détecté, permettant l'installation ("Add to Home Screen")
**And** un Service Worker (via `vite-plugin-pwa`) met en cache les assets statiques pour que l'application s'ouvre même sans connexion réseau (NFR1).
