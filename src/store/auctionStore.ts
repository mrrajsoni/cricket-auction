import { create } from "zustand";
import type { DbBid, DbCaptain, DbPlayer } from "@/lib/supabase";
import type { Bid, Captain, Player } from "@/types";
import { supabase } from "@/supabase/utils/supabase";

// ── Mappers: DB row → app type ────────────────────────────────────────────────

function mapCaptain(row: DbCaptain): Captain {
    return {
        id: row.id,
        name: row.name,
        group: row.group,
        purseTotal: row.purse_total,
        purseRemaining: row.purse_remaining,
        color: row.color,
    };
}

function mapPlayer(row: DbPlayer): Player {
    return {
        id: row.id,
        name: row.name,
        group: row.group,
        baseValue: row.base_value,
        status: row.status,
        soldTo: row.sold_to ?? undefined,
        soldPoints: row.sold_points ?? undefined,
    };
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface AuctionState {
    auctionId: string | null;
    captains: Captain[];
    players: Player[];
    bids: Bid[];
    loading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    placeBid: (
        playerName: string,
        captainId: string,
        soldPoints: number,
    ) => Promise<void>;
    undoLastBid: () => Promise<void>;
    clearError: () => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
    auctionId: null,
    captains: [],
    players: [],
    bids: [],
    loading: false,
    error: null,

    initialize: async () => {
        set({ loading: true, error: null });

        // 1. Load active auction
        const { data: auction, error: aErr } = await supabase
            .from("auctions")
            .select("id")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
        debugger;

        if (aErr || !auction) {
            set({
                loading: false,
                error: "No active auction found.",
            });
            return;
        }

        const auctionId = auction.id;

        // 2. Load captains, players, bids in parallel
        const [captainRes, playerRes, bidRes] = await Promise.all([
            supabase
                .from("captains")
                .select("*")
                .eq("auction_id", auctionId)
                .order("created_at"),
            supabase
                .from("players")
                .select("*")
                .eq("auction_id", auctionId)
                .order("created_at"),
            supabase
                .from("bids")
                .select("*, players(name, group), captains(name)")
                .eq("auction_id", auctionId)
                .order("created_at", { ascending: false }),
        ]);

        if (captainRes.error) {
            set({ loading: false, error: captainRes.error.message });
            return;
        }
        if (playerRes.error) {
            set({ loading: false, error: playerRes.error.message });
            return;
        }
        if (bidRes.error) {
            set({ loading: false, error: bidRes.error.message });
            return;
        }

        const captains = (captainRes.data as DbCaptain[]).map(mapCaptain);
        const players = (playerRes.data as DbPlayer[]).map(mapPlayer);
        const bids: Bid[] = (
            bidRes.data as (DbBid & {
                players: { name: string; group: string };
                captains: { name: string };
            })[]
        ).map((row) => ({
            id: row.id,
            playerId: row.player_id,
            playerName: row.players?.name ?? "",
            captainId: row.captain_id,
            captainName: row.captains?.name ?? "",
            soldPoints: row.sold_points,
            group: row.players?.group as Bid["group"],
            timestamp: new Date(row.created_at),
        }));

        set({ auctionId, captains, players, bids, loading: false });

        // 3. Subscribe to realtime changes
        subscribeToRealtime(auctionId);
    },

    placeBid: async (playerName, captainId, soldPoints) => {
        const { auctionId, captains, players } = get();
        if (!auctionId) {
            set({ error: "Auction not initialised." });
            return;
        }

        const captain = captains.find((c) => c.id === captainId);
        const player = players.find(
            (p) =>
                p.name.toLowerCase() === playerName.toLowerCase() &&
                p.status === "available",
        );

        if (!captain) {
            set({ error: "Captain not found." });
            return;
        }
        if (!player) {
            const dup = players.find(
                (p) => p.name.toLowerCase() === playerName.toLowerCase(),
            );
            set({
                error: dup
                    ? `${playerName} is already sold.`
                    : `Player "${playerName}" not found.`,
            });
            return;
        }
        if (soldPoints > captain.purseRemaining) {
            set({
                error: `${captain.name} only has ${captain.purseRemaining} pts remaining.`,
            });
            return;
        }
        if (soldPoints <= 0) {
            set({ error: "Sold points must be greater than 0." });
            return;
        }

        // Optimistic update
        const tempBid: Bid = {
            id: `temp-${Date.now()}`,
            playerId: player.id,
            playerName: player.name,
            captainId: captain.id,
            captainName: captain.name,
            soldPoints,
            group: player.group,
            timestamp: new Date(),
        };

        set((s) => ({
            bids: [tempBid, ...s.bids],
            error: null,
            players: s.players.map((p) =>
                p.id === player.id
                    ? { ...p, status: "sold", soldTo: captain.id, soldPoints }
                    : p,
            ),
            captains: s.captains.map((c) =>
                c.id === captain.id
                    ? { ...c, purseRemaining: c.purseRemaining - soldPoints }
                    : c,
            ),
        }));

        // Persist to Supabase (3 writes in parallel)
        const [bidRes] = await Promise.all([
            supabase
                .from("bids")
                .insert({
                    auction_id: auctionId,
                    player_id: player.id,
                    captain_id: captain.id,
                    sold_points: soldPoints,
                })
                .select("id")
                .single(),

            supabase
                .from("players")
                .update({
                    status: "sold",
                    sold_to: captain.id,
                    sold_points: soldPoints,
                })
                .eq("id", player.id),

            supabase
                .from("captains")
                .update({
                    purse_remaining: captain.purseRemaining - soldPoints,
                })
                .eq("id", captain.id),
        ]);

        if (bidRes.error) {
            // Roll back optimistic update on failure
            set((s) => ({
                bids: s.bids.filter((b) => b.id !== tempBid.id),
                players: s.players.map((p) =>
                    p.id === player.id
                        ? {
                              ...p,
                              status: "available",
                              soldTo: undefined,
                              soldPoints: undefined,
                          }
                        : p,
                ),
                captains: s.captains.map((c) =>
                    c.id === captain.id
                        ? {
                              ...c,
                              purseRemaining: c.purseRemaining + soldPoints,
                          }
                        : c,
                ),
                error: "Failed to save bid: " + bidRes.error.message,
            }));
            return;
        }

        // Replace temp bid id with real DB id
        if (bidRes.data?.id) {
            set((s) => ({
                bids: s.bids.map((b) =>
                    b.id === tempBid.id ? { ...b, id: bidRes.data!.id } : b,
                ),
            }));
        }
    },

    undoLastBid: async () => {
        const { bids, captains, players } = get();
        if (bids.length === 0) return;

        const [last, ...rest] = bids;

        // Optimistic rollback
        set({
            bids: rest,
            players: players.map((p) =>
                p.id === last.playerId
                    ? {
                          ...p,
                          status: "available",
                          soldTo: undefined,
                          soldPoints: undefined,
                      }
                    : p,
            ),
            captains: captains.map((c) =>
                c.id === last.captainId
                    ? {
                          ...c,
                          purseRemaining: c.purseRemaining + last.soldPoints,
                      }
                    : c,
            ),
        });

        // Persist rollback
        await Promise.all([
            supabase.from("bids").delete().eq("id", last.id),
            supabase
                .from("players")
                .update({
                    status: "available",
                    sold_to: null,
                    sold_points: null,
                })
                .eq("id", last.playerId),
            supabase
                .from("captains")
                .update({
                    purse_remaining:
                        captains.find((c) => c.id === last.captainId)!
                            .purseRemaining + last.soldPoints,
                })
                .eq("id", last.captainId),
        ]);
    },

    clearError: () => set({ error: null }),
}));

