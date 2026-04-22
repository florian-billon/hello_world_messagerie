UPDATE users
SET username = btrim(username)
WHERE username <> btrim(username);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM users
        WHERE char_length(btrim(username)) NOT BETWEEN 1 AND 32
    ) THEN
        RAISE EXCEPTION 'Invalid usernames exist after normalization';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (
            SELECT lower(btrim(username))
            FROM users
            GROUP BY 1
            HAVING COUNT(*) > 1
        ) duplicates
    ) THEN
        RAISE EXCEPTION 'Duplicate normalized usernames exist';
    END IF;
END;
$$;

ALTER TABLE users
ALTER COLUMN username TYPE VARCHAR(32);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_users_username_trimmed'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT chk_users_username_trimmed
        CHECK (username = btrim(username));
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_users_username_length'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT chk_users_username_length
        CHECK (char_length(username) BETWEEN 1 AND 32);
    END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_normalized
ON users (lower(btrim(username)));
