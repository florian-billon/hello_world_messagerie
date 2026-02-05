# Guide de Déploiement - Projet dans Organisation GitHub

Ce guide explique comment déployer le projet quand il est dans une organisation GitHub et que vous n'avez pas les permissions pour connecter directement Railway/Vercel.

## Solutions Recommandées

### Solution 1 : Render (Backend + Frontend) - Le Plus Simple

Render supporte mieux les organisations GitHub et ne nécessite généralement pas de permissions spéciales.

#### Backend sur Render

1. **Créer un compte** : https://render.com
2. **Connecter GitHub** :
   - Dashboard → Account Settings → Connected Accounts
   - Connecter votre compte GitHub
3. **Créer PostgreSQL** :
   - New → PostgreSQL
   - Name : `helloworld-postgres`
   - Plan : Free
   - Noter l'URL de connexion
4. **Créer MongoDB Atlas** (gratuit) :
   - Aller sur https://www.mongodb.com/cloud/atlas
   - Créer un cluster gratuit (M0)
   - Créer un utilisateur et obtenir l'URL de connexion
5. **Créer Web Service pour Backend** :
   - New → Web Service
   - Connecter le dépôt GitHub
   - **Root Directory** : `backend`
   - **Environment** : `Rust`
   - **Build Command** : `cargo build --release`
   - **Start Command** : `./target/release/hello-world-backend`
   - **Variables d'environnement** :
     ```
     DATABASE_URL=<url_postgresql_render>
     MONGODB_URL=<url_mongodb_atlas>
     JWT_SECRET=<générer_un_secret_long_et_aléatoire>
     PORT=3001
     ```
6. **Appliquer les migrations** :
   - Une fois le service démarré, utiliser Render Shell :
   ```bash
   # Dans Render Dashboard → Shell
   psql $DATABASE_URL -f backend/migrations/init.sql
   ```

#### Frontend sur Render

1. **Créer un Web Service** :
   - New → Web Service
   - Connecter le même dépôt GitHub
   - **Root Directory** : `frontend`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Variables d'environnement** :
     ```
     API_URL=https://votre-backend.onrender.com
     NODE_ENV=production
     ```

### Solution 2 : Fly.io (CLI - Pas besoin de permissions GitHub)

Fly.io utilise le CLI, donc pas besoin de permissions GitHub spéciales.

#### Backend sur Fly.io

1. **Installer Fly CLI** :
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Créer un compte** :
   ```bash
   fly auth signup
   ```

3. **Cloner le repo** (si pas déjà fait) :
   ```bash
   git clone <url-du-repo>
   cd hello-world
   ```

4. **Initialiser Fly.io** :
   ```bash
   cd backend
   fly launch
   ```
   - Suivre les instructions interactives
   - Fly.io détectera automatiquement `fly.toml`

5. **Configurer les secrets** :
   ```bash
   fly secrets set DATABASE_URL="<url_postgresql>"
   fly secrets set MONGODB_URL="<url_mongodb>"
   fly secrets set JWT_SECRET="<secret>"
   ```

6. **Déployer** :
   ```bash
   fly deploy
   ```

#### Frontend sur Fly.io

1. **Créer un nouveau projet** :
   ```bash
   cd frontend
   fly launch --name hello-world-frontend
   ```

2. **Configurer `fly.toml`** (créer dans `frontend/`) :
   ```toml
   app = "hello-world-frontend"
   primary_region = "cdg"

   [build]
     builder = "paketobuildpacks/builder:base"

   [env]
     NODE_ENV = "production"
     API_URL = "https://votre-backend.fly.dev"

   [[services]]
     internal_port = 3000
     protocol = "tcp"
   ```

3. **Déployer** :
   ```bash
   fly deploy
   ```

### Solution 3 : Demander les Permissions à l'Administrateur

Si vous préférez utiliser Railway/Vercel, demandez à un administrateur de l'organisation GitHub :

1. **Pour Railway** :
   - L'admin doit aller dans GitHub → Settings → Applications → Authorized OAuth Apps
   - Autoriser Railway pour l'organisation

2. **Pour Vercel** :
   - L'admin doit aller dans GitHub → Settings → Applications → Authorized OAuth Apps
   - Autoriser Vercel pour l'organisation

## Bases de Données Cloud

### PostgreSQL (Gratuit)

- **Render** : PostgreSQL intégré (gratuit jusqu'à 90 jours, puis $7/mois)
- **Supabase** : https://supabase.com (gratuit jusqu'à 500MB)
- **Neon** : https://neon.tech (gratuit jusqu'à 3GB)
- **Railway** : PostgreSQL intégré (gratuit avec crédits)

### MongoDB (Gratuit)

- **MongoDB Atlas** : https://www.mongodb.com/cloud/atlas
  - Plan gratuit M0 : 512MB de stockage
  - Créer un cluster → Obtenir l'URL de connexion

## Checklist de Déploiement

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] PostgreSQL configuré et migrations appliquées
- [ ] MongoDB configuré et indexes créés
- [ ] Variables d'environnement configurées
- [ ] CORS configuré (backend autorise le domaine frontend)
- [ ] HTTPS activé (automatique sur Render/Fly.io)
- [ ] Test de connexion frontend → backend
- [ ] Test de création de compte
- [ ] Test de création de serveur
- [ ] Test d'envoi de message

## Variables d'Environnement Requises

### Backend
```bash
DATABASE_URL=postgres://user:pass@host:port/db
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=votre_secret_jwt_long_et_securise_minimum_32_caracteres
PORT=3001
```

### Frontend
```bash
API_URL=https://votre-backend.onrender.com
# ou
API_URL=https://votre-backend.fly.dev
```

## Dépannage

### Backend ne démarre pas
- Vérifier les variables d'environnement
- Vérifier les logs dans le dashboard
- Vérifier que PostgreSQL et MongoDB sont accessibles

### Frontend ne se connecte pas au backend
- Vérifier `API_URL` dans les variables d'environnement
- Vérifier CORS dans le backend (autoriser le domaine frontend)
- Vérifier que le backend est accessible publiquement

### Erreur CORS
- Ajouter le domaine frontend dans la configuration CORS du backend
- Vérifier que les headers sont corrects

