// ── Row types matching the DB schema ─────────────────────────────────────────

export interface DbAuction {
    id: string;
    name: string;
    date: string;
    status: "active" | "completed";
}

export interface DbCaptain {
    id: string;
    auction_id: string;
    name: string;
    group: "A" | "B" | "C" | "D";
    purse_total: number;
    purse_remaining: number;
    color: string;
}

export interface DbPlayer {
    id: string;
    auction_id: string;
    name: string;
    group: "A" | "B" | "C" | "D";
    base_value: number;
    status: "available" | "sold" | "unsold";
    sold_to: string | null;
    sold_points: number | null;
}

export interface DbBid {
    id: string;
    auction_id: string;
    player_id: string;
    captain_id: string;
    sold_points: number;
    created_at: string;
}

export interface DbProfile {
    id: string;
    role: 'admin' | 'captain';
    captain_id: string | null;
    created_at: string;
}

export interface DbCaptainInvite {
    id: string;
    auction_id: string;
    captain_id: string;
    email: string;
    used: boolean;
    created_at: string;
}
