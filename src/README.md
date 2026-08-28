# Structure de `src/`

Une responsabilité par dossier. Le flux de données va toujours dans le même sens :

    pages → components → hooks → services → utils

Un niveau ne remonte jamais vers celui du dessus.

## `pages/`
Un fichier par écran atteignable par une URL. Composé, pas décoré :
une page assemble des composants et branche des hooks. Elle ne contient
pas de logique réseau ni de mise en forme fine.

## `components/`
Éléments d'interface réutilisables et sans état métier. Reçoivent tout
par props, ne vont jamais chercher leurs propres données.
Sous-dossier par composant : `Button/Button.jsx` + `Button.module.css`.

## `hooks/`
Logique réactive partagée : état, effets, abonnements. C'est ici que vit
tout ce qui coordonne un composant et une source de données.

## `services/`
**Seul endroit du projet où l'on écrit `fetch`.** Une fonction par route
de l'API. Le jour où le back change une URL, un seul fichier bouge.
Les composants importent depuis ici, jamais l'inverse.

## `context/`
Contextes React globaux : utilisateur connecté, notifications, WebSocket.

## `utils/`
Fonctions pures, sans dépendance à React ni au réseau. Validation de
formulaire, formatage de date, calcul de distance.

## `styles/`
CSS global : variables, reset, media queries partagées. Le reste du style
vit en CSS Modules à côté de son composant.