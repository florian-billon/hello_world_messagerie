# 📋 Spécifications - RTC (Real Time Chat)

## 1. Exigences globales

### Application à développer
- **Backend** : Rust
- **Frontend** : Next.js (TypeScript)

### Exigences techniques
- Support de connexions simultanées multiples
- Système de serveurs (communautés) et canaux
- Authentification obligatoire
- Communication :
  - **REST API** : Gestion des ressources (CRUD)
  - **WebSockets** : Temps réel (messages, présence, typing)
- Permissions RBAC avec réponses d'erreur appropriées
- Persistance des données avec justification du choix de BDD

### Exigences UI/UX
- Respect des bonnes pratiques UI/UX
- Pas de dark patterns
- Confirmations explicites pour actions destructives

### Documentation requise
Spécification formelle du protocole WebSocket :
- Format des messages
- Types d'événements
- Gestion des erreurs
- Processus d'authentification
- Modèle de souscription

---

## 2. Fonctionnalités

### 2.1 Fonctionnalités utilisateur
- Inscription et connexion
- Création de serveur
- Rejoindre plusieurs serveurs via code d'invitation
- Quitter un serveur

### 2.2 Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| **Member** | Envoyer/supprimer ses messages, voir membres, voir connectés, voir typing, historique |
| **Admin** | + Créer/modifier/supprimer canaux, supprimer messages membres, créer invitations |
| **Owner** | + Gérer rôles, transférer propriété, NE PEUT PAS quitter |

**Règles** :
- Le créateur devient Owner automatiquement
- Un seul Owner par serveur

---

## 3. Endpoints REST API

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/signup` | Créer un compte |
| `POST` | `/auth/login` | Se connecter |
| `POST` | `/auth/logout` | Se déconnecter |
| `GET` | `/me` | Infos utilisateur courant |

### Serveurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/servers` | Créer un serveur |
| `GET` | `/servers` | Lister ses serveurs |
| `GET` | `/servers/{id}` | Détails d'un serveur |
| `PUT` | `/servers/{id}` | Modifier un serveur |
| `DELETE` | `/servers/{id}` | Supprimer un serveur |
| `POST` | `/servers/{id}/join` | Rejoindre un serveur |
| `DELETE` | `/servers/{id}/leave` | Quitter un serveur |
| `GET` | `/servers/{id}/members` | Lister les membres |
| `PUT` | `/servers/{id}/members/{userId}` | Modifier le rôle |

### Canaux
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/servers/{serverId}/channels` | Créer un canal |
| `GET` | `/servers/{serverId}/channels` | Lister les canaux |
| `GET` | `/channels/{id}` | Détails d'un canal |
| `PUT` | `/channels/{id}` | Modifier un canal |
| `DELETE` | `/channels/{id}` | Supprimer un canal |

### Messages
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/channels/{id}/messages` | Envoyer un message |
| `GET` | `/channels/{id}/messages` | Historique des messages |
| `DELETE` | `/messages/{id}` | Supprimer un message |

### Temps réel
| Protocole | Endpoint | Description |
|-----------|----------|-------------|
| `WS` | `/ws` | WebSocket pour mises à jour temps réel |

---

## 4. Fonctionnalités bonus (optionnel)
- Kick / Ban temporaire / Ban permanent
- Édition des messages
- Profil enrichi (bio, avatar, paramètres)
- Emojis et réactions
- Statuts supplémentaires (away, invisible)
- Mentions (@user, @role)
- 2FA, CAPTCHA

---

## 5. Exigences d'architecture

### Questions à résoudre
1. **Logique métier** : Dans les handlers ? Services ? Modules domaine ?
2. **Accès BDD** : Requêtes directes ? Couche repository ?
3. **Tests** : Possible sans serveur ? Sans vraie BDD ?
4. **Évolutivité** : Changement de BDD ? Ajout GraphQL ? Scaling équipe ?

### Signaux d'alerte (mauvaise archi)
- "Je ne peux pas tester sans la BDD"
- "Modifier X casse Y"
- "Je ne sais pas où mettre cette feature"
- "Mon handler fait 200+ lignes"
- "Tout est dans un seul fichier"

### Signaux positifs (bonne archi)
- Tests métier sans HTTP ni BDD
- Chaque fichier a une responsabilité claire
- Composants techniques interchangeables
- Nouveaux développeurs savent où ajouter du code
- Nouvelles features sans réécriture

