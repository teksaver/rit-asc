# Idée Forgée : Application d'organisation du quotidien

**Verdict : CONSOLIDÉE (HARDENED)**

L'application ne s'adresse pas à un public incapable de s'organiser, mais à un public **sur-outillé et épuisé par la fragmentation** (listes papier, tableurs). Son véritable adversaire n'est pas la complexité d'usage, mais **l'attrition et la dette de culpabilité** lors des décrochages inévitables de la routine.

## Fondations verrouillées (Locks)

- **L'outil de consolidation :** L'application remplace des outils existants dispersés. La saisie des tâches peut se faire avec des métadonnées incomplètes (nom seul). L'enrichissement des données (catégorie, etc.) se fait de manière contextuelle : lorsqu'une tâche incomplète n'est pas réalisée, l'interface profite de ce "report" pour proposer de la compléter afin d'automatiser ses futurs reports.
- **La flexibilité assumée :** Le moteur de suggestion est une fonctionnalité purement additionnelle (à la demande). Les catégories d'activités sont 100% subjectives et laissées au contrôle manuel de l'utilisateur.
- **La résilience contre la culpabilité (Amnésie bienveillante) :** Le problème majeur est de maintenir l'usage dans la durée. Pour survivre aux décrochages, l'app gère la "dette" via 3 niveaux de priorités. Le niveau par défaut est "Pas vraiment obligé" pour ôter la pression.
- **L'anti-effet boule de neige :** Une tâche "Reportable" ratée n'est jamais repoussée au lendemain. Elle saute intelligemment au prochain créneau libre dédié spécifiquement à sa catégorie. Les tâches non faites ne s'accumulent jamais, elles attendent leur prochain cycle naturel.

## Ce qui a été tué (Kills)

- **Le moteur heuristique (IA) d'auto-catégorisation :** Rejeté. L'application ne doit jamais deviner ou imposer la nature d'une tâche (ex: arroser les plantes = ménage vs loisirs). La standardisation automatisée est bannie, c'est l'utilisateur qui garde le contrôle du sens.
