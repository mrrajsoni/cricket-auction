import {motion} from 'framer-motion';
import './PurseBar.css';

interface PurseBarProps {
    captainName: string;
    purseTotal: number;
    purseRemaining: number;
    color: string;
    compact?: boolean;
}

export function PurseBar({captainName, purseTotal, purseRemaining, color, compact = false}: PurseBarProps) {
    const pct = (purseRemaining / purseTotal) * 100;
    const trackColor = pct < 20 ? 'var(--purse-low)' : pct < 50 ? 'var(--purse-mid)' : color;

    return (
        <div className={`purse-bar ${compact ? 'purse-bar--compact' : ''}`}>
            {!compact && (
                <div className="purse-bar__header">
                    <span className="purse-bar__name">{captainName}</span>
                    <span className="purse-bar__value" style={{color: trackColor}}>
                        {purseRemaining}
                        <span className="purse-bar__total"> / {purseTotal}</span>
                    </span>
                </div>
            )}
            <div className="purse-bar__track">
                <motion.div
                    className="purse-bar__fill"
                    style={{backgroundColor: trackColor, boxShadow: `0 0 8px ${trackColor}60`}}
                    initial={false}
                    animate={{width: `${pct}%`}}
                    transition={{type: 'spring', stiffness: 120, damping: 20}}
                />
            </div>
            {compact && (
                <div className="purse-bar__compact-label">
                    <span className="purse-bar__name">{captainName}</span>
                    <span className="purse-bar__value" style={{color: trackColor}}>{purseRemaining}pts</span>
                </div>
            )}
        </div>
    );
}
