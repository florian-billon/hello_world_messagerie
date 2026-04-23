CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user1_id <> user2_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_direct_messages_user_pair
ON direct_messages (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

CREATE INDEX IF NOT EXISTS idx_direct_messages_user1 ON direct_messages(user1_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_user2 ON direct_messages(user2_id);
