import {AnimatePresence, motion} from 'framer-motion';
import {useAuctionStore} from '@/store/auctionStore';
import {BidEntry} from '@/components/BidEntry/BidEntry';
import {PurseBar} from '@/components/PurseBar/PurseBar';
import {LiveTicker} from '@/components/LiveTicker/LiveTicker';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import './AuctionRoom.css';

export function AuctionRoom() {
    const {captains, players, bids, lastSoldId} = useAuctionStore();
    const lastBid = bids[0];
    const availableCount = players.filter(p => p.status === 'available').length;
    const soldCount = players.filter(p => p.status === 'sold').length;

    return (
        <div className="auction-room">
            <div className="auction-room__main">
                <div className="auction-room__sold-banner">
                    <AnimatePresence mode="wait">
                        {lastBid ? (
                            <motion.div
                                key={lastBid.id}
                                className="sold-card"
                                initial={{opacity: 0, scale: 0.85, y: 20}}
                                animate={{opacity: 1, scale: 1, y: 0}}
                                exit={{opacity: 0, scale: 0.95, y: -10}}
                                transition={{type: 'spring', stiffness: 200, damping: 22}}
                            >
                                <div className="sold-card__stamp">SOLD</div>
                                <div className="sold-card__player">{lastBid.playerName}</div>
                                <GroupBadge group={lastBid.group} size="lg" />
                                <div className="sold-card__meta">
                                    <span className="sold-card__to">to</span>
                                    <span className="sold-card__captain">{lastBid.captainName}</span>
                                </div>
                                <div className="sold-card__points">{lastBid.soldPoints} pts</div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                className="sold-card sold-card--empty"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                            >
                                <div className="sold-card__idle">🏏 Auction Ready</div>
                                <div className="sold-card__idle-sub">
                                    {availableCount} players available
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="auction-room__stats-strip">
                    <div className="stat-chip">
                        <span className="stat-chip__value">{soldCount}</span>
                        <span className="stat-chip__label">Sold</span>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-chip__value">{availableCount}</span>
                        <span className="stat-chip__label">Available</span>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-chip__value">
                            {bids.length > 0 ? Math.max(...bids.map(b => b.soldPoints)) : '—'}
                        </span>
                        <span className="stat-chip__label">Highest Bid</span>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-chip__value">
                            {bids.length > 0
                                ? Math.round(bids.reduce((s, b) => s + b.soldPoints, 0) / bids.length)
                                : '—'}
                        </span>
                        <span className="stat-chip__label">Avg Bid</span>
                    </div>
                </div>

                <div className="auction-room__purses">
                    {captains.map(captain => (
                        <PurseBar
                            key={captain.id}
                            captainName={captain.name}
                            purseTotal={captain.purseTotal}
                            purseRemaining={captain.purseRemaining}
                            color={captain.color}
                        />
                    ))}
                </div>
            </div>

            <div className="auction-room__sidebar">
                <BidEntry />
                <LiveTicker />
            </div>
        </div>
    );
}
