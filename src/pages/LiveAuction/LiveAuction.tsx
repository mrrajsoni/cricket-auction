import { useEffect } from 'react';
import { useAuctionStore } from '@/store/auctionStore';
import { PlayerSpotlight } from '@/components/PlayerSpotlight/PlayerSpotlight';
import { BidTimeline } from '@/components/BidTimeline/BidTimeline';
import { AdminPanel } from '@/components/AdminPanel/AdminPanel';
import { PurseBar } from '@/components/PurseBar/PurseBar';
import './LiveAuction.css';

interface LiveAuctionProps {
    isAdmin: boolean;
}

export function LiveAuction({ isAdmin }: LiveAuctionProps) {
    const { captains, players, bids, liveSession, subscribeLiveSession } = useAuctionStore();

    useEffect(() => {
        subscribeLiveSession();
    }, [subscribeLiveSession]);

    const currentPlayer = liveSession
        ? players.find((p) => p.id === liveSession.playerQueue[liveSession.currentQueueIndex])
        : undefined;

    const highestCaptain = liveSession?.highestCaptainId
        ? captains.find((c) => c.id === liveSession.highestCaptainId)
        : undefined;

    return (
        <div className={`live-auction ${isAdmin ? 'live-auction--admin' : ''}`}>
            {isAdmin && (
                <div className="live-auction__admin-badge">ADMIN</div>
            )}

            <div className="live-auction__content">
                <div className="live-auction__spotlight">
                    <PlayerSpotlight
                        player={currentPlayer}
                        liveSession={liveSession}
                        highestCaptain={highestCaptain}
                    />
                </div>

                <div className="live-auction__timeline">
                    <BidTimeline
                        timeline={liveSession?.liveBidTimeline ?? []}
                        captains={captains}
                        bids={bids}
                    />
                </div>

                {isAdmin && (
                    <div className="live-auction__panel">
                        <AdminPanel />
                    </div>
                )}
            </div>

            <div className="live-auction__purses">
                {captains.map((captain) => {
                    const pct = captain.purseRemaining / captain.purseTotal;
                    const valueColor = pct < 0.2
                        ? 'var(--down)'
                        : pct < 0.5
                        ? 'var(--warn)'
                        : captain.color;
                    return (
                        <div
                            key={captain.id}
                            className="live-purse-card"
                            style={{ '--captain-color': captain.color } as React.CSSProperties}
                        >
                            <span className="live-purse-card__name">{captain.name}</span>
                            <span
                                className="live-purse-card__value"
                                style={{ color: valueColor }}
                            >
                                {captain.purseRemaining}
                            </span>
                            <span className="live-purse-card__label">pts left</span>
                            <PurseBar
                                captainName={captain.name}
                                purseTotal={captain.purseTotal}
                                purseRemaining={captain.purseRemaining}
                                color={captain.color}
                                compact
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
