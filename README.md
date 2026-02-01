# Hello World - Real Time Messaging Platform

Une plateforme de messagerie en temps reel construite avec **Next.js 16** (frontend) et **Rust/Axum** (backend).

## Architecture

```
hello-world/
├── backend/              # API Rust avec Axum
│   ├── src/
│   │   ├── main.rs       # Entry point + router
│   │   ├── handlers/     # HTTP handlers
│   │   ├── models/       # Data structures
│   │   └── services/     # Business logic
│   ├── migrations/       # SQL migrations
│   └── Cargo.toml
├── frontend/             # Application Next.js
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   └── package.json
├── docs/                 # Documentation
│   ├── specifications/
│   ├── architecture/
│   └── uml/
└── README.md
```

## Demarrage rapide

### Prerequis

- **Rust** (derniere version stable)
- **Node.js** 18+ et **npm**
- **PostgreSQL** 14+
- **MongoDB** 6+

### Backend (Rust)

```bash
cd backend
cargo run
```

Le serveur demarre sur `http://localhost:3001`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

L'application demarre sur `http://localhost:3000`

## API Endpoints

### Authentication

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/signup` | Creer un compte |
| POST | `/auth/login` | Se connecter |
| POST | `/auth/logout` | Se deconnecter |
| GET | `/me` | Utilisateur courant |

### Servers

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/servers` | Liste tous les serveurs |
| POST | `/servers` | Cree un serveur |
| GET | `/servers/{id}` | Recupere un serveur |
| PUT | `/servers/{id}` | Modifie un serveur |
| DELETE | `/servers/{id}` | Supprime un serveur |

## Stack technique

### Frontend
- **Next.js 16** - Framework React
- **React 19** - UI Library
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Styling utility-first

### Backend
- **Rust** - Langage systeme performant
- **Axum** - Framework web async
- **Tokio** - Runtime async
- **SQLx** - PostgreSQL driver
- **JWT** - Authentication

### Databases
- **PostgreSQL** - Users, Servers, Channels, Roles
- **MongoDB** - Message history

## License

MIT
