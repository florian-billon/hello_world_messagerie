<div align="center">

<img src="frontend/public/logo.png" width="120" alt="Hello World" />

<h1><a href="https://hello-world-messagerie-jfk7.vercel.app">Hello World</a></h1>

<p><strong>Application de messagerie temps réel inspirée de Discord</strong></p>

<p>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-1.91+-orange.svg?style=flat-square&logo=rust&logoColor=white" alt="Rust 1.91+" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 15" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-7-47A248.svg?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB 7" /></a>
</p>

<p align="center">
  <a href="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/backend-ci.yml"><img src="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/backend-ci.yml/badge.svg?branch=main" alt="Backend CI" /></a>
  <a href="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/frontend-ci.yml"><img src="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/frontend-ci.yml/badge.svg?branch=main" alt="Frontend CI" /></a>
</p>

</div>

---

## 1. Le projet

**Hello World** est une application de messagerie temps réel inspirée de Discord construite sur une architecture hybride (Backend Rust Axum / Frontend Next.js). Une version stable est disponible en téléchargement sur la page des [releases](https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/releases/latest).

Les données relationnelles sont administrées via PostgreSQL, tandis que la persistence des historiques de messages est assurée par MongoDB pour garantir la scalabilité.

Le frontend a été préparé pour une migration desktop : il fonctionne désormais sans runtime serveur Next obligatoire et peut être exporté en statique via `npm run build` (`frontend/out/`).

### Fonctionnalités

- Authentification JWT + hachage bcrypt
- Serveurs et rôles (Owner / Admin / Member)
- Canaux texte avec ordre par position
- Messagerie temps réel via WebSocket avec indicateur "en train d'écrire"
- Messages privés entre utilisateurs
- Réactions emoji sur messages de canaux et messages privés
- GIF via intégration Giphy
- Edition / suppression de messages dans les canaux et en MP
- Profils utilisateur et statuts (Online / Offline / DND / Invisible)
- Recherche d'utilisateurs et ajout d'amis
- Gestion des membres : kick, ban (temporaire ou permanent), transfert de propriété
- Système d'invitations avec expiration et limite d'utilisation
- Interface multilingue (FR / EN)
- Export statique Next.js prêt pour intégration Tauri

### Tech Stack

| Couche          | Technologie |
|-----------------|-------------|
| Frontend        | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend         | Rust 1.91, Axum, Tokio, SQLx, driver MongoDB |
| **Desktop**     | **Tauri v2 (Rust)** |
| Base de données | PostgreSQL (relationnel via Neon), MongoDB (messages via Atlas) |
| Auth            | JWT (jsonwebtoken), bcrypt |
| Infra           | Render (backend), Vercel (frontend), GitHub Actions CI/CD |

---

## 2. Architecture

Le frontend Next.js communique avec le backend Axum via REST (Bearer JWT) et WebSocket (temps réel). Le backend accède à PostgreSQL pour les données relationnelles et à MongoDB pour les messages.

```
Browser (Next.js)  --->  REST + JWT  --->  Axum API  --->  PostgreSQL (Neon)
                   --->  WebSocket   --->             --->  MongoDB (Atlas)
```

Depuis la refonte du frontend :
- l'auth frontend repose sur un token stocké côté client
- le middleware `proxy.ts` a été supprimé
- le build Next est exportable statiquement (`output: "export"`)

**Arborescence du projet :**

