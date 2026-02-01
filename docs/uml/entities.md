# Description des entites - Hello World RTC

## Énumérations

### `UserStatus`
Statut de présence d'un utilisateur :

| Valeur | Description |
|--------|-------------|
| `ONLINE` | Connecté et disponible |
| `OFFLINE` | Déconnecté |
| `DND` | Ne pas déranger |
| `INVISIBLE` | Invisible pour les autres |

### `MemberRole`
Rôle d'un utilisateur dans un serveur :

| Valeur | Description | Permissions |
|--------|-------------|-------------|
| `OWNER` | Propriétaire du serveur | Toutes + transfert propriété |
| `ADMIN` | Administrateur | Gestion canaux, invitations, modération |
| `MEMBER` | Membre standard | Lecture/envoi messages |

### `ContactStatus`
État d'une relation de contact :

| Valeur | Description |
|--------|-------------|
| `PENDING` | Demande en attente |
| `ACCEPTED` | Contact accepté |
| `BLOCKED` | Contact bloqué |

---

## Entités PostgreSQL

### `User`
Représente un compte utilisateur.

| Attribut | Type | Description |
|----------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | String | Email de connexion (unique) |
| `password_hash` | String | Mot de passe chiffré (bcrypt) |
| `username` | String | Pseudonyme affiché |
| `avatar_url` | String? | URL de l'avatar (optionnel) |
| `status` | UserStatus | Statut de présence |
| `created_at` | DateTime | Date de création du compte |

---

### `Server`
Représente un serveur (communauté).

| Attribut | Type | Description |
|----------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom du serveur |
| `owner_id` | UUID | FK → User propriétaire |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Date de modification |

**Contrainte metier** : Un seul Owner par serveur.

---

### `ServerMember`
Table de liaison entre `User` et `Server`.

| Attribut | Type | Description |
|----------|------|-------------|
| `server_id` | UUID | FK → Server |
| `user_id` | UUID | FK → User |
| `role` | MemberRole | Rôle dans le serveur |
| `joined_at` | DateTime | Date d'adhésion |

**Clé primaire composée** : `(server_id, user_id)`

**Contrainte** : Un utilisateur ne peut pas etre deux fois dans le meme serveur.

---

### `Channel`
Canal textuel appartenant à un serveur.

| Attribut | Type | Description |
|----------|------|-------------|
| `id` | UUID | Identifiant unique |
| `server_id` | UUID | FK → Server parent |
| `name` | String | Nom du canal |
| `position` | Int | Ordre d'affichage |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Date de modification |

---

### `Invite`
Invitation pour rejoindre un serveur.

| Attribut | Type | Description |
|----------|------|-------------|
| `id` | UUID | Identifiant unique |
| `server_id` | UUID | FK → Server concerné |
| `code` | String | Code d'invitation unique |
| `created_by` | UUID | FK → User créateur |
| `expires_at` | DateTime? | Date d'expiration (optionnel) |
| `max_uses` | Int? | Nombre max d'utilisations (optionnel) |
| `uses_count` | Int | Compteur d'utilisations |
| `created_at` | DateTime | Date de création |

---

### `PrivateConversation`
Conversation privée entre deux utilisateurs (DM).

| Attribut | Type | Description |
|----------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user1_id` | UUID | FK → Premier utilisateur |
| `user2_id` | UUID | FK → Deuxième utilisateur |
| `created_at` | DateTime | Date de création |

---

### `Contact`
Relation de contact entre utilisateurs.

| Attribut | Type | Description |
|----------|------|-------------|
| `user_id` | UUID | FK → Utilisateur source |
| `contact_id` | UUID | FK → Utilisateur cible |
| `status` | ContactStatus | État de la relation |
| `created_at` | DateTime | Date de création |

---

## Entités MongoDB

### `ChannelMessage`
Message envoyé dans un canal.

| Attribut | Type | Description |
|----------|------|-------------|
| `_id` | ObjectId | ID MongoDB interne |
| `message_id` | UUID | ID unique (référence cross-DB) |
| `server_id` | UUID | Référence serveur |
| `channel_id` | UUID | Référence canal |
| `author_id` | UUID | Référence auteur |
| `content` | String | Contenu du message |
| `created_at` | DateTime | Date d'envoi |
| `edited_at` | DateTime? | Date d'édition (optionnel) |
| `deleted_at` | DateTime? | Date de suppression logique |
| `deleted_by` | UUID? | Utilisateur ayant supprimé |

**Soft delete** : Le message n'est jamais supprime physiquement.

**Index** : `(channel_id, created_at)` pour les requetes paginees.

---

### `DmMessage`
Message envoyé dans une conversation privée.

| Attribut | Type | Description |
|----------|------|-------------|
| `_id` | ObjectId | ID MongoDB interne |
| `message_id` | UUID | ID unique (référence cross-DB) |
| `dm_id` | UUID | Référence conversation |
| `author_id` | UUID | Référence auteur |
| `content` | String | Contenu du message |
| `created_at` | DateTime | Date d'envoi |
| `edited_at` | DateTime? | Date d'édition (optionnel) |
| `deleted_at` | DateTime? | Date de suppression logique |
| `deleted_by` | UUID? | Utilisateur ayant supprimé |

---

## Relations

```
User ──────┬───────────────────┬──────────────────┐
           │ owns              │ joins            │ writes
           ▼                   ▼                  ▼
        Server ◄───── ServerMember        ChannelMessage
           │                                      ▲
           │ contains                             │
           ▼                                      │
        Channel ──────────────────────────────────┘
           │
           │ has
           ▼
        Invite
```

### Résumé
- Un `User` peut être **propriétaire** de plusieurs `Server`
- Un `User` peut **appartenir** à plusieurs `Server` via `ServerMember`
- Un `Server` **contient** plusieurs `Channel`
- Un `Server` peut avoir plusieurs `Invite`
- Un `Channel` **contient** plusieurs `ChannelMessage`
- Un `User` peut **écrire** plusieurs `ChannelMessage`
- Un `User` peut avoir plusieurs `Contact`
- Deux `User` peuvent avoir une `PrivateConversation`

