---
title: Application mobile d'organisation du quotidien
status: final
created: 2026-07-02
updated: 2026-07-02
---

# 1. Vision & Proposition de valeur
L'application est un outil d'organisation personnelle destiné à réduire la charge mentale liée à la gestion du quotidien.
Elle ne remplace pas un agenda classique ou un gestionnaire de tâches (To-Do list) traditionnel. Son objectif est d'aider l'utilisateur à structurer son temps, installer ses routines et réaliser les tâches courantes sans devoir constamment décider "quoi faire" ni "quand le faire".

**Le postulat fondamental :** Les tâches sont souvent reportées parce qu'elles demandent un effort cognitif d'initiation (s'en souvenir, les préparer, choisir le moment). L'application diminue cette charge mentale via un cadre hebdomadaire souple basé sur des routines (Journées types) et des blocs de temps (Plages horaires), tout en protégeant l'utilisateur de la culpabilité (effet boule de neige) lors de ses baisses d'énergie.

# 2. Public cible
- Utilisateurs individuels en recherche de structuration de leur quotidien.
- Personnes souvent sur-outillées (multiples agendas, carnets, listes éparpillées) qui souffrent de la fragmentation de leur système actuel.
- Personnes dont le défi n'est pas la compréhension d'outils complexes, mais la **maintenance des routines dans la durée** (risques de décrochages et d'abandon dus à la culpabilité).

# 3. Fonctionnalités Principales (Core Features)

## 3.1. Saisie et enrichissement progressif
- **Création sans friction :** La création d'une tâche ne requiert que son nom. Aucun autre champ (catégorie, durée, priorité, récurrence) n'est obligatoire.
- **Enrichissement à la carte :** L'utilisateur peut renseigner les détails (métadonnées) dès la création s'il le souhaite, ou plus tard.
- **Enrichissement contextuel au report :** Lorsqu'une tâche incomplète n'est pas réalisée, l'interface profite de cet événement pour suggérer à l'utilisateur de l'enrichir (ex: lui attribuer une catégorie) afin d'automatiser et faciliter son prochain placement.

## 3.2. Structuration du temps (Journées & Plages)
- **Journées types :** Création de modèles de journées correspondant au mode de vie (ex: Journée télétravail, Journée repos). Ces modèles peuvent être assignés aux jours de la semaine ou placés librement.
- **Plages horaires typées :** Chaque journée type est découpée en blocs de temps dédiés à des catégories/activités (ex: 18h-19h "Ménage"). Les catégories sont subjectives et définies manuellement par l'utilisateur.

## 3.3. Fiche Tâche & Checklists internes (Prérequis)
- Chaque tâche est indépendante du calendrier et possède une fiche détaillée optionnelle (durée estimée, catégorie, périodicité, heure de début/limite).
- **Prérequis simplifiés :** Plutôt qu'un graphe de dépendance complexe entre plusieurs tâches indépendantes, les actions préparatoires prennent la forme d'une simple checklist textuelle à l'intérieur même de la fiche (ex: "Tâche: Peindre la chambre" -> Checklist interne: "[ ] Acheter peinture, [ ] Protéger le sol"). L'interface permet de repérer si une tâche nécessite encore de la préparation.

## 3.4. Amnésie Bienveillante & Niveaux de priorité
- **3 Niveaux de priorité :** Non négociable, Reportable, Vraiment pas obligé (niveau par défaut pour réduire la pression).
- **Saut de cycle (Anti-accumulation) :** Si une tâche de routine "Reportable" n'est pas réalisée, elle n'est *jamais* repoussée bêtement au lendemain (ce qui créerait un effet boule de neige anxiogène). Elle est reportée au **prochain créneau libre dédié à sa catégorie**. 

## 3.5. Moteur de suggestion (Fonctionnalité optionnelle)
- Un outil à la demande qui propose des tâches pertinentes (selon l'échéance, la priorité, la catégorie et la préparation) pour remplir les plages horaires creuses ou génériques d'une journée.

## 3.6. Vue Hebdomadaire & Export
- Affichage d'une vue synthétique de la semaine.
- Fonction d'export au format PDF et possibilité d'impression.

## 3.7. Fonctionnement Hors-ligne (Local-first)
- L'application fonctionne intégralement sans connexion Internet.
- Les données sont stockées localement sur l'appareil de l'utilisateur.

---
# 5. Hors Périmètre (Out of Scope)
- **Intégration Calendrier :** L'application est un système fermé. Il n'y a pas d'intégration technique prévue en lecture/écriture avec l'agenda natif du téléphone ou de l'ordinateur (ex: Google Calendar, Apple Calendar).
- **Widgets natifs :** L'application s'appuie sur son interface web. Il n'est pas prévu de développer de widgets d'écran d'accueil natifs.

# 4. Exigences Non-Fonctionnelles (NFR)

## 4.1. Architecture & Plateformes
- **Type d'application :** Application web responsive, conçue potentiellement comme une PWA (Progressive Web App).
- **Compatibilité :** Doit fonctionner de manière fluide sur l'ensemble des principaux navigateurs web (Chrome, Safari, Firefox, Edge) et s'adapter à toutes les tailles d'écrans (Mobile, Tablette, Bureau).
- **Stockage local :** Utilisation exclusive du stockage local du navigateur (IndexedDB, LocalStorage, ou équivalent) pour garantir le fonctionnement 100% hors-ligne.

## 4.2. Sauvegarde & Intégrité des données
- **Risque ciblé :** Le stockage local via navigateur est volatil (peut être effacé lors d'un nettoyage du cache ou en cas de perte de l'appareil).
- **Mécanisme manuel d'import/export :** L'application doit impérativement fournir un moyen d'exporter l'intégralité des données (Journées types, tâches, historiques) sous forme de fichier structuré (ex: `.json`) pour que l'utilisateur puisse le stocker manuellement (email, cloud personnel). Une fonction d'importation doit permettre de restaurer l'état complet.
