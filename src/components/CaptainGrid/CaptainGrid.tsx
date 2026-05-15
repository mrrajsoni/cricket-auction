import {motion} from 'framer-motion';
import {useAuctionStore} from '@/store/auctionStore';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import {PurseBar} from '@/components/PurseBar/PurseBar';
import {Link} from 'react-router-dom';
import './CaptainGrid.css';

export function CaptainGrid() {
    const {captains, bids} = useAuctionStore();

    return (
        <div className="captain-grid">
            {captains.map((captain, i) => {
                const squad = bids.filter(b => b.captainId === captain.id);
                const topBid = squad.reduce((max, b) => b.soldPoints > max ? b.soldPoints : max, 0);
                const pct = captain.purseRemaining / captain.purseTotal;

                return (
                    <motion.div
                        key={captain.id}
                        className="captain-card"
                        style={{'--captain-color': captain.color} as React.CSSProperties}
                        initial={{opacity: 0, y: 16}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: i * 0.05}}
                    >
                        <Link to={`/captain/${captain.id}`} className="captain-card__link">
                            <div className="captain-card__header">
                                <GroupBadge group={captain.group} size="sm" />
                                <span className="captain-card__name">{captain.name}</span>
                            </div>

                            <div className="captain-card__purse">
                                <span
                                    className="captain-card__purse-value"
                                    style={{color: pct < 0.2 ? 'var(--purse-low)' : pct < 0.5 ? 'var(--purse-mid)' : captain.color}}
                                >
                                    {captain.purseRemaining}
                                </span>
                                <span className="captain-card__purse-label">pts left</span>
                            </div>

                            <PurseBar
                                captainName={captain.name}
                                purseTotal={captain.purseTotal}
                                purseRemaining={captain.purseRemaining}
                                color={captain.color}
                                compact
                            />

                            <div className="captain-card__stats">
                                <div className="captain-card__stat">
                                    <span className="captain-card__stat-value">{squad.length}</span>
                                    <span className="captain-card__stat-label">Players</span>
                                </div>
                                <div className="captain-card__stat">
                                    <span className="captain-card__stat-value">{topBid || '—'}</span>
                                    <span className="captain-card__stat-label">Top Bid</span>
                                </div>
                                <div className="captain-card__stat">
                                    <span className="captain-card__stat-value">
                                        {captain.purseTotal - captain.purseRemaining}
                                    </span>
                                    <span className="captain-card__stat-label">Spent</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
