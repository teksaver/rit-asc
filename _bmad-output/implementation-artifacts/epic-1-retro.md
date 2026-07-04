# Rétrospective - Epic 1: L'Inbox et le "Vidage de tête" (Le Dépôt)

**Date :** 2026-07-04
**Statut de l'Epic :** Terminé (100%)

## Métriques de Livraison
- **Stories complétées :** 4/4 (Story 1.1 à 1.4)
- **Dette technique repoussée :** 3 éléments mineurs (Optimisation de rendu React, variables Docker, IDs d'extensions VS Code).
- **Blocages majeurs :** 1 (Interception des pointer events natifs par React dans la Story 1.4).

## Thèmes et Leçons Apprises (Lessons Learned)
Lors de l'analyse des itérations de code (qui ont généré un volume important de retours lors des revues), plusieurs thèmes sont ressortis :

1. **Complexité des interactions tactiles (Touch/Pointer Events) :**
   L'implémentation du Swipe-to-edit a créé des conflits avec les clics natifs sur les éléments interactifs (cases à cocher). Les tests automatisés (`jsdom`) n'ont pas pu détecter ces failles car ils ne simulent pas correctement la capture de pointeur (`setPointerCapture`). *Leçon : Ne jamais se fier uniquement aux tests unitaires pour les interactions DOM complexes ; le test manuel sur navigateur est vital.*

2. **Fiabilité de la Base de Données (Dexie.js) :**
   Des conditions de course (race conditions) et des erreurs silencieuses ont été détectées. *Leçon : Les opérations de mutation doivent être systématiquement protégées (try/catch, états de soumission).*

3. **Garde-fous des Spécifications :**
   Le volume d'aller-retours en revue s'explique par un manque de consignes techniques transverses fournies à l'agent de développement avant qu'il ne code.

## Action Items (Plans d'Action)

- [ ] **Action Item 1 (Ownership: Développeur) :** Générer un fichier `project-context.md` (via le skill `bmad-generate-project-context`) pour centraliser les règles techniques transverses (try/catch systématique pour Dexie, gestion stricte de l'accessibilité, règles sur les pointer events).
- [ ] **Action Item 2 (Ownership: Product Owner / Architecte) :** Avant de démarrer l'Epic 2, utiliser l'outil de spécification (`bmad-spec` ou enrichissement des plans existants) pour blinder les spécifications techniques et l'UX. Cela donnera un cadre beaucoup plus strict à l'agent de développement et réduira le volume d'erreurs en revue.

## Prochaines Étapes
- Démarrer l'Epic 2 : "La Structure du temps (Les Journées Types)".
