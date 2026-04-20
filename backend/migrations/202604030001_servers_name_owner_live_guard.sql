-- Live-safe guard against creating duplicate server names per owner.
-- Keeps existing historical duplicates untouched, but blocks new ones.

UPDATE servers
SET name = trim(name)
WHERE name <> trim(name);

CREATE INDEX IF NOT EXISTS idx_servers_owner_name_normalized
ON servers(owner_id, lower(trim(name)));

CREATE OR REPLACE FUNCTION prevent_duplicate_server_name_per_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM servers s
        WHERE s.owner_id = NEW.owner_id
          AND lower(trim(s.name)) = lower(trim(NEW.name))
          AND s.id <> NEW.id
    ) THEN
        RAISE EXCEPTION 'Duplicate server name for owner'
            USING ERRCODE = '23505',
                  CONSTRAINT = 'servers_owner_name_unique_live';
    END IF;

    NEW.name := trim(NEW.name);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_servers_prevent_duplicate_name_per_owner ON servers;

CREATE TRIGGER trg_servers_prevent_duplicate_name_per_owner
BEFORE INSERT OR UPDATE OF name, owner_id ON servers
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_server_name_per_owner();
