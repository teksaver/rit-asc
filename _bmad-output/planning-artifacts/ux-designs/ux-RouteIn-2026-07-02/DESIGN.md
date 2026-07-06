---
title: Application mobile d'organisation du quotidien (Design)
status: final
created: 2026-07-02
updated: 2026-07-02
tokens:
  colors:
    background: "#F9FAFB" # Off-white/light gray for low eye strain
    surface: "#FFFFFF"
    text-primary: "#1F2937"
    text-secondary: "#6B7280"
    accent: "#6366F1" # Soft indigo for primary actions
    success: "#10B981" # Sage/emerald for completed tasks
    muted: "#E5E7EB" # Borders and dividers
    # No "error red" used for missed tasks to avoid guilt.
  typography:
    family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    weights:
      regular: 400
      medium: 500
      bold: 700
  rounded:
    sm: "4px"
    md: "8px"
    lg: "16px" # Soft, friendly card corners
    full: "9999px"
  spacing:
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
---

# 1. Brand & Style
L'application doit incarner le calme, la clarté et la décharge mentale. L'interface ne crie jamais sur l'utilisateur. Elle adopte une esthétique "zen et utilitaire", inspirée du minimalisme japonais et scandinave. Les éléments visuels sont adoucis (bords arrondis, ombres diffuses) pour ne jamais paraître agressifs ou stressants.

# 2. Colors
- **Le vide comme couleur principale :** L'interface repose massivement sur le blanc (`surface`) et le gris très clair (`background`) pour laisser respirer l'information.
- **Absence de rouge "Retard" :** Conformément à l'amnésie bienveillante, l'absence d'action n'est jamais sanctionnée par du rouge vif.
- Les couleurs d'accentuation (Indigo, Vert Sauge) sont désaturées pour être douces à l'œil, même au réveil ou tard le soir.

# 3. Typography
- Typographie système (sans-serif) pour une lisibilité maximale et des temps de chargement nuls (idéal pour PWA hors-ligne).
- Hiérarchie très marquée par la taille et la graisse plutôt que par la couleur.

# 4. Layout & Spacing
- **Espaces généreux :** Marges larges (`lg`, `xl`) entre les blocs horaires pour matérialiser visuellement que la journée "respire".
- **Densité adaptative :** L'utilisateur peut choisir entre une vue "Aérée" (idéal sur mobile) ou "Dense" (pour les utilisateurs avancés ou sur desktop).

# 5. Elevation & Depth
- Conception très plate (Flat Design) avec des ombres portées extrêmement légères (10% d'opacité, grand flou) uniquement pour détacher les cartes "Tâches" du fond "Journée".

# 6. Shapes
- Bords arrondis (`lg` 16px) pour les cartes de tâches et les blocs horaires, renforçant le côté "amical" et organique de l'outil.

# 7. Components
- **Task Card (Carte de tâche) :** Un rectangle blanc avec une case à cocher (cercle parfait). Les métadonnées (catégorie) apparaissent sous forme de "pilules" (tags) discrètes et grisées si elles sont renseignées.
- **Time Block (Plage horaire) :** Un conteneur à fond légèrement teinté (selon la catégorie, ex: pastel bleu pour "Travail") dans lequel viennent se loger les Task Cards.
- **Progressive Input (Champ de saisie) :** Un simple champ texte persistant en bas de l'écran ou flottant (FAB), permettant de taper et valider en 1 touche.

# 8. Do's and Don'ts
- **DO :** Utiliser des animations douces (fade-in, slide-up) lors de la complétion d'une tâche pour générer un micro-sentiment d'accomplissement.
- **DON'T :** Ne jamais utiliser de pop-ups intrusifs ou de badges rouges "X tâches en retard".
- **DON'T :** Ne pas afficher de champs de formulaires inutiles (ex: sélecteurs de date/heure) lors de la création rapide d'une tâche.
