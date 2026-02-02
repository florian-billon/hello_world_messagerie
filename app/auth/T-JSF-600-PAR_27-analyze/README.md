<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---
 -->
## Modèle de données (entités + relations)

### Entités PostgreSQL

#### User (`users`)
- Rôle : compte utilisateur (auth, profil)
- Champs : id, username, email, password_hash, created_at

#### Server (`servers`)
- Rôle : communauté / guild
- Champs : id, name, owner_id, created_at, updated_at

#### ServerMember (`server_members`)
- Rôle : appartenance user ↔ server + rôle (RBAC)
- Champs : server_id, user_id, role, joined_at
- PK composée : (server_id, user_id)

#### Channel (`channels`)
- Rôle : conversation textuelle dans un serveur
- Champs : id, server_id, name, position, created_at, updated_at

#### PrivateConversation (`private_conversations`)
- Rôle : DM (participants)
- Champs : id, user1_id, user2_id, created_at

#### Invite (`invites`)
- Rôle : invitation paramétrable
- Champs : id, server_id, code, created_by, expires_at?, max_uses?, uses_count, created_at

#### Contact (`contacts`)
- Rôle : relation d’amitié entre users
- Champs : user_id, contact_id, status, created_at

### Entités MongoDB (messages)

#### channel_messages
- message_id (UUID), server_id, channel_id, author_id, content, timestamps
- Soft delete : deleted_at, deleted_by

#### dm_messages
- message_id (UUID), dm_id, author_id, content, timestamps
- Soft delete : deleted_at, deleted_by

> Note : PostgreSQL ↔ MongoDB utilisent des références UUID (pas de FK cross-DB).
