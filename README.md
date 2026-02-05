# Hello World RTC - Real-Time Chat Application

Application de messagerie en temps réel inspirée de Discord, construite avec Rust (Axum) et Next.js.

---

## Démarrage Rapide

### Étape 1 : Vérifier les prérequis

```bash
# Vérifier Docker
docker --version

# Vérifier Rust (backend)
rustc --version

# Vérifier Node.js (frontend)
node --version
npm --version
```

**Prérequis nécessaires :**
- Docker et Docker Compose
- Rust 1.75+
- Node.js 20+ et npm

### Étape 2 : Lancer les bases de données

```bash
# Lancer PostgreSQL et MongoDB
docker-compose up -d
```

**Vérification :**
```bash
docker-compose ps
```

Vous devriez voir :
- `helloworld-postgres` : Status `Up (healthy)`
- `helloworld-mongodb` : Status `Up (healthy)`

**Si MongoDB n'apparaît pas :**
```bash
docker-compose up -d mongodb
```

### Étape 3 : Appliquer les migrations (première fois uniquement)

**3.1. Migration PostgreSQL :**

```bash
psql -h localhost -p 5433 -U postgres -d helloworld -f backend/migrations/init.sql
```

**Mot de passe :** `postgres`

**Résultat attendu :**
```
CREATE TYPE
CREATE TYPE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
```

**3.2. Migration MongoDB :**

```bash
docker exec -i helloworld-mongodb mongosh helloworld < backend/migrations/mongodb_indexes.js
```

**Résultat attendu :**
```
idx_channel_messages_channel_created
idx_channel_messages_message_id
idx_channel_messages_server
idx_channel_messages_author
```

> **Note:** Les migrations ne sont nécessaires qu'une seule fois. Si les bases sont déjà initialisées, vous pouvez passer cette étape.

### Étape 4 : Lancer le backend

**Dans un terminal :**

```bash
cd backend
cargo run
```

**Première compilation :** Peut prendre 2-5 minutes.

**Résultat attendu :**
```
Compiling hello-world-backend v0.1.0
...
Finished `dev` profile
Running `target/debug/hello-world-backend`
Server running on http://localhost:3001
```

**Vérification :**
```bash
# Dans un autre terminal
curl http://localhost:3001/health
# Devrait retourner: OK
```

**Si le port est déjà utilisé :**
```bash
# Option 1: Arrêter le processus existant
pkill -f hello-world-backend

# Option 2: Utiliser un autre port
PORT=3002 cargo run
```

### Étape 5 : Lancer le frontend

**Dans un nouveau terminal :**

```bash
cd frontend
npm install  # Première fois uniquement (peut prendre 1-2 minutes)
npm run dev
```

**Résultat attendu :**
```
▲ Next.js 16.1.4
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Starting...
```

**Si le port 3000 est utilisé :**
- Next.js utilisera automatiquement le port suivant (3001, 3002, etc.)

### Étape 6 : Vérifier que tout fonctionne

**Services actifs :**

| Service | URL | Vérification |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Ouvrir dans le navigateur |
| Backend | http://localhost:3001 | `curl http://localhost:3001/health` |
| PostgreSQL | localhost:5433 | `docker-compose ps postgres` |
| MongoDB | localhost:27017 | `docker-compose ps mongodb` |

**Test complet :**
1. Ouvrir http://localhost:3000 dans le navigateur
2. Créer un compte (Register)
3. Se connecter (Login)
4. Vérifier que l'interface se charge correctement

### Arrêter les services

**Arrêter Docker :**
```bash
docker-compose down
```

**Arrêter backend/frontend :**
- `Ctrl+C` dans les terminaux respectifs

### Dépannage

**PostgreSQL ne démarre pas :**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**MongoDB ne démarre pas :**
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

**Backend ne se connecte pas à PostgreSQL :**
```bash
# Vérifier que PostgreSQL est lancé
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Vérifier la connexion
psql -h localhost -p 5433 -U postgres -d helloworld -c "SELECT 1;"
```

**Backend ne compile pas :**
```bash
# Nettoyer et recompiler
cd backend
cargo clean
cargo build
```

