---
project_name: 'RouteIn'
user_name: 'Sylvain'
date: '2026-07-04'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 17
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Environnement :** Node.js v22 (Standardisé via Devcontainer/Docker-compose).
- **React:** ^19.2.7 (Hooks fonctionnels).
- **Vite:** ^8.1.1 (avec `vite-plugin-pwa` attendu pour le fonctionnement hors-ligne PWA).
- **Base de données (Local-First) :** Dexie.js ^4.4.4 & dexie-react-hooks ^4.4.0 (AUCUN appel API distant, stockage exclusivement via IndexedDB).
- **Tests :** Vitest ^4.1.9, @testing-library/react ^16.3.2, et `fake-indexeddb` pour simuler le stockage local.
- **Linting :** oxlint ^1.71.0.
- **Style :** Vanilla CSS via variables CSS (Les frameworks utilitaires comme TailwindCSS sont strictement **interdits**).
- **Icônes :** lucide-react ^1.23.0.

### Règles Spécifiques au Langage et Framework (React & Dexie)

- **Opérations sur la Base de Données (Dexie) :** Les mutations (`db.table.add`, `update`) DOIVENT être entourées de blocs `try/catch`. Il est impératif de gérer les conditions de course (via un état `isSubmitting` ou une `Ref`) pour éviter la création de doublons lors des saisies très rapides (mode "mitraillette").
- **Interactions Tactiles (Pointer Events) :** Le geste de *Swipe-to-edit* ne doit **jamais** intercepter ou bloquer les clics natifs sur les éléments interactifs. Évitez les appels inconditionnels à `setPointerCapture` sur les conteneurs parents.
- **Identifiants et Rendu React :** La génération d'IDs doit se faire exclusivement via `crypto.randomUUID()` (UUID v4) côté client. Cet UUID doit systématiquement être utilisé comme prop `key` dans les listes React (ne jamais utiliser l'index de boucle).
- **Composants et Accessibilité (A11Y) :**
  - Privilégier les balises sémantiques (`<button>`, `<input>`).
  - Toutes les cibles tactiles doivent faire au minimum **44x44px** (Exigence NFR5).
  - Maintenir impérativement un état de focus clavier visible (`:focus-visible`). Ne jamais masquer les contours sans fournir d'alternative visuelle claire.
  - Respecter la palette "Zen" : interdiction absolue d'utiliser du rouge d'alerte.

### Tests & Qualité
- **Organisation des Tests :** Utiliser Vitest et Testing Library. Les fichiers de test doivent se trouver dans le même dossier que le composant testé (ex: `[NomDuComposant].test.jsx`).
- **Mock de Base de données :** Toute interaction avec Dexie.js dans les tests unitaires nécessite l'import et l'utilisation de `fake-indexeddb`.
- **Limites de `jsdom` & Vérification :** `jsdom` ne simule pas correctement les événements tactiles avancés (comme `setPointerCapture`). L'agent de développement DOIT expressément demander une vérification manuelle au Product Owner/Testeur pour toute nouvelle interaction tactile complexe implémentée.

### Conventions & Workflow
- **Nommage :** `PascalCase` pour les composants React (`TaskCard.jsx`), `camelCase` pour les fichiers utilitaires, services et propriétés.
- **Spécifications (Stories) & Incertitude :** Aucune story ne doit être entamée sans des critères d'acceptation (AC) précis. **Si une exigence est ambiguë, l'agent ne doit jamais deviner la solution.** Il doit s'arrêter et demander des clarifications.
- **Dépendances :** L'ajout de nouvelles dépendances NPM est strictement **interdit** sans validation préalable, afin de maintenir la taille de la PWA la plus légère possible.

---

## Usage Guidelines

**Pour les Agents IA :**
- Lisez ce fichier AVANT d'implémenter le moindre code.
- Suivez TOUTES ces règles scrupuleusement.
- En cas de doute, privilégiez toujours l'option la plus stricte/sécurisée.
- Mettez à jour ce fichier si de nouveaux schémas récurrents émergent (via le Product Owner).

**Pour les Humains :**
- Gardez ce fichier concis (optimisé pour le contexte LLM).
- Mettez-le à jour lorsque la stack technologique change.
- Révisez périodiquement pour supprimer les règles devenues évidentes.

Last Updated: 2026-07-04
