import {AnimatePresence, motion} from 'framer-motion';
import {useAuctionStore} from '@/store/auctionStore';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import './LiveTicker.css';

export function LiveTicker() {
    const bids = useAuctionStore(s => s.bids);

    return (
        <div className="live-ticker">
            <div className="live-ticker__header">
                <span className="live-ticker__dot" />
                <span className="live-ticker__title">Live Feed</span>
                <span className="live-ticker__count">{bids.length} sold</span>
            </div>
            <div className="live-ticker__list">
                <AnimatePresence initial={false}>
                    {bids.slice(0, 12).map(bid => (
                        <motion.div
                            key={bid.id}
                            className="live-ticker__item"
                            initial={{opacity: 0, x: 40, scale: 0.95}}
                            animate={{opacity: 1, x: 0, scale: 1}}
                            exit={{opacity: 0, x: -20}}
                            transition={{type: 'spring', stiffness: 300, damping: 30}}
                        >
                            <div className="live-ticker__item-top">
                                <GroupBadge group={bid.group} size="sm" />
                                <span className="live-ticker__player">{bid.playerName}</span>
                            </div>
                            <div className="live-ticker__item-bottom">
                                <span className="live-ticker__captain">{bid.captainName}</span>
                                <span className="live-ticker__points">{bid.soldPoints} pts</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {bids.length === 0 && (
                    <p className="live-ticker__empty">Auction not started yet</p>
                )}
            </div>
        </div>
    );
}
