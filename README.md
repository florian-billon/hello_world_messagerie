<div align="center">

<img src="frontend/public/logo.png" width="120" alt="Hello World" />

<h1><a href="https://hello-world-messagerie-jfk7-5vqlt1b3u-florian-billons-projects.vercel.app">Hello World</a></h1>

<p><strong>Real-time messaging platform inspired by Discord</strong></p>

<p>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-1.91+-orange.svg?style=flat-square&logo=rust&logoColor=white" alt="Rust 1.91+" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 15" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-7-47A248.svg?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB 7" /></a>
</p>

</div>

---

## 1. Le projet

**Hello World** est une application de messagerie temps réel (type Discord) : backend Rust (Axum), frontend Next.js. Les données relationnelles (utilisateurs, serveurs, canaux, membres, invitations) sont dans PostgreSQL ; l’historique des messages est dans MongoDB pour la scalabilité.

### Fonctionnalités

- Authentification JWT + hachage bcrypt
- Serveurs et rôles (Owner / Admin / Member)
- Canaux texte avec ordre par position
- Messagerie temps réel via WebSocket avec indicateur « en train d’écrire » (sidebar + au-dessus du champ message)
- Profils utilisateur et statuts (Online / Offline / DND / Invisible)
- Gestion des membres : kick, ban (temporaire ou permanent)
- Édition de messages (fenêtre 5 minutes)
- Emojis et Unicode
- Système d’invitations avec expiration et limite d’utilisation
- Cartes de profil et actions admin

### Tech Stack

| Couche     | Technologie |
|------------|-------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend    | Rust 1.91, Axum, Tokio, SQLx, driver MongoDB |
| Base de données | PostgreSQL 15 (relationnel), MongoDB 7 (messages) |
| Auth       | JWT (jsonwebtoken), bcrypt |
| Infra      | Docker Compose, GitHub Actions CI/CD |

**Arborescence du projet :**

```
├── backend/
│   ├── src/
│   │   ├── main.rs, ctx.rs, error.rs
│   │   ├── handlers/     # auth, channels, invites, messages, servers, user, user_public
│   │   ├── models/       # channel, invite, message, server, user
│   │   ├── repositories/
│   │   ├── services/     # auth, channels, invites, messages, servers, realtime/
│   │   ├── routes/
│   │   └── web/          # mw_auth, ws/ (connection, handler, hub, protocol)
│   ├── migrations/       # init.sql, mongodb_indexes.js
│   ├── Cargo.toml, Dockerfile
├── frontend/
│   ├── app/              # (auth)/login, register, invite/[code], layout, page
│   ├── components/      # ProfileCard, SmartImg, layout/MemberSidebar, ui/, modals/InviteModal
│   ├── hooks/            # useAuth, useChannels, useMembers, useMessages, useServers, useWebSocket
│   ├── lib/              # api-server, gateway, auth/, config, avatar, theme
│   └── public/           # logo, avatars, background
├── docs/                 # Consignes.pdf, architecture/, specifications/, uml/
├── docker-compose.yml, env.example
└── .github/workflows/ci.yml, railway.json, render.yaml, fly.toml
```

---

## 2. Architecture

```mermaid
flowchart LR
    subgraph client["Client"]
        Browser[Next.js]
    end
    subgraph backend["Backend"]
        API[Axum API]
        WS[WebSocket]
    end
    subgraph data["Data"]
        PG[(PostgreSQL)]
        Mongo[(MongoDB)]
    end
    Browser -->|REST + JWT| API
    Browser -->|/ws| WS
    API --> PG
    API --> Mongo
    WS --> API
```

**Flux simplifié (login puis envoi de message) :**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant P as PostgreSQL
    participant M as MongoDB
    U->>F: Login
    F->>A: POST /auth/login
    A->>P: Check user
    A-->>F: JWT
    U->>F: Send message
    F->>A: POST /channels/:id/messages
    A->>M: Insert
    A-->>F: Broadcast via WS
```

---

## 3. Démarrage (install + config)

### Prérequis

- Rust 1.75+ avec cargo
- Node.js 20+ avec npm
- Docker et Docker Compose (pour les bases locales), ou PostgreSQL 15+ et MongoDB 7+ en cloud (Neon, Atlas)

### Étape 1 — Bases de données

```bash
docker-compose up -d
docker exec -i helloworld-postgres psql -U postgres -d helloworld < backend/migrations/init.sql
```

### Étape 2 — Backend

```bash
cd backend
```

Créer un fichier `.env` à la racine de `backend/` :

```bash
# PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld

