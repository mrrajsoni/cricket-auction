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