// ── Realtime: merge updates from other connected devices ──────────────────────

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function subscribeToRealtime(auctionId: string) {
    // Clean up any existing subscription
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }

    realtimeChannel = supabase
        .channel(`auction:${auctionId}`)

        // New bid from another device
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "bids",
                filter: `auction_id=eq.${auctionId}`,
            },
            async (payload) => {
                const { bids } = useAuctionStore.getState();
                // Skip if we already have it (from optimistic update)
                if (bids.some((b) => b.id === payload.new.id)) return;

                // Fetch the full bid with player/captain names
                const { data } = await supabase
                    .from("bids")
                    .select("*, players(name, group), captains(name)")
                    .eq("id", payload.new.id)
                    .single();

                if (!data) return;

                const newBid: Bid = {
                    id: data.id,
                    playerId: data.player_id,
                    playerName: data.players?.name ?? "",
                    captainId: data.captain_id,
                    captainName: data.captains?.name ?? "",
                    soldPoints: data.sold_points,
                    group: data.players?.group as Bid["group"],
                    timestamp: new Date(data.created_at),
                };

                useAuctionStore.setState((s) => ({
                    bids: [newBid, ...s.bids],
                }));
            },
        )

        // Captain purse updated from another device
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "captains",
                filter: `auction_id=eq.${auctionId}`,
            },
            (payload) => {
                const row = payload.new as DbCaptain;
                useAuctionStore.setState((s) => ({
                    captains: s.captains.map((c) =>
                        c.id === row.id
                            ? { ...c, purseRemaining: row.purse_remaining }
                            : c,
                    ),
                }));
            },
        )

        // Player status updated from another device
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "players",
                filter: `auction_id=eq.${auctionId}`,
            },
            (payload) => {
                const row = payload.new as DbPlayer;
                useAuctionStore.setState((s) => ({
                    players: s.players.map((p) =>
                        p.id === row.id ? mapPlayer(row) : p,
                    ),
                }));
            },
        )

        .subscribe();
}