# MongoDB
MONGODB_URL=mongodb://localhost:27017

# Auth (à changer en production)
JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_base64_32

# Serveur
PORT=3001
RUST_LOG=info
```

Lancer le serveur :

```bash
cargo run
```

L’API est disponible sur **http://localhost:3001**.

### Étape 3 — Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm install
npm run dev
```

L’application est disponible sur **http://localhost:3000**.

### Variables d’environnement (résumé)

| Contexte  | Variable                 | Description / Exemple |
|-----------|--------------------------|------------------------|
| Backend   | `DATABASE_URL`           | Chaîne de connexion PostgreSQL |
| Backend   | `MONGODB_URL`           | Chaîne de connexion MongoDB |
| Backend   | `JWT_SECRET`            | Clé de signature JWT (min. 32 caractères). Exemple : `openssl rand -base64 32` |
| Backend   | `PORT`                  | Port du serveur (ex. 3001) |
| Backend   | `RUST_LOG`              | Niveau de log (ex. info) |
| Frontend  | `NEXT_PUBLIC_API_URL`   | URL de l’API backend (ex. http://localhost:3001) |

### Production (Neon + Atlas)

- Créer une base PostgreSQL sur [neon.tech](https://neon.tech) et une instance MongoDB sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
- Renseigner les chaînes de connexion dans les variables d’environnement du déploiement.
- Exemple :

```bash
DATABASE_URL=postgres://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=<clé_secrète_32_caractères_minimum>
PORT=3001
RUST_LOG=info
```

- Déploiement : backend (Railway, Render, Fly.io), frontend (Vercel). Voir `railway.json`, `render.yaml`, `fly.toml`.

---

## 4. Référence API & données

### Authentication

| Méthode | Endpoint           | Description |
|---------|--------------------|-------------|
| POST    | `/auth/signup`     | Créer un compte |
| POST    | `/auth/login`      | Connexion et récupération du JWT |
| POST    | `/auth/logout`     | Invalider la session |
| GET     | `/me`              | Profil de l’utilisateur connecté |
| PATCH   | `/me`              | Mettre à jour le profil |

### Servers

| Méthode | Endpoint                                    | Description |
|---------|---------------------------------------------|-------------|
| GET     | `/servers`                                  | Liste des serveurs de l’utilisateur |
| POST    | `/servers`                                  | Créer un serveur |
| GET     | `/servers/{id}`                             | Détail d’un serveur |
| PUT     | `/servers/{id}`                             | Modifier le nom du serveur |
| DELETE  | `/servers/{id}`                             | Supprimer le serveur (owner uniquement) |
| GET     | `/servers/{id}/members`                     | Liste des membres |
| PATCH   | `/servers/{id}/members/{user_id}`           | Changer le rôle d’un membre |
| POST    | `/servers/{id}/members/{user_id}/kick`      | Expulser un membre |
| POST    | `/servers/{id}/members/{user_id}/ban`       | Bannir (temporaire ou permanent) |
| DELETE  | `/servers/{id}/members/{user_id}/ban`       | Débannir |
| GET     | `/servers/{id}/bans`                        | Liste des bans actifs |

### Channels

| Méthode | Endpoint                              | Description |
|---------|--------------------------------------|-------------|
| GET     | `/servers/{server_id}/channels`       | Liste des canaux du serveur |
| POST    | `/servers/{server_id}/channels`       | Créer un canal |
| GET     | `/channels/{id}`                     | Détail d’un canal |
| PUT     | `/channels/{id}`                     | Modifier le nom du canal |
| DELETE  | `/channels/{id}`                     | Supprimer le canal |

### Messages

| Méthode | Endpoint                    | Description |
|---------|-----------------------------|-------------|
| GET     | `/channels/{id}/messages`   | Liste des messages (pagination) |
| POST    | `/channels/{id}/messages`   | Envoyer un message |
| PUT     | `/messages/{id}`           | Modifier un message (auteur, fenêtre 5 min) |
| DELETE  | `/messages/{id}`           | Supprimer un message |

### Invites

| Méthode | Endpoint                  | Description |
|---------|---------------------------|-------------|
| POST    | `/servers/{id}/invites`   | Créer un code d’invitation |
| GET     | `/invites/{code}`         | Détail d’une invitation |
| POST    | `/invites/{code}/use`     | Rejoindre le serveur via l’invitation |
| DELETE  | `/invites/{id}`           | Révoquer l’invitation |

### WebSocket

**Connexion :** `WS /ws` (authentification par JWT).

**Événements serveur :** `MESSAGE_CREATE`, `MESSAGE_UPDATE`, `MESSAGE_DELETE`, `TYPING_START`, `TYPING_STOP`, `PRESENCE_UPDATE`.

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant WS as WebSocket
    participant C2 as Client 2
    C1->>WS: Connect JWT
    C2->>WS: Connect JWT
    C1->>WS: Join channel
    C2->>WS: Join channel
    C1->>WS: Send message
    WS->>C2: MESSAGE_CREATE
    C1->>WS: Typing start
    WS->>C2: TYPING_START
```

### Base de données

**Schéma des tables et relations (PostgreSQL + MongoDB) :**

```mermaid
erDiagram
    users ||--o{ servers : "owns"
    users ||--o{ server_members : "member"
    servers ||--o{ server_members : "has"
    servers ||--o{ channels : "contains"
    servers ||--o{ invites : "has"
    users ||--o{ invites : "creates"
    channels ||--o{ channel_messages : "contains"

    users {
        uuid id PK
        string email
        string password_hash
        string username
        string avatar_url
        string status
        timestamptz created_at
    }

    servers {
        uuid id PK
        uuid owner_id FK
        string name
        timestamptz created_at
        timestamptz updated_at
    }

    server_members {
        uuid server_id PK
        uuid user_id PK
        string role
        timestamptz joined_at
    }

    channels {
        uuid id PK
        uuid server_id FK
        string name
        int position
        timestamptz created_at
        timestamptz updated_at
    }

    invites {
        uuid id PK
        uuid server_id FK
        uuid created_by FK
        string code
        int max_uses
        int uses
        timestamptz expires_at
        boolean revoked
        timestamptz created_at
    }

    channel_messages {
        objectid _id PK
        uuid channel_id
        uuid server_id
        uuid author_id
        string content
        timestamptz created_at
        timestamptz edited_at
        timestamptz deleted_at
    }
```

**PostgreSQL** (schéma dans `backend/migrations/init.sql`) :

- **users** — id, email, password_hash, username, avatar_url, status, created_at
- **servers** — id, name, owner_id, created_at, updated_at
- **server_members** — server_id, user_id, role, joined_at (PK (server_id, user_id))
- **channels** — id, server_id, name, position, created_at, updated_at
- **invites** — id, server_id, code, created_by, expires_at, max_uses, uses, revoked, created_at

**MongoDB** :

- **channel_messages** — historique des messages (message_id, channel_id, server_id, author_id, content, created_at, edited_at, deleted_at)

Schémas détaillés : `docs/uml/database-schema.puml`, `docs/architecture/database.md`.

---

## 5. Tests, déploiement et qualité

### Tests

```bash
cd backend
cargo test
```

Couverture : tests unitaires et d’intégration (validation, règles métier, structures de données).

### Déploiement

- **Backend :** Railway (`railway up`), Render ou Fly.io — voir `railway.json`, `render.yaml`, `fly.toml`.
- **Frontend :** Vercel — `cd frontend && vercel --prod`.

### CI/CD

GitHub Actions sur push vers `main` :

- Backend : build Rust + tests avec services PostgreSQL et MongoDB.
- Frontend : `npm ci` puis `npm run build`.

### Qualité de code

- **Rust :** `cargo fmt`, `cargo clippy` avant de committer.
- **TypeScript / Next.js :** ESLint et Prettier configurés.

---

## 6. À propos

Projet pédagogique Epitech Pre-MSc. Les contributions sont bienvenues dans un cadre d’apprentissage.

**Crédits :** [Axum](https://github.com/tokio-rs/axum), [Next.js](https://nextjs.org/), [PostgreSQL](https://postgresql.org/), [MongoDB](https://mongodb.com/).
