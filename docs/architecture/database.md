# 🗄️ Modèle de données - Hello World RTC

## 1. Approche polyglotte

| Base de données | Utilisation | Justification |
|-----------------|-------------|---------------|
| **PostgreSQL** | Identités, permissions, structure | Intégrité transactionnelle, contraintes FK |
| **MongoDB** | Historique des messages | Volume élevé, semi-structuré, scalabilité |

---

## 2. Entités PostgreSQL

### `users`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `username` | VARCHAR | Pseudonyme |
| `email` | VARCHAR | Email (unique) |
| `password_hash` | VARCHAR | Mot de passe hashé |
| `status` | ENUM | Online/Offline/DND/Invisible |
| `avatar_url` | VARCHAR? | URL avatar (optionnel) |
| `created_at` | TIMESTAMP | Date de création |

### `servers`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `name` | VARCHAR | Nom du serveur |
| `owner_id` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de modification |

### `server_members`
| Colonne | Type | Description |
|---------|------|-------------|
| `server_id` | UUID | FK → servers.id |
| `user_id` | UUID | FK → users.id |
| `role` | ENUM | OWNER/ADMIN/MEMBER |
| `joined_at` | TIMESTAMP | Date d'adhésion |

**PK composée** : `(server_id, user_id)`

### `channels`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `server_id` | UUID | FK → servers.id |
| `name` | VARCHAR | Nom du canal |
| `position` | INT | Ordre d'affichage |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de modification |

### `invites`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `server_id` | UUID | FK → servers.id |
| `code` | VARCHAR | Code unique |
| `created_by` | UUID | FK → users.id |
| `expires_at` | TIMESTAMP? | Expiration (optionnel) |
| `max_uses` | INT? | Utilisations max (optionnel) |
| `uses_count` | INT | Compteur |
| `created_at` | TIMESTAMP | Date de création |

### `private_conversations` (DM)
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user1_id` | UUID | FK → users.id |
| `user2_id` | UUID | FK → users.id |
| `created_at` | TIMESTAMP | Date de création |

### `contacts`
| Colonne | Type | Description |
|---------|------|-------------|
| `user_id` | UUID | FK → users.id |
| `contact_id` | UUID | FK → users.id |
| `status` | ENUM | PENDING/ACCEPTED/BLOCKED |
| `created_at` | TIMESTAMP | Date de création |

---

## 3. Collections MongoDB

### `channel_messages`
| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID MongoDB |
| `message_id` | UUID | ID unique (référence cross-DB) |
| `channel_id` | UUID | Référence canal |
| `server_id` | UUID | Référence serveur |
| `author_id` | UUID | Référence auteur |
| `content` | TEXT | Contenu du message |
| `created_at` | TIMESTAMP | Date d'envoi |
| `edited_at` | TIMESTAMP? | Date d'édition |
| `deleted_at` | TIMESTAMP? | Date de suppression (soft delete) |
| `deleted_by` | UUID? | Utilisateur ayant supprimé |

**Index** : `(channel_id, created_at)`

### `dm_messages`
| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID MongoDB |
| `message_id` | UUID | ID unique |
| `dm_id` | UUID | Référence conversation |
| `author_id` | UUID | Référence auteur |
| `content` | TEXT | Contenu du message |
| `created_at` | TIMESTAMP | Date d'envoi |
| `edited_at` | TIMESTAMP? | Date d'édition |
| `deleted_at` | TIMESTAMP? | Date de suppression |
| `deleted_by` | UUID? | Utilisateur ayant supprimé |

---

## 4. Relations

```
┌──────────┐     owns      ┌──────────┐
│   User   │──────────────▶│  Server  │
└──────────┘               └──────────┘
     │                          │
     │ joins                    │ contains
     ▼                          ▼
┌──────────────┐          ┌──────────┐
│ ServerMember │          │ Channel  │
└──────────────┘          └──────────┘
                               │
                               │ has
                               ▼
                    ┌────────────────────┐
                    │  ChannelMessage    │
                    │    (MongoDB)       │
                    └────────────────────┘
```

### Résumé des relations
- `User` ↔ `Server` via `ServerMember` (many-to-many)
- `User` → `Server` via `owner_id` (one-to-many)
- `Server` → `Channel` (one-to-many)
- `Server` → `Invite` (one-to-many)
- `Channel` → `channel_messages` (one-to-many, cross-DB)
- `DM` → `dm_messages` (one-to-many, cross-DB)

---

## 5. Énumérations

### `UserStatus`
| Valeur | Description |
|--------|-------------|
| `ONLINE` | Connecté |
| `OFFLINE` | Déconnecté |
| `DND` | Ne pas déranger |
| `INVISIBLE` | Invisible |

### `MemberRole`
| Valeur | Description |
|--------|-------------|
| `OWNER` | Propriétaire du serveur |
| `ADMIN` | Administrateur |
| `MEMBER` | Membre standard |

---

## 6. Notes importantes

### Cross-database
- Les références entre PostgreSQL et MongoDB utilisent des **UUID partagés**
- Pas de FK cross-DB, les relations sont résolues par la **couche métier**

### Soft delete
- Les messages ne sont jamais supprimés physiquement
- `deleted_at` et `deleted_by` permettent de tracer la suppression

