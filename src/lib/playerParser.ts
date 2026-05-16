import type { NewAuctionPlayer } from '@/types';

/**
 * Parses a free-form player list text into structured players.
 *
 * Recognised patterns:
 *   Group header  → "Group 1:", "group 2 :", "GROUP 3:"  (case-insensitive, trailing colon)
 *   Player line   → "1. Name", "1.Name", "1) Name"  (leading number + dot or paren)
 *
 * Players inherit the most recently seen group header.
 * Lines that match neither pattern are silently skipped.
 */
export function parsePlayers(text: string): NewAuctionPlayer[] {
    const players: NewAuctionPlayer[] = [];
    let currentGroup = '1';

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!line) continue;

        // Group header: "Group 1:", "group  2 :", etc.
        const groupMatch = line.match(/^group\s+(\d+)\s*:/i);
        if (groupMatch) {
            currentGroup = groupMatch[1];
            continue;
        }

        // Player line: "1.Name", "1. Name", "1) Name", "1 . Name"
        const playerMatch = line.match(/^\d+\s*[.)]\s*(.+)$/);
        if (playerMatch) {
            const name = playerMatch[1].trim();
            if (name) players.push({ name, group: currentGroup });
        }
    }

    return players;
}

/** Returns the highest group number found in parsed players, or 0 if none. */
export function maxGroupNumber(players: NewAuctionPlayer[]): number {
    return players.reduce((max, p) => {
        const n = parseInt(p.group, 10);
        return isNaN(n) ? max : Math.max(max, n);
    }, 0);
}
