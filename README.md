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

<p>
  <a href="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/backend-ci.yml"><img src="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/backend-ci.yml/badge.svg?branch=main" alt="Backend CI" /></a>
  <a href="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/frontend-ci.yml"><img src="https://github.com/EpitechMscProPromo2028/T-DEV-600-PAR_27/actions/workflows/frontend-ci.yml/badge.svg?branch=main" alt="Frontend CI" /></a>
</p>

</div>

---

## 1. Le projet

**Hello World** est une application de messagerie temps réel (type Discord) avec un backend Rust (Axum) et un frontend Next.js. Les données relationnelles (utilisateurs, serveurs, canaux, membres, invitations) sont stockées dans PostgreSQL. L'historique des messages est dans MongoDB pour la scalabilité.

### Fonctionnalités

- Authentification JWT + hachage bcrypt
- Serveurs et rôles (Owner / Admin / Member)
- Canaux texte avec ordre par position
- Messagerie temps réel via WebSocket avec indicateur "en train d'écrire"
- Messages privés entre utilisateurs
- Profils utilisateur et statuts (Online / Offline / DND / Invisible)
- Gestion des membres : kick, ban (temporaire ou permanent), transfert de propriété
- Edition de messages (fenêtre 5 minutes)
- Emojis et Unicode
- Système d'invitations avec expiration et limite d'utilisation
- Cartes de profil et actions admin

### Tech Stack

| Couche          | Technologie |
|-----------------|-------------|
| Frontend        | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend         | Rust 1.91, Axum, Tokio, SQLx, driver MongoDB |
| Base de données | PostgreSQL (relationnel via Neon), MongoDB (messages via Atlas) |
| Auth            | JWT (jsonwebtoken), bcrypt |
| Infra           | Render (backend), Vercel (frontend), GitHub Actions CI/CD |

---

## 2. Architecture

Le frontend Next.js communique avec le backend Axum via REST (authentifié par JWT) et WebSocket (temps réel). Le backend accède à PostgreSQL pour les données relationnelles et à MongoDB pour les messages.

```
Browser (Next.js)  --->  REST + JWT  --->  Axum API  --->  PostgreSQL (Neon)
                   --->  WebSocket   --->             --->  MongoDB (Atlas)
```

**Arborescence du projet :**

```
├── backend/
│   ├── src/
│   │   ├── main.rs              # Point d'entrée, config CORS, routes
│   │   ├── handlers/            # auth, channels, invites, messages, servers, user
│   │   ├── models/              # channel, invite, message, server, user
│   │   ├── repositories/        # Couche d'accès aux données
│   │   ├── services/            # Logique métier + realtime (typing, presence)
│   │   ├── routes/              # Définition des routes Axum
│   │   └── web/                 # Middleware auth, WebSocket (hub, handler, protocol)
│   ├── migrations/              # init.sql (schéma PostgreSQL)
│   └── Dockerfile
├── frontend/
│   ├── app/                     # Pages : login, register, invite/[code], home
│   ├── components/              # ProfileCard, MemberSidebar, InviteModal, etc.
│   ├── hooks/                   # useAuth, useChannels, useMessages, useWebSocket, etc.
│   └── lib/                     # API client, auth actions, config, gateway WS
├── docs/                        # Consignes, architecture, specifications, UML
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
```

### Etape 2 — Backend

Créer `backend/.env` :

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_base64_32
ALLOWED_ORIGINS=http://localhost:3002,http://127.0.0.1:3002
PORT=3001
RUST_LOG=info
```

```bash
cd backend && cargo run
```

L'API est disponible sur **http://localhost:3001**.

### Etape 3 — Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm install && npm run dev
```

L'application est disponible sur **http://localhost:3002**.

---

## 4. Production

| Service    | Plateforme   | URL |
|------------|-------------|-----|
| Frontend   | Vercel      | `https://hello-world-messagerie-jfk7.vercel.app` |
| Backend    | Render      | `https://hello-world-messagerie-1.onrender.com` |
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
| `NEXT_PUBLIC_API_URL` | URL du backend Render (`https://hello-world-messagerie-1.onrender.com`) |
| `NEXT_PUBLIC_GIPHY_API_KEY` | Clé publique GIPHY utilisée par le sélecteur de GIF |

Le déploiement est automatique sur push vers `main` (Render via `render.yaml`, Vercel via intégration GitHub).

---

## 5. API

Toutes les routes sauf auth nécessitent un header `Authorization: Bearer <JWT>`.

### Auth

| Méthode | Endpoint         | Description |
|---------|------------------|-------------|
| POST    | `/auth/signup`   | Créer un compte |
| POST    | `/auth/login`    | Connexion (retourne un JWT) |
| POST    | `/auth/logout`   | Déconnexion (passe le statut offline) |
| GET     | `/me`            | Profil de l'utilisateur connecté |
| PATCH   | `/me`            | Mettre à jour son profil (username, avatar, statut) |

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

### Messages privés

| Méthode | Endpoint                                  | Description |
|---------|-------------------------------------------|-------------|
| GET     | `/conversations`                          | Liste des conversations privées de l'utilisateur |
| POST    | `/conversations`                          | Créer ou récupérer une conversation privée (`target_username`) |
| GET     | `/conversations/{id}/messages`            | Liste des messages privés d'une conversation |
| POST    | `/conversations/{id}/messages`            | Envoyer un message privé |

### Invitations

| Méthode | Endpoint                      | Description |
|---------|-------------------------------|-------------|
| POST    | `/servers/{id}/invites`       | Créer une invitation |
| GET     | `/servers/{id}/invites`       | Liste des invitations du serveur |
| GET     | `/invites/{code}`             | Détail d'une invitation |
| POST    | `/invites/{code}/accept`      | Accepter une invitation |
| POST    | `/invites/join`               | Rejoindre via un code |

### WebSocket

Connexion : `WS /ws` avec JWT en paramètre. Une fois connecté, le client rejoint des canaux et reçoit les événements en temps réel.

Événements : `MESSAGE_CREATE`, `MESSAGE_UPDATE`, `MESSAGE_DELETE`, `TYPING_START`, `TYPING_STOP`, `PRESENCE_UPDATE`.

---

## 6. Base de données

**PostgreSQL** (schéma complet dans `backend/migrations/init.sql`) :

- **users** — id (UUID), email, password_hash, username, avatar_url, status (enum: online/offline/dnd/invisible), created_at
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

----

## 7. Tests et qualité

```bash
cd backend && cargo test
```

**CI/CD** (GitHub Actions sur push vers `main`) :
- Backend : build Rust, tests, clippy, fmt, cargo-audit
- Frontend : ESLint, build Next.js, npm audit

**Qualité de code** : `cargo fmt` + `cargo clippy` (Rust), ESLint (TypeScript).

----

## 8. A propos

Projet pédagogique Epitech Pre-MSc.

**Crédits :** [Axum](https://github.com/tokio-rs/axum), [Next.js](https://nextjs.org/), [PostgreSQL](https://postgresql.org/), [MongoDB](https://mongodb.com/).