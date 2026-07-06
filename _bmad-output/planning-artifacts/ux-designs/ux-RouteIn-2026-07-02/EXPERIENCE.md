---
title: Application mobile d'organisation du quotidien (Experience)
status: final
created: 2026-07-02
updated: 2026-07-02
---

# 1. Foundation
- **Form-factor :** PWA (Progressive Web App) Mobile-first, responsive pour usage Tablette/Desktop.
- **Architecture de stockage :** Local-first (IndexedDB/LocalStorage). Tout est ultra-rapide car aucune requête réseau n'est requise.

# 2. Information Architecture
- **Tab 1: Aujourd'hui (Home) :** La vue principale. Affiche la "Journée Type" active et ses "Plages horaires" successives, contenant les tâches du jour.
- **Tab 2: La Semaine :** Synthèse hebdomadaire des jours et de leurs plages. Bouton d'export PDF présent ici.
- **Tab 3: Le Dépôt (Inbox) :** Liste des tâches créées rapidement sans métadonnées et non encore placées.
- **Tab 4: Configuration :** Gestion des "Journées types", des "Catégories", et le mécanisme manuel d'Export/Import de sauvegarde (Backup JSON).

# 3. Voice and Tone
- **Bienveillant et déculpabilisant :** L'application ne dit jamais "Tâches en retard" ou "Échec". 
- **Verbes d'action légers :** Au lieu de "Planifier obligatoirement", utiliser "Placer". Au lieu de "Tâches échouées", utiliser "Remis à plus tard".
- **Micro-copy :** Si une plage horaire est vide, afficher un texte comme "Quartier libre" plutôt que "Aucune tâche".

# 4. Component Patterns (Comportement)
- **Le vidage de tête (Fast Input) :** Le champ d'ajout de tâche a un comportement "mitraillette". Dès que l'utilisateur valide le clavier (Entrée), la tâche est créée et le champ reste actif et vide pour taper la suivante.
- **Bouton Magique (Suggestion) :** Dans une plage horaire vide ou entamée, un bouton fantôme "Que pourrais-je faire ?" permet d'invoquer le Moteur de suggestion.
- **Checklists internes :** Si une tâche a des "Prérequis", un compteur s'affiche (ex: "0/2 étapes"). Un tap déroule la sous-liste pour la cocher in-situ.

# 5. State Patterns
- **Empty States (États vides) :** Le premier lancement ne présente pas un écran vide effrayant. L'onboarding doit proposer des "Journées types" pré-remplies (ex: "Journée Standard") pour générer la structure sans effort.
- **Le Report Invisible :** Quand une tâche "Reportable" franchit son heure limite sans être cochée, elle disparaît silencieusement de la vue du jour (sans badge rouge) et se place en attente en arrière-plan pour le prochain bloc pertinent de la semaine.

# 6. Interaction Primitives
- **Swipe-to-edit :** Swiper une tâche vers la gauche permet de la rejeter/annuler. Swiper vers la droite ouvre le menu d'enrichissement (Catégorie).
- **Drag & Drop :** L'utilisateur peut maintenir une tâche pour la faire glisser d'une plage horaire à une autre.

# 7. Accessibility Floor
- **Contraste & Typographie :** Textes sombres sur fonds clairs. Tailles de police ajustables via les paramètres du navigateur/téléphone (support du Dynamic Type).
- **Hitboxes larges :** La case à cocher d'une tâche doit avoir une zone cliquable de minimum 44x44px (règle Apple/WCAG) pour ne pas nécessiter une précision chirurgicale, idéal pour un utilisateur fatigué.

# 8. Key Flows

### Flow 1 : Marie vide son esprit et enrichit plus tard
1. **Contexte :** Marie rentre du travail épuisée. Elle se souvient de 3 choses à faire mais n'a pas l'énergie de les planifier.
2. **Action :** Elle ouvre l'app, tape "Appeler assurance", fait "Entrée", tape "Acheter croquettes", fait "Entrée". Elle ferme l'app. Temps total : 8 secondes. (Les tâches atterrissent dans l'Inbox / Le Dépôt).
3. **Climax (Le lendemain) :** Le lendemain matin, elle a de l'énergie. L'app lui indique "2 idées en attente". Elle clique sur "Acheter croquettes". L'application lui demande "Voulez-vous lui donner une catégorie pour que je m'en occupe ?". Elle choisit "Courses". L'application déplace silencieusement la tâche dans la plage horaire "Courses" prévue ce samedi.

### Flow 2 : L'amnésie bienveillante en action
1. **Contexte :** Marc avait la tâche "Passer l'aspirateur" (Reportable, Catégorie: Ménage) dans sa plage de mardi soir. Il rentre malade et s'endort sans rien cocher.
2. **Action :** Mercredi matin, il ouvre l'app avec appréhension. 
3. **Climax :** La vue "Aujourd'hui" de mercredi s'affiche. L'aspirateur n'est **pas** là. Il n'y a pas de compteur de retard. Le système a vu que l'aspirateur a été raté mardi, et l'a discrètement sauté jusqu'à la prochaine plage "Ménage" (qui se trouve être le samedi matin). Marc commence son mercredi sans dette psychologique.