```
├── backend/
│   ├── src/
│   │   ├── main.rs              # Point d'entrée, config CORS, routes
│   │   ├── handlers/            # Auth, channels, invites, messages, direct messages, users
│   │   ├── models/              # Modèles SQL / Mongo / WS
│   │   ├── repositories/        # Couche d'accès aux données
│   │   ├── services/            # Logique métier + bootstrap + realtime
│   │   ├── routes/              # Définition des routes Axum
│   │   └── web/                 # Middleware auth, WebSocket (hub, handler, protocol)
│   ├── migrations/
│   │   ├── init.sql             # Bootstrap PostgreSQL unique
│   │   └── init.mongo.js        # Bootstrap MongoDB unique
│   └── Dockerfile
├── frontend/
│   ├── app/                     # Pages statiques : login, register, invite, home, messages
│   ├── components/              # UI, profils, réactions, sidebar, chat
│   ├── hooks/                   # useAuth, useChannels, useMessages, useWebSocket, etc.
│   ├── lib/                     # api-client, auth client, token storage, runtime, gateway WS
│   ├── messages/                # Traductions FR / EN
│   └── public/                  # Assets frontend
├── docs/                        # Consignes, spécifications, UML
│   ├── pdf/                     # Consignes officielles PDF
│   ├── specifications/          # Grading criteria et synthèse technique
│   ├── uml/                     # Diagrammes de structure (PlantUML)
│   └── cloc-report.md           # Statistiques de code
├── docker-compose.yml           # Bases de données locales (dev)
├── render.yaml                  # Configuration Render (production)
└── .github/workflows/           # CI backend + frontend
```

---

## 3. Démarrage (dev local)

### Prérequis

- Rust 1.75+ avec cargo
- Node.js 20+ avec npm
- Docker et Docker Compose (pour les bases locales)

### Etape 1 — Bases de données

```bash
docker-compose up -d
docker exec -i helloworld-postgres psql -U postgres -d helloworld < backend/migrations/init.sql
mongosh "mongodb://localhost:27017/helloworld" --file backend/migrations/init.mongo.js
```

### Etape 2 — Backend

Créer `backend/.env` :

```bash
    DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld
    MONGODB_URL=mongodb://localhost:27017
    JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_base64_32
    ALLOWED_ORIGINS=http://localhost:3002,http://127.0.0.1:3002
    PORT=3005
    RUST_LOG=info
    ```
    
    ```bash
    cd backend && cargo run
    ```
    
    L'API est disponible sur **http://localhost:3005**.
    
    ### Etape 3 — Frontend
    
    ```bash
    cd frontend
    echo "NEXT_PUBLIC_API_URL=http://localhost:3005" > .env.local
    npm ci
    npm run dev
    ```
    
    L'application est disponible sur **http://localhost:3002**.

### Etape 4 — Export statique

```bash
cd frontend
npm run build
```

Le build statique est généré dans **`frontend/out/`**.

### Etape 5 — Desktop (Tauri)

Pour lancer la version Desktop en mode développement :

```bash
cd frontend
npm run tauri dev
```

