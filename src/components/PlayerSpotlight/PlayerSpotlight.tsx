import { motion, AnimatePresence } from 'framer-motion';
import type { Captain, LiveSession, Player } from '@/types';
import { GroupBadge } from '@/components/GroupBadge/GroupBadge';
import './PlayerSpotlight.css';

interface PlayerSpotlightProps {
    player: Player | undefined;
    liveSession: LiveSession | null;
    highestCaptain: Captain | undefined;
}

export function PlayerSpotlight({ player, liveSession, highestCaptain }: PlayerSpotlightProps) {
    const queueTotal = liveSession?.playerQueue.length ?? 0;
    const queuePos = (liveSession?.currentQueueIndex ?? 0) + 1;
    const bidAmount = liveSession?.liveBidAmount ?? 0;
    const hasBid = !!liveSession?.highestCaptainId;

    if (!liveSession || !player) {
        return (
            <div className="player-spotlight player-spotlight--idle">
                <div className="player-spotlight__idle-title">Auction Ready</div>
                <p className="player-spotlight__idle-sub">Select a group to begin</p>
            </div>
        );
    }

    if (queuePos > queueTotal) {
        return (
            <div className="player-spotlight player-spotlight--idle">
                <div className="player-spotlight__idle-title">Group Complete</div>
                <p className="player-spotlight__idle-sub">All players in this group have been auctioned</p>
            </div>
        );
    }

    return (
        <div className="player-spotlight">
            <div className="player-spotlight__queue-pos">
                Player {queuePos} of {queueTotal}
            </div>

            <div className="player-spotlight__identity">
                <GroupBadge group={player.group} size="lg" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={player.id}
                        className="player-spotlight__name"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    >
                        {player.name}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="player-spotlight__pricing">
                <div className="player-spotlight__base">
                    <span className="player-spotlight__base-label">OPENING</span>
                    <span className="player-spotlight__base-value">50</span>
                </div>

                <div className="player-spotlight__divider" />

                <div className="player-spotlight__live-bid">
                    <span className="player-spotlight__bid-label">
                        {hasBid ? 'CURRENT BID' : 'OPENING'}
                    </span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={bidAmount}
                            className="player-spotlight__bid-value"
                            initial={{ opacity: 0, scale: 0.88, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.08 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        >
                            {bidAmount}
                        </motion.span>
                    </AnimatePresence>
                    <span className="player-spotlight__bid-pts">pts</span>
                </div>
            </div>

            {hasBid && highestCaptain ? (
                <div className="player-spotlight__leader">
                    <span
                        className="player-spotlight__leader-dot"
                        style={{ background: highestCaptain.color }}
                    />
                    <span className="player-spotlight__leader-label">Leading:</span>
                    <span
                        className="player-spotlight__leader-name"
                        style={{ color: highestCaptain.color }}
                    >
                        {highestCaptain.name}
                    </span>
                </div>
            ) : (
                <div className="player-spotlight__leader player-spotlight__leader--none">
                    No bids yet — starts at base price
                </div>
            )}
        </div>
    );
}