**Frontend ne démarre pas :**
```bash
# Supprimer node_modules et réinstaller
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Port déjà utilisé :**
- Backend : créer `backend/.env` avec `PORT=3002`
- Frontend : Next.js utilise automatiquement le port suivant disponible

**Erreur "Database does not exist" :**
```bash
# Créer la base de données PostgreSQL
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE helloworld;"
# Puis relancer les migrations (Étape 3)
```

**Erreur "Connection refused" :**
- Vérifier que Docker est lancé : `docker ps`
- Vérifier que les containers sont actifs : `docker-compose ps`
- Relancer : `docker-compose up -d`

### Variables d'environnement (optionnel)

**Backend (`backend/.env`) :**
```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/helloworld
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your_super_secret_key_change_in_production
PORT=3001
```

**Frontend (`frontend/.env.local`) :**
```bash
API_URL=http://localhost:3001
```

> **Note:** Par défaut, le frontend utilise `http://localhost:3001`. Créez `.env.local` uniquement si vous changez le port du backend.

---

## Déploiement

### CI/CD

Le projet inclut un workflow GitHub Actions (`.github/workflows/ci.yml`) qui :
- Compile et teste le backend Rust
- Build et lint le frontend Next.js
- S'exécute automatiquement sur chaque push/PR

### Déploiement Backend

#### Option 1 : Railway

1. **Créer un compte Railway** : https://railway.app
2. **Créer un nouveau projet** depuis votre dépôt GitHub
3. **Ajouter les services** :
   - **PostgreSQL** : Railway propose PostgreSQL en un clic
   - **MongoDB** : Utiliser MongoDB Atlas (gratuit) ou Railway MongoDB
4. **Déployer le backend** :
   - Sélectionner le dossier `backend/`
   - Railway détectera automatiquement le Dockerfile
   - Configurer les variables d'environnement :
     ```
     DATABASE_URL=<url_postgresql_railway>
     MONGODB_URL=<url_mongodb>
     JWT_SECRET=<votre_secret_jwt>
     PORT=3001
     ```
5. **Appliquer les migrations** :
   ```bash
   # Via Railway CLI ou SSH
   psql $DATABASE_URL -f backend/migrations/init.sql
   ```

#### Option 2 : Render

1. **Créer un compte Render** : https://render.com
2. **Créer un Web Service** :
   - Connecter votre dépôt GitHub
   - Root Directory : `backend`
   - Build Command : `cargo build --release`
   - Start Command : `./target/release/hello-world-backend`
3. **Configurer les variables d'environnement** (même que Railway)
4. **Ajouter PostgreSQL et MongoDB** via Render Dashboard

#### Option 3 : Fly.io

1. **Installer Fly CLI** : `curl -L https://fly.io/install.sh | sh`
2. **Créer un compte** : `fly auth signup`
3. **Initialiser** : `fly launch` dans le dossier `backend/`
4. **Configurer les secrets** :
   ```bash
   fly secrets set DATABASE_URL=<url>
   fly secrets set MONGODB_URL=<url>
   fly secrets set JWT_SECRET=<secret>
   ```

### Déploiement Frontend

#### Option 1 : Vercel (Recommandé pour Next.js)

1. **Créer un compte Vercel** : https://vercel.com
2. **Importer le projet** depuis GitHub
3. **Configurer** :
   - Root Directory : `frontend`
   - Framework Preset : Next.js
   - Build Command : `npm run build`
4. **Variables d'environnement** :
   ```
   API_URL=https://votre-backend.railway.app
   ```
5. **Déployer** : Vercel déploie automatiquement à chaque push

#### Option 2 : Netlify

1. **Créer un compte Netlify** : https://netlify.com
2. **Importer depuis GitHub**
3. **Configurer** :
   - Base directory : `frontend`
   - Build command : `npm run build`
   - Publish directory : `frontend/.next`
4. **Variables d'environnement** : `API_URL`

### Bases de données Cloud

#### PostgreSQL
- **Railway** : PostgreSQL intégré
- **Supabase** : https://supabase.com (gratuit jusqu'à 500MB)
- **Neon** : https://neon.tech (gratuit jusqu'à 3GB)
- **Render** : PostgreSQL intégré

#### MongoDB
- **MongoDB Atlas** : https://www.mongodb.com/cloud/atlas (gratuit jusqu'à 512MB)
- **Railway** : MongoDB disponible
- **Render** : MongoDB disponible

