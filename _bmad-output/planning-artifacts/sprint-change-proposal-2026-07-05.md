# Sprint Change Proposal — RouteIn

**Date :** 2026-07-05
**Projet :** RouteIn
**Déclencheur :** Constats du rapport Implementation Readiness (`implementation-readiness-report-2026-07-05.md`)

---

## 1. Issue Summary

Le Check Implementation Readiness du 2026-07-05 a révélé, en amont de l'implémentation d'Epic 3/4, un ensemble d'écarts entre les artefacts de planification (PRD, Architecture, UX, Epics/Stories) qui n'avaient pas été détectés lors de la création initiale des epics et stories :

1. Une **contradiction directe UX ↔ Architecture** : les documents UX (`DESIGN.md`, `EXPERIENCE.md`) référençaient un champ "Durée" sur les tâches, explicitement interdit par l'invariant AD-4 ("Tâches Minimalistes").
2. Deux **invariants d'Architecture jamais opérationnalisés en story** : AD-5 (écran de récupération sur base corrompue) et AR5 (pipeline CI/CD GitHub Pages/Actions).
3. Des **invariants sans critère d'acceptation vérifiable** : AD-7 (anti-doublon en saisie rapide) et NFR9 (robustesse tactile swipe/clic), alors que ces risques sont explicitement documentés ailleurs (`project-context.md`).
4. Une **référence textuelle en avant** dans l'AC de la Story 2.3 ("en attendant l'Epic 3"), contraire au principe d'indépendance des epics.

Ce déclencheur n'est pas une story unique mais un audit systématique — Epic 1 et Epic 2 sont déjà `done`, Epic 3 est `in-progress` (Story 3.1 `ready-for-dev`), Epic 4 est encore `backlog`.

## 2. Impact Analysis

### Epic Impact
- **Epic 1 (done) :** aucune réouverture de story. Le gap anti-doublon (AD-7) est traité via une nouvelle story de hardening plutôt qu'une réécriture rétroactive des Stories 1.1/1.3.
- **Epic 2 (done) :** un seul changement cosmétique — reformulation de l'AC de la Story 2.3 pour retirer la référence à l'Epic 3. Comportement fonctionnel inchangé.
- **Epic 3 (in-progress) :** aucune story modifiée directement ; le gap de robustesse tactile (NFR9, Story 3.1) est couvert par la nouvelle story de hardening en Epic 4.
- **Epic 4 (backlog) :** **+3 nouvelles stories** (4.5, 4.6, 4.7) et **+3 NFR** (NFR7, NFR8, NFR9) ajoutés à l'inventaire d'exigences.

### Artifact Conflicts
- **PRD :** aucun conflit, aucune modification nécessaire — le MVP reste inchangé.
- **Architecture :** aucune modification nécessaire — AD-4, AD-5, AD-7 et AR5 sont déjà correctement spécifiés ; le problème était uniquement leur traduction en epics/stories (ou leur contradiction côté UX pour AD-4).
- **UX :** `DESIGN.md` et `EXPERIENCE.md` corrigés (retrait du champ "Durée").
- **Autres artefacts :** `epics.md` mis à jour (3 nouvelles stories, 3 nouveaux NFR, 1 AC reformulé). `sprint-status.yaml` à mettre à jour en conséquence (voir Section 4 / handoff).

## 3. Recommended Approach

**Option retenue : Ajustement direct (Option 1).**

- Effort : Faible-Moyen — 3 nouvelles stories de taille standard, corrections textuelles ciblées sur l'UX et une story existante.
- Risque : Faible — aucune remise en cause de l'architecture, du PRD ou du travail déjà livré (Epic 1/2 restent intacts).
- Alternative écartée — Rollback : non viable, Epic 1/2 sont fonctionnels et n'ont pas besoin d'être défaits.
- Alternative écartée — Révision du MVP : non nécessaire, aucun changement de périmètre produit.

Nuance appliquée : plutôt que de rouvrir des stories déjà `done` (1.1, 1.3) pour y ajouter des AC a posteriori, les invariants manquants (AD-7, NFR9) ont été regroupés dans une **story de hardening dédiée et traçable** (Story 4.7), qui touche transversalement plusieurs comportements déjà livrés sans réécrire l'historique de leurs AC d'origine.

## 4. Detailed Change Proposals

### UX — Retrait du champ "Durée"
- `DESIGN.md` §7 (Task Card) : suppression de la mention "durée" dans les métadonnées affichées.
- `EXPERIENCE.md` §6 (Swipe-to-edit) : suppression de "Durée" du menu d'enrichissement ouvert par swipe droit (ne reste que "Catégorie").
- **Statut :** ✅ Appliqué.

### Epics — Nouvelles exigences et stories (Epic 4)
- **NFR7** : Récupérabilité d'une base de données corrompue.
- **NFR8** : Fiabilité des écritures locales (anti-doublon).
- **NFR9** : Robustesse des interactions tactiles.
- **AR5** : ajouté à la liste des exigences couvertes par Epic 4.
- **Story 4.5 — Récupération d'une Base de Données Corrompue** : écran de récupération avec réinitialisation si `db.open()` échoue (couvre AD-5 / NFR7).
- **Story 4.6 — Déploiement Continu (CI/CD GitHub Pages)** : pipeline GitHub Actions déclenché sur merge vers `main`, build + publication automatique, pas de mise en ligne d'un build cassé (couvre AR5).
- **Story 4.7 — Fiabilisation des Écritures et Robustesse Tactile** : protection anti-doublon en saisie rapide (Stories 1.1/1.3) + garantie que le swipe ne bloque jamais un clic natif (Story 3.1) (couvre AD-7/NFR8/NFR9).
- **Statut :** ✅ Appliqué.

### Epics — Correction de dépendance en avant
- **Story 2.3**, AC : suppression de la mention "en attendant l'Epic 3" — le comportement livré (bouton d'affectation manuelle) reste inchangé et fonctionne indépendamment d'Epic 3.
- **Statut :** ✅ Appliqué.

## 5. Implementation Handoff

**Classification du changement : Modéré (Moderate)** — réorganisation du backlog (nouvelles stories dans Epic 4) + corrections documentaires, sans replan stratégique.

| Tâche | Responsable | Détail |
|---|---|---|
| Mettre à jour `sprint-status.yaml` | Product Owner / Developer agent | Ajouter les entrées `4-5-recuperation-base-de-donnees-corrompue`, `4-6-deploiement-continu-cicd`, `4-7-fiabilisation-ecritures-et-robustesse-tactile` (statut `backlog`) ; **corriger l'omission déjà existante** de l'entrée `4-4-integration-pwa-et-hors-ligne` (présente dans `epics.md` mais absente du yaml). |
| Développement des Stories 4.5, 4.6, 4.7 | Developer agent | Via le cycle standard `bmad-create-story` → validate → `bmad-dev-story`, au moment où Epic 4 démarre. |
| Poursuite immédiate | Developer agent | Aucun blocage sur la Story 3.1 (Epic 3, en cours) — les corrections de ce changement ne retardent pas le développement en cours. |

## Success Criteria

- `epics.md` et `sprint-status.yaml` cohérents entre eux (aucune story présente dans l'un et absente de l'autre).
- Les 3 nouvelles stories passent par le cycle standard de validation avant développement.
- Aucune régression sur les Epics 1-3 déjà livrés ou en cours.
