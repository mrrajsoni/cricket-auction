-- ─────────────────────────────────────────────────────────────────────────────
-- Auth migration — run this in Supabase SQL editor if tables already exist.
-- Adds auth ownership, RLS, profiles, and captain_invites to an existing DB.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add admin_id to auctions (skip if column already exists)
ALTER TABLE auctions
    ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users ON DELETE CASCADE;

-- 2. New auth tables
CREATE TABLE IF NOT EXISTS profiles (
    id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role       TEXT NOT NULL CHECK (role IN ('admin', 'captain')) DEFAULT 'admin',
    captain_id UUID REFERENCES captains(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS captain_invites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id)  ON DELETE CASCADE NOT NULL,
    captain_id UUID REFERENCES captains(id)  ON DELETE CASCADE NOT NULL,
    email      TEXT NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on all tables
ALTER TABLE auctions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE captains        ENABLE ROW LEVEL SECURITY;
ALTER TABLE players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_invites ENABLE ROW LEVEL SECURITY;

-- 4. Drop policies if they exist (re-runnable)
DO $$ BEGIN
    DROP POLICY IF EXISTS "auctions_public_read"   ON auctions;
    DROP POLICY IF EXISTS "auctions_admin_write"   ON auctions;
    DROP POLICY IF EXISTS "captains_public_read"   ON captains;
    DROP POLICY IF EXISTS "captains_admin_write"   ON captains;
    DROP POLICY IF EXISTS "players_public_read"    ON players;
    DROP POLICY IF EXISTS "players_admin_write"    ON players;
    DROP POLICY IF EXISTS "bids_public_read"       ON bids;
    DROP POLICY IF EXISTS "bids_admin_write"       ON bids;
    DROP POLICY IF EXISTS "profiles_own"           ON profiles;
    DROP POLICY IF EXISTS "invites_admin_write"    ON captain_invites;
    DROP POLICY IF EXISTS "invites_captain_read"   ON captain_invites;
END $$;

-- 5. Create RLS policies
-- auctions: anyone can read, only the owner admin can write
CREATE POLICY "auctions_public_read"  ON auctions FOR SELECT USING (true);
CREATE POLICY "auctions_admin_write"  ON auctions FOR ALL
    USING (admin_id = auth.uid());

-- captains: public read, admin writes via auction ownership
CREATE POLICY "captains_public_read"  ON captains FOR SELECT USING (true);
CREATE POLICY "captains_admin_write"  ON captains FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- players: public read, admin writes
CREATE POLICY "players_public_read"   ON players FOR SELECT USING (true);
CREATE POLICY "players_admin_write"   ON players FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- bids: public read, admin writes
CREATE POLICY "bids_public_read"      ON bids FOR SELECT USING (true);
CREATE POLICY "bids_admin_write"      ON bids FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- profiles: each user manages only their own row
CREATE POLICY "profiles_own"          ON profiles FOR ALL USING (id = auth.uid());

-- captain_invites: admin manages theirs; captain can read invite by email
CREATE POLICY "invites_admin_write"   ON captain_invites FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));
CREATE POLICY "invites_captain_read"  ON captain_invites FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
