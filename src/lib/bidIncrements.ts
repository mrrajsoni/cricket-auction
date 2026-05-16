export const OPENING_BID = 50;

export function getNextBidAmount(current: number): number {
    if (current < 200) return current + 10;
    if (current < 500) return current + 20;
    return current + 50;
}

export function getIncrement(current: number): number {
    if (current < 200) return 10;
    if (current < 500) return 20;
    return 50;
}
