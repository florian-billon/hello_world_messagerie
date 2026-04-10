db.channel_messages.createIndex(
  { "channel_id": 1, "created_at": -1 },
  { name: "idx_channel_messages_channel_created" }
);

// Optimisation queries "non supprimés" + pagination
db.channel_messages.createIndex(
  { "channel_id": 1, "deleted_at": 1, "created_at": -1 },
  { name: "idx_channel_messages_channel_deleted_created" }
);

db.channel_messages.createIndex(
  { "message_id": 1 },
  { name: "idx_channel_messages_message_id", unique: true }
);

db.channel_messages.createIndex(
  { "server_id": 1 },
  { name: "idx_channel_messages_server" }
);

db.channel_messages.createIndex(
  { "author_id": 1 },
  { name: "idx_channel_messages_author" }
);

// Ensure collections exist before creating DM indexes
if (!db.getCollectionInfos({ name: "direct_messages" }).length) {
  db.createCollection("direct_messages");
}

if (!db.getCollectionInfos({ name: "direct_message_items" }).length) {
  db.createCollection("direct_message_items");
}

// Unique key computed by app: `${min(user1_id,user2_id)}:${max(user1_id,user2_id)}`
db.direct_messages.createIndex(
  { user_pair_key: 1 },
  { name: "uniq_direct_messages_user_pair_key", unique: true }
);

db.direct_messages.createIndex(
  { user1_id: 1 },
  { name: "idx_direct_messages_user1" }
);

db.direct_messages.createIndex(
  { user2_id: 1 },
  { name: "idx_direct_messages_user2" }
);

db.direct_messages.createIndex(
  { created_at: -1 },
  { name: "idx_direct_messages_created_at" }
);

db.direct_message_items.createIndex(
  { dm_id: 1, created_at: -1 },
  { name: "idx_direct_message_items_dm_created" }
);

db.direct_message_items.createIndex(
  { author_id: 1, created_at: -1 },
  { name: "idx_direct_message_items_author_created" }
);