### Variables d'environnement requises

**Backend :**
```bash
DATABASE_URL=postgres://user:pass@host:port/db
MONGODB_URL=mongodb://user:pass@host:port/db
JWT_SECRET=votre_secret_jwt_long_et_securise
PORT=3001
```

**Frontend :**
```bash
API_URL=https://votre-backend.railway.app
```

### Checklist de déploiement

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] Migrations PostgreSQL appliquées
- [ ] Indexes MongoDB créés
- [ ] CORS configuré pour autoriser le domaine frontend
- [ ] HTTPS activé (automatique sur Vercel/Railway)
- [ ] Tests de connexion frontend → backend

---
# Modèle UML — Analyse du projet RTC

Ce document décrit le **modèle de données et les relations** du projet *HelloWorld – Real Time Chat*, tel que défini dans le **diagramme UML (`classes.puml`)**.  
Le modèle respecte strictement la consigne RTC (serveurs, canaux, messages, rôles) et exclut volontairement toute fonctionnalité hors-scope (messages privés, système de contacts).

---

## 1. Vue d’ensemble

L’application repose sur les concepts suivants :
- Des **utilisateurs** pouvant rejoindre plusieurs **serveurs**
- Chaque serveur contient des **canaux textuels**
- Les messages sont envoyés **uniquement dans des canaux**
- Un système de **rôles (RBAC)** contrôle les permissions
- Les données sont persistées via **PostgreSQL** et **MongoDB**

---

## 2. Énumérations

### UserStatus
Statut de présence d’un utilisateur :
- `ONLINE`
- `OFFLINE`
- `DND` (Do Not Disturb)
- `INVISIBLE`

---

### MemberRole
Rôle d’un utilisateur dans un serveur :
- `OWNER` : propriétaire du serveur
- `ADMIN` : administrateur
- `MEMBER` : membre standard

---

## 3. Entités du modèle

### User
Représente un compte utilisateur.

**Attributs :**
- id
- email
- password_hash
- username
- avatar_url (optionnel)
- status
- created_at

**Relations :**
- Un utilisateur peut être propriétaire de plusieurs serveurs.
- Un utilisateur peut être membre de plusieurs serveurs.
- Un utilisateur peut envoyer plusieurs messages.

---

### Server
Représente un serveur (communauté).

**Attributs :**
- id
- name
- owner_id
- created_at
- updated_at

**Contraintes métier :**
- Un seul Owner par serveur.
- L’Owner ne peut pas quitter son serveur.

**Relations :**
- Un serveur contient plusieurs canaux.
- Un serveur contient plusieurs membres.
- Un serveur peut générer plusieurs invitations.

---

### ServerMember
Table de liaison entre `User` et `Server`.

**Attributs :**
- server_id
- user_id
- role
- joined_at

**Rôle :**
- Gère l’appartenance et les permissions (RBAC).
- Empêche qu’un utilisateur rejoigne plusieurs fois le même serveur.

---

### Channel
Représente un canal textuel d’un serveur.

**Attributs :**
- id
- server_id
- name
- position
- created_at
- updated_at

**Relations :**
- Un canal appartient à un seul serveur.
- Un canal contient plusieurs messages.

---

### Invite
Représente une invitation à rejoindre un serveur.

**Attributs :**
- id
- server_id
- code
- created_by
- expires_at (optionnel)
- max_uses (optionnel)
- uses_count
- created_at

**Rôle :**
- Permet de contrôler l’accès aux serveurs (expiration, usages limités).

---

### ChannelMessage
Représente un message envoyé dans un canal.

**Attributs :**
- message_id
- server_id
- channel_id
- author_id
- content
- created_at
- edited_at (optionnel)

**Soft delete :**
- deleted_at
- deleted_by

**Rôle :**
- Les messages sont persistés avec un historique complet.
- La suppression est logique afin de conserver la traçabilité.

---

## 4. Relations principales (résumé)

- **User ↔ Server** : relation many-to-many via `ServerMember`
- **User → Server** : relation one-to-many (ownership)
- **Server → Channel** : relation one-to-many
- **Channel → ChannelMessage** : relation one-to-many
- **Server → Invite** : relation one-to-many
- **User → ChannelMessage** : relation one-to-many