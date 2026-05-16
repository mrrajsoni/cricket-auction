import { motion } from 'framer-motion';
import type { Captain } from '@/types';
import { GroupBadge } from '@/components/GroupBadge/GroupBadge';
import './OwnerLogin.css';

interface OwnerLoginProps {
    captains: Captain[];
    onSelect: (captainId: string) => void;
}

export function OwnerLogin({ captains, onSelect }: OwnerLoginProps) {
    return (
        <div className="owner-login">
            <div className="owner-login__header">
                <h1 className="owner-login__title">Who are you?</h1>
                <p className="owner-login__sub">Select your team to start bidding</p>
            </div>

            <div className="owner-login__grid">
                {captains.map((captain, i) => {
                    const pct = captain.purseRemaining / captain.purseTotal;
                    const valueColor = pct < 0.2
                        ? 'var(--down)'
                        : pct < 0.5
                        ? 'var(--warn)'
                        : captain.color;

                    return (
                        <motion.button
                            key={captain.id}
                            className="owner-card"
                            style={{ '--captain-color': captain.color } as React.CSSProperties}
                            onClick={() => onSelect(captain.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 240, damping: 22 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className="owner-card__header">
                                <GroupBadge group={captain.group} size="sm" />
                            </div>
                            <div className="owner-card__name">{captain.name}</div>
                            <div
                                className="owner-card__purse"
                                style={{ color: valueColor }}
                            >
                                {captain.purseRemaining}
                            </div>
                            <div className="owner-card__purse-label">pts remaining</div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
