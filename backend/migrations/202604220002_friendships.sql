CREATE TABLE IF NOT EXISTS friendships (
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user1_id, user2_id),
    CHECK (user1_id <> user2_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_friendships_user_pair
ON friendships (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
