export type Group = 'A' | 'B' | 'C' | 'D';

export interface Captain {
    id: string;
    name: string;
    group: Group;
    purseTotal: number;
    purseRemaining: number;
    color: string;
}

export interface Player {
    id: string;
    name: string;
    group: Group;
    baseValue: number;
    status: 'available' | 'sold' | 'unsold';
    soldTo?: string;
    soldPoints?: number;
}

export interface Bid {
    id: string;
    playerId: string;
    playerName: string;
    captainId: string;
    captainName: string;
    soldPoints: number;
    group: Group;
    timestamp: Date;
}

export interface Auction {
    id: string;
    name: string;
    date: string;
    status: 'active' | 'completed';
}

export interface LiveBidEntry {
    captainId: string;
    captainName: string;
    amount: number;
    timestamp: Date;
}

export interface NewAuctionCaptain {
    name: string;
    purse: number;
}

export interface NewAuctionPlayer {
    name: string;
    group: string;
}

export interface NewAuctionData {
    name: string;
    defaultPurse: number;
    teamSize: number;
    numGroups: number;
    captains: NewAuctionCaptain[];
    players: NewAuctionPlayer[];
}

export interface LiveSession {
    activeGroup: Group | null;
    playerQueue: string[];       // ordered player IDs
    currentQueueIndex: number;
    liveBidAmount: number;       // 0 = no bid raised yet
    highestCaptainId: string | null;
    liveBidTimeline: LiveBidEntry[];
}
