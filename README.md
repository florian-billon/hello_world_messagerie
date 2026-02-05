# Hello World RTC

Application de messagerie instantanée en temps réel inspirée de Discord.

## 🚀 Démarrage Rapide

### Prérequis

- Docker & Docker Compose
- Rust 1.75+ (pour le backend)
- Node.js 20+ (pour le frontend)

### Installation des dépendances

#### Sur NixOS (recommandé)

Le projet inclut un `shell.nix` pour gérer automatiquement les dépendances :

```bash
# Entrer dans l'environnement de développement
nix-shell

# Ou utiliser direnv (recommandé pour un workflow fluide)
echo "use nix" > .envrc
direnv allow
```

#### Sur autres systèmes

Installez Rust via [rustup](https://rustup.rs/) et Node.js via [nvm](https://github.com/nvm-sh/nvm) ou votre gestionnaire de paquets.

### 1. Lancer PostgreSQL

```bash
docker-compose up -d
```

### 2. Initialiser la base de données

```bash
docker exec -i helloworld-postgres psql -U postgres -d helloworld < backend/migrations/init.sql
```

### 3. Lancer le Backend

```bash
cd backend
cargo run
```

Le backend sera accessible sur `http://localhost:3001`

### 4. Lancer le Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 📚 Documentation

La documentation complète est disponible dans le dossier [`docs/`](./docs/README.md) :

- [Spécifications](./docs/specifications/requirements.md)
- [Architecture technique](./docs/architecture/overview.md)
- [Schéma de base de données](./docs/architecture/database.md)
- [Guide de déploiement](./DEPLOY.md)

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript + Tailwind CSS |
| **Backend** | Rust + Axum + Tokio |
| **Base de données** | PostgreSQL (relationnel) + MongoDB (messages) |
| **Authentification** | JWT + bcrypt |

## ✨ Fonctionnalités

- ✅ Authentification (inscription/connexion)
- ✅ Gestion des serveurs (création, rejoindre)
- ✅ Canaux textuels par serveur
- ✅ Messages en temps réel (polling, WebSocket prévu)
- ✅ Rôles et permissions (Owner/Admin/Member)
- ✅ Profils utilisateurs

## 🔧 Variables d'environnement

Voir [`env.example`](./env.example) pour la configuration complète.

### Backend (.env)

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your_super_secret_key_change_in_production
PORT=3001
```

### Frontend (.env.local)

```bash
API_URL=http://localhost:3001
```

## 📦 Déploiement

Voir le [Guide de Déploiement](./DEPLOY.md) pour les instructions détaillées.

Solutions supportées :
- **Render** (recommandé pour organisations GitHub)
- **Fly.io** (CLI, pas besoin de permissions GitHub)

## 👥 Équipe

- **Romeo** - Backend Rust
- **Bilel** - Frontend
- **Florian** - Frontend/Design

## 📄 Licence

Projet académique - Epitech MSc Pro 2028
