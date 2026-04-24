# Documentation - Hello World RTC

Application de messagerie instantanee en temps reel (type Discord).

## Structure de la documentation

```text
docs/
├── README.md                    # Ce fichier
├── specifications/              # Spécifications du projet
│   ├── grading-criteria.md      # Critères de notation
│   └── specification.txt        # Résumé technique & Architecture
├── uml/                         # Diagrammes UML
│   ├── classes.puml             # Diagramme de classes
│   ├── database-schema.puml     # Schéma de base de données
│   └── entities.md              # Description des entités
├── pdf/                         # Consignes officielles
│   ├── consignes_RTC.pdf        # Consignes générales
│   └── consignes_RTC_back.pdf   # Consignes spécifiques backend
└── cloc-report.md               # Statistiques de code
```

## Stack Technique

| Composant           | Technologie                                    |
| ------------------- | ---------------------------------------------- |
| **Frontend**        | Next.js 16 + React 19 + TypeScript             |
| **Backend**         | Rust + Axum + Tokio                            |
| **Base de donnees** | PostgreSQL (relationnel) + MongoDB (messages)  |
| **Temps reel**      | WebSockets                                     |
| **Styling**         | Tailwind CSS 4                                 |

## Fonctionnalites principales

- **Authentification** : Inscription/Connexion JWT
- **Serveurs** : Creation, rejoindre via code d'invitation
- **Canaux** : Canaux textuels par serveur
- **Messages** : Temps reel via WebSocket
- **Roles** : Owner / Admin / Member (RBAC)
- **Presence** : Utilisateurs connectes, indicateur de frappe

## Liens rapides

- [Critères de notation](./specifications/grading-criteria.md)
- [Résumé technique](./specifications/specification.txt)
- [Diagramme de classes](./uml/classes.puml)
- [Schéma BD (UML)](./uml/database-schema.puml)
