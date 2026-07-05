---
id: SPEC-epic-2-journees-types
companions:
  - ../../project-context.md
  - ../../architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md
sources:
  - ../../prds/prd-RouteIn-2026-07-02/prd.md
  - ../../epics.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Epic 2 - Les Journées Types

## Why

L'utilisateur souffre de la fragmentation de ses outils et de l'effort cognitif lié à la planification de ses tâches récurrentes. Pour réduire cette charge mentale, l'application doit lui permettre de structurer son temps de manière souple grâce à des routines réutilisables (Journées types) constituées de blocs de temps (Plages horaires). Ce cadre soulage l'utilisateur du besoin de décider "quoi faire et quand", en automatisant l'organisation de ses journées.

## Capabilities

- **CAP-1**
  - **intent:** Créer et éditer des "Journées types" contenant des "Plages horaires" liées à des catégories.
  - **success:** Une interface de configuration permet d'ajouter une ou plusieurs plages (Heure de début, Heure de fin, Catégorie) à un modèle de journée, qui s'affichent sous forme de conteneurs visuels colorés par catégorie.

- **CAP-2**
  - **intent:** Assigner un modèle de "Journée type" à une date du calendrier pour planifier sa semaine.
  - **success:** L'assignation d'une journée type génère et stocke la structure correspondante pour cette date précise en base de données locale.

- **CAP-3**
  - **intent:** Dupliquer l'organisation d'une semaine entière sur la semaine suivante.
  - **success:** Un simple clic sur un bouton permet de copier toutes les journées types de la semaine courante vers la semaine suivante.

- **CAP-4**
  - **intent:** Offrir une expérience d'intégration (Onboarding) fluide et sans écran vide à la première utilisation.
  - **success:** Dès la première ouverture de l'application, un modèle "Journée Standard" est généré silencieusement et assigné à la date du jour, visible immédiatement dans la vue "Aujourd'hui".

## Constraints

- Le stockage local IndexedDB ne doit jamais être inondé par une génération infinie ou automatique de jours dans le futur (AR4). La structure n'est créée qu'à l'assignation explicite ou à la duplication.
- L'interface doit respecter les règles d'accessibilité (cibles tactiles >= 44x44px, état `:focus-visible` obligatoire) et la palette "Zen" (sans rouge d'alerte).
- Toute mutation en base de données Dexie.js doit être englobée d'un `try/catch` avec gestion de l'état de soumission (`isSubmitting`) pour empêcher les doublons liés aux saisies très rapides.
- **Tâches minimalistes (AD-4) :** Le temps n'est structuré que par les Plages Horaires (`TIME_BLOCK`) ; l'entité `TASK` ne porte explicitement aucune notion de durée, de récurrence ou d'heure limite.
- **Robustesse des interactions tactiles :** S'assurer que la gestion des événements de pointeur (pointeur capture pour swipe/drag ultérieurs) n'interfère pas avec les clics standards de l'interface (boutons, formulaires d'édition).

## Non-goals

- Pas de glisser-déposer de tâches de l'Inbox vers les plages horaires (cette fonctionnalité appartient à l'Epic 3).
- Pas de vue de synthèse hebdomadaire complète ni d'export PDF dans cette itération (cette fonctionnalité appartient à l'Epic 4).
- Pas d'intégration technique en lecture/écriture avec des agendas natifs (ex: Google Calendar, Apple Calendar).

## Success signal

- L'utilisateur peut créer un modèle "Télétravail", l'assigner à la journée de demain, dupliquer cette structure sur la semaine suivante, et voir ses plages horaires s'afficher correctement sur l'interface "Aujourd'hui", le tout 100% hors-ligne.
