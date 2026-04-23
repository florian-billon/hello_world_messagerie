# Structure des dossiers - Hello World RTC

## Vue d'ensemble

Le depot contient un seul backend Rust, situe dans `backend/`, et un frontend Next.js dans `frontend/`.
Il n'y a pas de `src/` valide a la racine du projet.

```text
.
├── assets/                     # Logos et illustrations
├── backend/                    # API Rust / Axum
├── docs/                       # Documentation fonctionnelle et technique
├── frontend/                   # Application Next.js
├── docker-compose.yml          # Postgres + MongoDB pour le dev local
├── env.example                 # Variables d'environnement d'exemple
├── README.md                   # Documentation principale
└── render.yaml                 # Configuration de deploiement Render
```

## Backend

```text
backend/
├── Cargo.toml
├── Cargo.lock
├── Dockerfile
├── migrations/                 # Schema SQLx Postgres + script indexes Mongo
└── src/
    ├── main.rs                 # Point d'entree Axum
    ├── ctx.rs                  # Contexte utilisateur resolu par middleware
    ├── error.rs                # Erreurs HTTP / applicatives
    ├── handlers/               # Handlers HTTP
    ├── models/                 # DTOs et modeles de domaine
    ├── repositories/           # Acces Postgres / Mongo
    ├── routes/                 # Assemblage des routes Axum
    ├── services/               # Logique metier et temps reel
    └── web/                    # Middleware auth et WebSocket
```

### Sous-dossiers backend importants

- `backend/src/handlers/` : auth, serveurs, canaux, invitations, messages, amis, upload, DM.
- `backend/src/repositories/` : acces aux utilisateurs, serveurs, channels, DMs, friendships et messages.
- `backend/src/services/` : auth, JWT, mots de passe, validation des usernames, temps reel.
- `backend/src/web/ws/` : protocole WebSocket, hub, connexion, metrics.
- `backend/migrations/` : initialisation Postgres et migrations incrementales.

## Frontend

```text
frontend/
├── app/                        # Pages App Router
├── components/                 # Composants UI
├── hooks/                      # Hooks React metier
├── lib/                        # API client, auth, gateway WS, helpers
├── messages/                   # Fichiers de traduction
├── modals/                     # Modales dediees
├── public/                     # Assets servis par Next.js
├── package.json
└── next.config.ts
```

### Sous-dossiers frontend importants

- `frontend/app/` : pages principales, layout global, providers.
- `frontend/hooks/` : `useAuth`, `useServers`, `useChannels`, `useMessages`, `useWebSocket`, etc.
- `frontend/lib/` : appels API serveur, auth, config, presence et passerelle WebSocket.
- `frontend/components/` : composants de page, UI et cartes de profil.

## Documentation

```text
docs/
├── architecture/
├── specifications/
├── uml/
├── README.md
└── specification.txt
```

## Regle de structure

- Le code Rust executable vit uniquement dans `backend/src/`.
- Le code frontend vit uniquement dans `frontend/`.
- Si un nouveau dossier racine ressemble a une copie de `backend/src/`, c'est un vestige a supprimer plutot qu'une seconde source de verite.