**Note pour les utilisateurs Linux (NixOS / Hyprland / Wayland) :**
Un script de lancement robuste est disponible à la racine du projet. Il gère automatiquement les certificats SSL (pour Giphy), les schémas GTK (pour l'upload) et les fix de rendu pour Wayland :
```bash
./dev.sh
```

**Note technique pour NixOS :**
Le fichier `frontend/shell.nix` configure tout l'environnement nécessaire (WebKitGTK, GIO, SSL). Le script `dev.sh` l'utilise automatiquement via `nix-shell`.

---

## 4. Production

| Service    | Plateforme   | URL |
|------------|-------------|-----|
| Frontend   | Vercel      | `https://hello-world-messagerie-jfk7.vercel.app` |
| Backend    | Render      | `https://hello-world-messagerie-d5p2.onrender.com` |
| PostgreSQL | Neon        | Serverless Postgres managé |
| MongoDB    | Atlas       | Cluster managé |

**Variables d'environnement Render (backend) :**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne de connexion Neon (`postgres://...@...neon.tech/neondb?sslmode=require`) |
| `MONGODB_URL` | Chaîne de connexion Atlas (`mongodb+srv://...`) |
| `JWT_SECRET` | Clé de signature JWT (min. 32 caractères) |
| `ALLOWED_ORIGINS` | URLs frontend autorisées (séparées par des virgules) |
| `PORT` | Port du serveur (3001) |
| `RUST_LOG` | Niveau de log (info) |

Important :
- Saisir les valeurs Render et Vercel sans guillemets autour des URLs ou secrets.
- `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_GIPHY_API_KEY` sont des variables frontend, à configurer sur Vercel plutôt que sur le service backend Render.

**Variables d'environnement Vercel (frontend) :**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL du backend Render (`https://hello-world-messagerie-d5p2.onrender.com`) |
| `NEXT_PUBLIC_GIPHY_API_KEY` | Clé publique GIPHY utilisée par le sélecteur de GIF |

Le déploiement est automatique sur push vers `main` (Render via `render.yaml`, Vercel via intégration GitHub).

---

## 5. API

Toutes les routes sauf auth nécessitent un header `Authorization: Bearer <JWT>`.

### Vue d'ensemble

```mermaid
flowchart LR
    User[Utilisateur]
    Web[Frontend Next.js / Vercel]
    Desktop[Desktop Tauri]
    API[Backend Rust / Render]
    WS[WebSocket /ws]
    PG[(PostgreSQL / Neon)]
    MG[(MongoDB Atlas)]
    GIF[GIPHY API]

    User --> Web
    User --> Desktop
    Web --> API
    Desktop --> API
    Web --> WS
    Desktop --> WS
    API --> PG
    API --> MG
    Web --> GIF
    Desktop --> GIF
```

### Auth

| Méthode | Endpoint         | Description |
|---------|------------------|-------------|
| POST    | `/auth/signup`   | Créer un compte |
| POST    | `/auth/login`    | Connexion (retourne un JWT) |
| POST    | `/auth/logout`   | Déconnexion (passe le statut offline) |
| GET     | `/me`            | Profil de l'utilisateur connecté |
| PATCH   | `/me`            | Mettre à jour son profil (username, avatar, statut) |
| GET     | `/users/search`  | Recherche d'utilisateurs |
| GET     | `/users/{id}/profile` | Profil public |
| POST    | `/friends/{id}`  | Ajouter un ami |
| GET     | `/friends`       | Liste des amis |

### Serveurs

| Méthode | Endpoint                              | Description |
|---------|---------------------------------------|-------------|
| GET     | `/servers`                            | Liste des serveurs de l'utilisateur |
| POST    | `/servers`                            | Créer un serveur |
| GET     | `/servers/{id}`                       | Détail d'un serveur |
| PUT     | `/servers/{id}`                       | Modifier le nom |
| DELETE  | `/servers/{id}`                       | Supprimer (owner uniquement) |
| POST    | `/servers/{id}/join`                  | Rejoindre un serveur |
| DELETE  | `/servers/{id}/leave`                 | Quitter un serveur |
| GET     | `/servers/{id}/members`               | Liste des membres |
| PUT     | `/servers/{id}/members/{userId}`      | Changer le rôle d'un membre |
| DELETE  | `/servers/{id}/members/{userId}`      | Kick un membre |
| POST    | `/servers/{id}/members/{userId}/ban`  | Bannir (temporaire ou permanent) |
| DELETE  | `/servers/{id}/members/{userId}/ban`  | Débannir |
| GET     | `/servers/{id}/bans`                  | Liste des bans actifs |
| PUT     | `/servers/{id}/transfer`              | Transférer la propriété du serveur |

### Canaux

| Méthode | Endpoint                          | Description |
|---------|----------------------------------|-------------|
| GET     | `/servers/{server_id}/channels`   | Liste des canaux du serveur |
| POST    | `/servers/{server_id}/channels`   | Créer un canal |
| GET     | `/channels/{id}`                 | Détail d'un canal |
| PUT     | `/channels/{id}`                 | Modifier le nom |
| DELETE  | `/channels/{id}`                 | Supprimer le canal |

### Messages

| Méthode | Endpoint                    | Description |
|---------|-----------------------------|-------------|
| GET     | `/channels/{id}/messages`   | Liste des messages (pagination) |
| POST    | `/channels/{id}/messages`   | Envoyer un message |
| PUT     | `/messages/{id}`           | Modifier un message (auteur, fenêtre 5 min) |
| DELETE  | `/messages/{id}`           | Supprimer un message |
| POST    | `/messages/{id}/reactions` | Ajouter / basculer une réaction |
| DELETE  | `/messages/{id}/reactions` | Retirer une réaction |

### Messages privés

| Méthode | Endpoint                                  | Description |
|---------|-------------------------------------------|-------------|
| GET     | `/conversations`                          | Liste des conversations privées de l'utilisateur |
| POST    | `/conversations`                          | Créer ou récupérer une conversation privée (`target_username`) |
| GET     | `/conversations/{id}/messages`            | Liste des messages privés d'une conversation |
| POST    | `/conversations/{id}/messages`            | Envoyer un message privé |
| PUT     | `/conversations/messages/{id}`            | Modifier un message privé |
| DELETE  | `/conversations/messages/{id}`            | Supprimer un message privé |
| POST    | `/conversations/messages/{id}/reactions`  | Ajouter une réaction en MP |
| DELETE  | `/conversations/messages/{id}/reactions`  | Retirer une réaction en MP |

### Invitations

| Méthode | Endpoint                      | Description |
|---------|-------------------------------|-------------|
| POST    | `/servers/{id}/invites`   | Créer une invitation |
| GET     | `/servers/{id}/invites`   | Liste des invitations du serveur |
| GET     | `/invites/{code}`         | Détail d'une invitation |
| POST    | `/invites/{code}/accept`  | Accepter une invitation |

### WebSocket

Connexion : `WS /ws` avec JWT en paramètre. Une fois connecté, le client rejoint des canaux et reçoit les événements en temps réel.

Événements principaux :
- `MESSAGE_CREATE`, `MESSAGE_UPDATE`, `MESSAGE_DELETE`, `MESSAGE_REACTION_UPDATE`
- `DIRECT_MESSAGE_CREATE`, `DIRECT_MESSAGE_UPDATE`, `DIRECT_MESSAGE_DELETE`, `DIRECT_MESSAGE_REACTION_UPDATE`
- `TYPING_START`, `TYPING_STOP`, `PRESENCE_UPDATE`

---

## 6. Base de données

### Vue d'ensemble du modèle relationnel

```mermaid
erDiagram
    users ||--o{ servers : owns
    users ||--o{ server_members : joins
    servers ||--o{ server_members : contains
    servers ||--o{ channels : contains
    users ||--o{ invites : creates
    servers ||--o{ invites : exposes
    users ||--o{ server_bans : targets
    users ||--o{ server_bans : issues
    servers ||--o{ server_bans : applies
    users ||--o{ direct_messages : starts
    users ||--o{ direct_messages : receives

    users {
        uuid id PK
        string email
        string password_hash
        string username
        string avatar_url
        string status
        timestamp created_at
    }

    servers {
        uuid id PK
        string name
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    server_members {
        uuid server_id
        uuid user_id
        string role
        timestamp joined_at
    }

    channels {
        uuid id PK
        uuid server_id FK
        string name
        int position
        timestamp created_at
        timestamp updated_at
    }

    invites {
        uuid id PK
        uuid server_id FK
        string code
        uuid created_by FK
        timestamp expires_at
        int max_uses
        int uses
        bool revoked
        timestamp created_at
    }

    server_bans {
        uuid server_id
        uuid user_id
        uuid banned_by
        string reason
        timestamp expires_at
        timestamp banned_at
    }

    direct_messages {
        uuid id PK
        uuid user_one_id FK
        uuid user_two_id FK
        timestamp created_at
        timestamp updated_at
    }
```

**PostgreSQL** (schéma complet dans `backend/migrations/init.sql`) :

- **users** — id (UUID), email, password_hash, username, avatar_url, status (enum: Online/Offline/Dnd/Invisible), created_at
- **servers** — id (UUID), name, owner_id (FK users), created_at, updated_at
- **server_members** — server_id + user_id (PK composite), role (enum: owner/admin/member), joined_at
- **channels** — id (UUID), server_id (FK servers), name, position, created_at, updated_at
- **invites** — id (UUID), server_id (FK servers), code (unique), created_by (FK users), expires_at, max_uses, uses, revoked, created_at
- **server_bans** — server_id + user_id (PK composite), banned_by (FK users), reason, expires_at, banned_at
- **direct_messages** — conversations privées entre deux utilisateurs

**MongoDB** (base `helloworld`) :

- **channel_messages** — message_id, channel_id, server_id, author_id, content, created_at, edited_at, deleted_at
- **direct_message_items** — message_id, dm_id, author_id, content, created_at, edited_at, deleted_at

Les historiques de messages de canaux et de conversations privées sont stockés dans MongoDB pour permettre une scalabilité indépendante de l'historique de chat par rapport aux données relationnelles. PostgreSQL garde les conversations privées (`direct_messages`) afin de conserver les contraintes relationnelles et le contrôle d'accès.

---

## 7. Tests et qualité

Commandes utiles :

```bash
cd backend && cargo test
cd frontend && npm run lint
cd frontend && npm run build
```

**CI/CD** (GitHub Actions sur push vers `main`) :
- Backend : build Rust, tests, clippy, fmt

### Milestones

- [x] `milestone_1` : First milestone achieved and complete
- [x] `milestone_2` : Second milestone achieved and complete
- [x] `milestone_3` : Third milestone achieved and complete

### Web

- [x] `web_server` : serveur NodeJS ou Rust avec connexions simultanées
- [x] `web_client` : client ReactJS ou NextJS connecté au serveur
- [x] `web_core_features` : kick, bans temporaires / permanents, édition de message
- [x] `web_multilingual` : interface en au moins 2 langues
- [x] `web_api_integration` : API GIF intégrée
- [x] `web_pm` : messages privés entre utilisateurs
- [x] `web_reactions` : réactions emoji sur les messages

### Desktop

- [x] `desktop_app` : application desktop livrable et fonctionnelle
- [x] `desktop_specs` : Tauri connecté au serveur
- [x] `desktop_multilingual` : desktop traduit (FR/EN via le partage de code frontend)
- [x] `desktop_notifications` : notifications desktop

### Tests

- [ ] `tests_unit` : au moins 70% du code testé (Historique technique)
- [x] `tests_sequence` : séquence de test livrée et facile à lancer (`cargo test`)
- [x] `tests_automation` : tests automatisés en CI
- [ ] `tests_coverage` : mesure de couverture livrée

### Repo

- [x] `repo_versioning` : workflow Git, commits réguliers, messages descriptifs, `.gitignore`
- [x] `repo_secrets` : audit final des secrets effectué
- [x] `repo_cicd` : build/tests automatiques sur création de tag
- [x] `repo_doc` : README/documentation newcomer-friendly

### Code

- [x] `code_style` : conformité aux bonnes pratiques et standards
- [x] `code_maintainability` : maintenabilité, lisibilité, atomicité, structure claire

### Présentation

- [ ] `proj_pres` : présentation professionnelle (slides/demo)
- [ ] `proj_review` : une feature revue pendant la présentation
- [ ] `proj_answers` : capacité à répondre aux questions
- [x] `proj_orga` : preuve d'organisation projet (via task.md et logs globaux)

### Extras

- [x] `extra_small` : au moins 1 feature extra (File Upload sécurisé)
- [x] `extra_medium` : au moins 3 features extra (Upload, Tauri Standalone Boot, WS Metrics)
- [x] `extra_large` : plus de 5 features extra (Upload Natif, NixOS/Wayland Fixes, i18n switcher, WS Metrics)

## 9. A propos

Projet pédagogique Epitech Pre-MSc.

**Crédits :** [Axum](https://github.com/tokio-rs/axum), [Next.js](https://nextjs.org/), [PostgreSQL](https://postgresql.org/), [MongoDB](https://mongodb.com/).
