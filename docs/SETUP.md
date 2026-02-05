# Environment Setup Guide

This guide explains how to configure the environment variables for the Hello World application.

## Prerequisites

- [NeonDB](https://neon.tech) account (PostgreSQL)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account
- Node.js 20+
- Rust 1.75+

## 1. NeonDB (PostgreSQL) Setup

### Create a Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"New Project"**
3. Configure:
   - **Name**: `helloworld`
   - **Region**: `AWS US East 1 (N. Virginia)` (recommended)
   - **Postgres version**: `17`
4. Click **"Create Project"**

### Get Connection String

1. In your project dashboard, click **"Connect"**
2. **IMPORTANT**: Disable the **"Connection pooling"** toggle
   - SQLx (Rust) requires direct connections, not pooled connections
3. Copy the connection string:

```
postgresql://neondb_owner:npg_xxx@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Initialize Schema

Run the migration script:

```bash
psql 'YOUR_CONNECTION_STRING' -f backend/migrations/init.sql
```

## 2. MongoDB Atlas Setup

### Create a Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Build a Database"**
3. Choose **"M0 FREE"** (Shared)
4. Configure:
   - **Provider**: AWS
   - **Region**: `us-east-1` (same as NeonDB)
   - **Cluster name**: `Cluster0`
5. Click **"Create Deployment"**

### Create Database User

1. **Username**: `helloworld`
2. **Password**: Generate a secure password
3. **Save the password!**

### Configure Network Access

1. Go to **Network Access** in the left menu
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (`0.0.0.0/0`)
4. Click **"Confirm"**

### Get Connection String

1. Go to **Database** → Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Copy the connection string:

```
mongodb+srv://helloworld:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

4. Replace `<password>` with your actual password

## 3. Backend Configuration

Create the file `backend/.env`:

```bash
cat > backend/.env << 'EOF'
# =============================================================================
# PostgreSQL (NeonDB) - DIRECT CONNECTION (not pooled!)
# =============================================================================
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# =============================================================================
# MongoDB Atlas
# =============================================================================
MONGODB_URL=mongodb+srv://helloworld:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# =============================================================================
# Authentication
# =============================================================================
# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# =============================================================================
# Server
# =============================================================================
PORT=3001
RUST_LOG=info
EOF
```

### Important Notes

| Setting | Value | Why |
|---------|-------|-----|
| Connection pooling | **OFF** | SQLx requires direct connections |
| SSL mode | `require` | NeonDB requires TLS |
| Region | Same for both DBs | Reduces latency |

## 4. Frontend Configuration

Create the file `frontend/.env.local`:

```bash
echo "API_URL=http://localhost:3001" > frontend/.env.local
```

For production, set this to your deployed backend URL.

## 5. Verify Configuration

### Test PostgreSQL Connection

```bash
psql 'YOUR_DATABASE_URL' -c "SELECT 1;"
```

### Test Backend

```bash
cd backend
cargo run
# Should output: Server running on http://localhost:3001
```

### Test Frontend

```bash
cd frontend
npm run dev
# Should output: Ready in Xms
```

### Test API

```bash
# Create account
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","username":"TestUser"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## 6. Production Deployment

### Environment Variables by Platform

| Platform | Where to set |
|----------|--------------|
| **Render** | Dashboard → Service → Environment |
| **Railway** | Project → Variables |
| **Fly.io** | `fly secrets set KEY=value` |
| **Vercel** | Settings → Environment Variables |
| **GitHub Actions** | Repository → Settings → Secrets |

### Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use different JWT secrets for dev/prod
- [ ] Restrict MongoDB IP access in production
- [ ] Use strong passwords (min 16 chars)
- [ ] Enable SSL/TLS for all connections

## Troubleshooting

### "Database error" on login/signup

**Cause**: Using pooled connection with SQLx

**Solution**: Disable "Connection pooling" in NeonDB and use the direct connection URL

### "password authentication failed"

**Cause**: Wrong password or using pooler URL with direct endpoint

**Solution**: 
1. Verify password in NeonDB console
2. Ensure URL doesn't contain `-pooler`

### "type user_status does not exist"

**Cause**: Schema not initialized

**Solution**: Run the migration script:
```bash
psql 'YOUR_DATABASE_URL' -f backend/migrations/init.sql
```

### "Connection refused" on port 3001

**Cause**: Backend not running or port already in use

**Solution**:
```bash
# Kill existing process
pkill -f hello-world-backend

# Restart
cd backend && cargo run
```

