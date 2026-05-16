-- ─────────────────────────────────────────────────────────────────────────────
-- Cricket Auction — full schema (for a FRESH Supabase project)
-- If tables already exist, run supabase/auth_migration.sql instead.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Core auction tables ──────────────────────────────────────────────────────

CREATE TABLE auctions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    date       DATE NOT NULL,
    status     TEXT NOT NULL CHECK (status IN ('active', 'completed')) DEFAULT 'active',
    admin_id   UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE captains (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id       UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
    name             TEXT NOT NULL,
    "group"          TEXT NOT NULL DEFAULT 'A',
    purse_total      INT  NOT NULL,
    purse_remaining  INT  NOT NULL,
    color            TEXT NOT NULL DEFAULT '#3b82f6',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE players (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id   UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
    name         TEXT NOT NULL,
    "group"      TEXT NOT NULL,
    base_value   INT  NOT NULL DEFAULT 0,
    status       TEXT NOT NULL CHECK (status IN ('available', 'sold', 'unsold')) DEFAULT 'available',
    sold_to      UUID REFERENCES captains(id) ON DELETE SET NULL,
    sold_points  INT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bids (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id   UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
    player_id    UUID REFERENCES players(id)  ON DELETE CASCADE NOT NULL,
    captain_id   UUID REFERENCES captains(id) ON DELETE CASCADE NOT NULL,
    sold_points  INT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auth tables ───────────────────────────────────────────────────────────────

-- Links Supabase auth users to their in-app role and optional captain slot
CREATE TABLE profiles (
    id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role       TEXT NOT NULL CHECK (role IN ('admin', 'captain')) DEFAULT 'admin',
    captain_id UUID REFERENCES captains(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending invitations: admin sends one per captain slot before the captain logs in
CREATE TABLE captain_invites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id)  ON DELETE CASCADE NOT NULL,
    captain_id UUID REFERENCES captains(id)  ON DELETE CASCADE NOT NULL,
    email      TEXT NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Public pages (Live, Players, Captains) read without auth.
-- Writes are always auth-scoped.

-- auctions
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auctions_public_read"   ON auctions FOR SELECT USING (true);
CREATE POLICY "auctions_admin_write"   ON auctions FOR ALL
    USING (admin_id = auth.uid());

-- captains
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "captains_public_read"   ON captains FOR SELECT USING (true);
CREATE POLICY "captains_admin_write"   ON captains FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_public_read"    ON players FOR SELECT USING (true);
CREATE POLICY "players_admin_write"    ON players FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bids_public_read"       ON bids FOR SELECT USING (true);
CREATE POLICY "bids_admin_write"       ON bids FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));

-- profiles — only the owner can read/write their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own"           ON profiles FOR ALL USING (id = auth.uid());

-- captain_invites — admin manages theirs; captain can read the invite for their email
ALTER TABLE captain_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invites_admin_write"    ON captain_invites FOR ALL
    USING (auction_id IN (SELECT id FROM auctions WHERE admin_id = auth.uid()));
CREATE POLICY "invites_captain_read"   ON captain_invites FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
