# Documentation - Hello World RTC

Application de messagerie instantanée en temps réel (type Discord).

## Structure de la documentation

```
docs/
├── README.md                    # Ce fichier
├── specifications/              # Spécifications du projet
│   ├── requirements.md          # Cahier des charges complet
│   ├── grading-criteria.md      # Critères de notation
│   └── moscow.md                # Priorisation MoSCoW
├── architecture/                # Architecture technique
│   ├── overview.md              # Vue d'ensemble
│   ├── database.md              # Modèle de données
│   └── folder-structure.md      # Structure des dossiers
└── uml/                         # Diagrammes UML
    ├── classes.puml             # Diagramme de classes
    ├── database-schema.puml     # Schéma de base de données
    └── entities.md              # Description des entités
```

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Backend** | Rust + Axum + Tokio |
| **Base de données** | PostgreSQL (relationnel) + MongoDB (messages) |
| **Temps réel** | WebSockets |
| **Styling** | Tailwind CSS 4 |

## Fonctionnalites principales

- **Authentification** : Inscription/Connexion JWT
- **Serveurs** : Création, rejoindre via code d'invitation
- **Canaux** : Canaux textuels par serveur
- **Messages** : Temps réel via WebSocket
- **Rôles** : Owner / Admin / Member (RBAC)
- **Présence** : Utilisateurs connectés, indicateur de frappe

## 📖 Liens rapides

- [Spécifications complètes](./specifications/requirements.md)
- [Architecture technique](./architecture/overview.md)
- [Schéma de base de données](./architecture/database.md)
- [Diagramme de classes](./uml/classes.puml)
