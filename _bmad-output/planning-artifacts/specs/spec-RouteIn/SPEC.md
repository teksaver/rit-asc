---
name: RouteIn Application
type: spec
companions:
  - ../../architecture/architecture-RouteIn-2026-07-02/ARCHITECTURE-SPINE.md
sources:
  - ../../prds/prd-RouteIn-2026-07-02/prd.md
status: final
updated: 2026-07-05
---

# RouteIn Application Spec

## Why
Réduire la charge mentale liée à la gestion du quotidien via un outil d'organisation qui structure le temps (Journées types et Plages horaires) sans la pression d'un agenda classique, favorisant les routines sur la durée et évitant l'effet boule de neige lié aux tâches reportées.

## Capabilities

- **CAP-1** Saisie mitraillette - Création de tâche ne requiert que son nom.
- **CAP-2** Enrichissement à la carte - L'utilisateur peut renseigner les détails dès la création ou plus tard.
- **CAP-3** Enrichissement contextuel au report - L'interface suggère d'enrichir une tâche incomplète lors de son report.
- **CAP-4** Journées types - Création de modèles de journées (ex: télétravail).
- **CAP-5** Plages horaires typées - Découpage des journées types en blocs de temps dédiés à des catégories subjectives.
- **CAP-6** Fiche Tâche & Checklists internes - Tâche indépendante du calendrier avec checklist textuelle interne pour les prérequis.
- **CAP-7** Amnésie Bienveillante - 3 Niveaux de priorité, une tâche non réalisée est reportée au prochain créneau libre dédié à sa catégorie, sans effet boule de neige.
- **CAP-8** Moteur de suggestion - Propose des tâches pertinentes pour remplir les plages horaires creuses.
- **CAP-9** Vue Hebdomadaire & Export - Vue synthétique de la semaine avec export PDF/impression.
- **CAP-10** Fonctionnement Hors-ligne (Local-first) - L'application fonctionne intégralement sans connexion Internet.
- **CAP-11** Interactions Fluides - Manipulation naturelle via Drag & Drop et Swipe-to-edit.

## Constraints

1. **Type d'application** - Application web responsive, PWA locale.
2. **Compatibilité** - Doit fonctionner sur Chrome, Safari, Firefox, Edge, s'adapter à toutes tailles d'écrans.
3. **Stockage local** - Utilisation exclusive d'IndexedDB/LocalStorage pour fonctionner à 100% hors-ligne.
4. **Export/Import manuel** - Fournir un moyen d'exporter l'intégralité des données en .json et de les importer.
5. **Fiabilité des mutations** - Opérations Dexie doivent être protégées contre conditions de course et pertes silencieuses.
6. **Récupérabilité** - Écran de récupération obligatoire en cas de base illisible (pour réinitialiser).
7. **Cibles tactiles** - Zones interactives minimum 44x44px.
8. **Accessibilité visuelle** - Contrastes respectés, support du Dynamic Type.
9. **Robustesse des gestes** - Swipe/Drag & Drop ne doivent pas interférer avec les actions de base.
10. **AD-1 Single Source of Truth Locale** - Écritures de données métiers via Dexie.js. LocalStorage limité aux préférences UI. Export JSON complet.
11. **AD-2 Planification Manuelle Isolée** - Aucun PlannedDay n'est généré de façon autonome dans le futur, seulement par duplication explicite.
12. **AD-3 Repli vers le Dépôt** - Si une catégorie n'est plus planifiée, les tâches de cette catégorie retournent dans le Dépôt (Inbox).
13. **AD-4 Tâches Minimalistes** - L'entité TASK ne contient aucun champ duration, dueTime, ou recurrence.
14. **AD-5 Migrations de schéma** - Les migrations Dexie sont additives. Contrainte d'unicité et nettoyage en deux versions consécutives distinctes.
15. **AD-6 Standardisation de la Manipulation des Dates** - Toute manipulation de date doit utiliser les API natives ISO (ex: Intl.DateTimeFormat('en-CA')).
16. **AD-7 Concurrence et Sécurité d'Écriture** - Toute écriture Dexie inclut une protection UI (isBusy) ET une contrainte d'unicité en base (&date, etc).
17. **AD-8 Test-First (TDD)** - Les tests unitaires (ou cas critiques) doivent être définis avant l'implémentation de la logique métier complexe.

## Non-goals

- Pas d'intégration en lecture/écriture avec les agendas natifs (Google Calendar, etc).
- Pas de widgets d'écran d'accueil natifs.

## Success Signal
L'utilisateur est capable de planifier sa semaine via des "Journées types" et de l'utiliser entièrement hors-ligne, tout en voyant les tâches inachevées se reporter sans friction ("amnésie bienveillante") dans son cycle. La robustesse des données locales (aucun doublon) est assurée.
