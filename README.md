# Hello World RTC

Application de messagerie en temps reel inspiree de Discord.

## Demarrage Rapide

### Prerequis

- Docker & Docker Compose
- Rust 1.75+ (pour le backend)
- Node.js 20+ (pour le frontend)

### 1. Lancer PostgreSQL

```bash
docker-compose up -d
```

Cela lance PostgreSQL sur le port **5433** (pour eviter les conflits avec une instance locale).

### 2. Initialiser la base de donnees

```bash
docker exec -i helloworld-postgres psql -U postgres -d helloworld < backend/migrations/001_init.sql
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

---

## Variables d'environnement

### Backend (.env) - Optionnel

Le backend fonctionne **sans fichier `.env`** grâce aux valeurs par défaut. Pour personnaliser :

1. Copier `env.example` en `.env` :
```bash
cp env.example .env
```

2. Ajuster les valeurs si nécessaire :
```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld
JWT_SECRET=super_secret_jwt_key_change_in_production
```

**Note** : Le port du backend est fixé à `3001` (hardcodé dans `main.rs`).

### Frontend (.env.local)

```bash
API_URL=http://localhost:3001
```

---

## Tester l'authentification

### Inscription

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Structure du Projet

```
hello-world/
├── backend/          # API Rust/Axum
├── frontend/         # Next.js + TypeScript
├── docs/            # Documentation
└── docker-compose.yml
```

---

## Commandes Utiles

```bash
# Arreter PostgreSQL
docker-compose down

# Voir les logs PostgreSQL
docker-compose logs -f postgres

# Supprimer les donnees (reset complet)
docker-compose down -v
docker-compose up -d
```

---

## Documentation

Voir [docs/README.md](./docs/README.md) pour la documentation complete.
