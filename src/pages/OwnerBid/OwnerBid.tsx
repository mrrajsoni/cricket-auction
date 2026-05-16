import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuctionStore } from '@/store/auctionStore';
import { OwnerLogin } from '@/components/OwnerLogin/OwnerLogin';
import { GroupBadge } from '@/components/GroupBadge/GroupBadge';
import { getNextBidAmount } from '@/lib/bidIncrements';
import './OwnerBid.css';

const STORAGE_KEY = 'ca-owner-id';

export function OwnerBid() {
    const { captains, players, liveSession, raiseLiveBid, subscribeLiveSession } = useAuctionStore();

    const [captainId, setCaptainId] = useState<string | null>(
        () => localStorage.getItem(STORAGE_KEY)
    );
    const [outbid, setOutbid] = useState(false);
    const prevHighestRef = useRef<string | null>(null);

    const captain = captains.find((c) => c.id === captainId);

    useEffect(() => {
        subscribeLiveSession();
    }, [subscribeLiveSession]);

    // Detect being outbid
    useEffect(() => {
        const newHighest = liveSession?.highestCaptainId ?? null;
        if (
            prevHighestRef.current === captainId &&
            newHighest !== captainId &&
            newHighest !== null
        ) {
            setOutbid(true);
            const t = setTimeout(() => setOutbid(false), 3000);
            return () => clearTimeout(t);
        }
        prevHighestRef.current = newHighest;
    }, [liveSession?.highestCaptainId, captainId]);

    const handleSelect = (id: string) => {
        localStorage.setItem(STORAGE_KEY, id);
        setCaptainId(id);
    };

    const handleChange = () => {
        localStorage.removeItem(STORAGE_KEY);
        setCaptainId(null);
    };

    if (!captainId || !captain) {
        return <OwnerLogin captains={captains} onSelect={handleSelect} />;
    }

    const currentPlayer = liveSession
        ? players.find((p) => p.id === liveSession.playerQueue[liveSession.currentQueueIndex])
        : undefined;

    const isLeading = liveSession?.highestCaptainId === captainId;
    const liveBid = liveSession?.liveBidAmount ?? 0;
    const nextBid = getNextBidAmount(liveBid);
    const canAfford = nextBid <= captain.purseRemaining;
    const hasPlayer = !!currentPlayer && !!liveSession;

    const leadingCaptain = liveSession?.highestCaptainId
        ? captains.find((c) => c.id === liveSession.highestCaptainId)
        : null;

    const timeline = liveSession?.liveBidTimeline ?? [];

    const getCaptainColor = (cId: string) =>
        captains.find((c) => c.id === cId)?.color ?? 'var(--muted)';

    const handleRaise = () => {
        if (!hasPlayer || isLeading || !canAfford) return;
        raiseLiveBid(captainId, nextBid);
    };

    return (
        <div className="owner-bid">
            {/* Outbid flash */}
            <AnimatePresence>
                {outbid && (
                    <motion.div
                        className="outbid-banner"
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    >
                        OUTBID — raise to stay in!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Identity bar */}
            <div
                className="owner-bid__identity"
                style={{ '--captain-color': captain.color } as React.CSSProperties}
            >
                <span className="owner-bid__identity-name">{captain.name}</span>
                <span className="owner-bid__identity-purse">
                    {captain.purseRemaining} pts left
                </span>
                <button className="owner-bid__change" onClick={handleChange}>
                    Change
                </button>
            </div>

            {/* Player on block */}
            <div className="owner-bid__player-card">
                {currentPlayer ? (
                    <>
                        <div className="owner-bid__player-meta">
                            <GroupBadge group={currentPlayer.group} size="md" />
                            <span className="owner-bid__player-name">{currentPlayer.name}</span>
                        </div>

                        <div className="owner-bid__bid-section">
                            <span className="owner-bid__bid-label">
                                {liveSession?.highestCaptainId ? 'CURRENT BID' : 'OPENING'}
                            </span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={liveBid}
                                    className="owner-bid__bid-value"
                                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                                >
                                    {liveBid}
                                </motion.span>
                            </AnimatePresence>
                            <span className="owner-bid__bid-pts">pts</span>
                        </div>

                        {leadingCaptain ? (
                            <div className="owner-bid__leading">
                                <span
                                    className="owner-bid__leading-dot"
                                    style={{ background: leadingCaptain.color }}
                                />
                                {isLeading
                                    ? 'You are leading'
                                    : `Leading: ${leadingCaptain.name}`}
                            </div>
                        ) : (
                            <div className="owner-bid__leading owner-bid__leading--none">
                                No bids yet — be the first
                            </div>
                        )}
                    </>
                ) : (
                    <div className="owner-bid__waiting">
                        <span className="owner-bid__waiting-text">Waiting for auction to start</span>
                        <span className="owner-bid__waiting-sub">Admin will put a player on the block</span>
                    </div>
                )}
            </div>

            {/* Bid log */}
            {timeline.length > 0 && (
                <div className="owner-bid__log">
                    <div className="owner-bid__log-title">Bid history</div>
                    <div className="owner-bid__log-list">
                        {[...timeline].reverse().map((entry, i) => (
                            <div
                                key={`${entry.captainId}-${entry.amount}-${i}`}
                                className={`owner-log-row ${entry.captainId === captainId ? 'owner-log-row--mine' : ''}`}
                            >
                                <span
                                    className="owner-log-row__dot"
                                    style={{ background: getCaptainColor(entry.captainId) }}
                                />
                                <span className="owner-log-row__name">{entry.captainName}</span>
                                <span className="owner-log-row__amount">{entry.amount} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Raise CTA */}
            <div className="owner-bid__cta">
                {isLeading ? (
                    <button className="owner-bid__btn owner-bid__btn--leading" disabled>
                        You're leading at {liveBid} pts
                    </button>
                ) : !hasPlayer ? (
                    <button className="owner-bid__btn owner-bid__btn--waiting" disabled>
                        Waiting for player
                    </button>
                ) : !canAfford ? (
                    <button className="owner-bid__btn owner-bid__btn--broke" disabled>
                        Not enough purse ({captain.purseRemaining} pts)
                    </button>
                ) : (
                    <motion.button
                        className="owner-bid__btn owner-bid__btn--raise"
                        onClick={handleRaise}
                        whileTap={{ scale: 0.97 }}
                    >
                        RAISE — {nextBid} pts
                    </motion.button>
                )}
            </div>
        </div>
    );
}
