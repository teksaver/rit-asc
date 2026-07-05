# Synchronisation Multi-Appareils (Local-First)

L'idée initiale de "Synchro P2P Bluetooth" a été éprouvée et radicalement simplifiée pour garantir la faisabilité et conserver l'architecture local-first.

## Ce qui est validé (Locks)
- **Le besoin est personnel, pas social** : Il s'agit de faire communiquer les appareils d'un même utilisateur (ex: PC ↔ Téléphone).
- **Synchronisation manuelle et à la demande** : L'automatisation invisible (qui crée une charge technique massive) est abandonnée au profit d'une action explicite.
- **Écrasement unidirectionnel pur (Master/Slave)** : Aucune fusion de données (CRDTs). Le transfert écrase et remplace intégralement l'état de l'appareil récepteur. Zéro conflit à gérer.
- **Le transport se fera par Fichier, pas par QR Code** : L'écrasement nécessitant de transférer la base entière (qui dépassera vite les 3 Ko d'un QR code), la méthode sera un export/import de fichier (ex: JSON).

## Ce qui a été tué (Kills)
- **[KILLED] Synchro P2P via Web Bluetooth API** : Support impossible sur iOS (Safari ne le gère pas) et les navigateurs gèrent très mal le rôle "Peripheral" requis pour du vrai P2P.
