import { AnimatePresence, motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import type { Bid, Captain, LiveBidEntry } from '@/types';
import { GroupBadge } from '@/components/GroupBadge/GroupBadge';
import './BidTimeline.css';

interface BidTimelineProps {
    timeline: LiveBidEntry[];
    captains: Captain[];
    bids: Bid[];
}

export function BidTimeline({ timeline, captains, bids }: BidTimelineProps) {
    const chartData = timeline.map((e, i) => ({ index: i + 1, amount: e.amount }));

    const getCaptainColor = (captainId: string) =>
        captains.find((c) => c.id === captainId)?.color ?? 'var(--muted)';

    return (
        <div className="bid-timeline">
            <div className="bid-timeline__header">
                <span className="bid-timeline__title">Bid Timeline</span>
                <span className="bid-timeline__count">{timeline.length} raises</span>
            </div>

            <div className="bid-timeline__chart">
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={110}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                            <defs>
                                <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fill="url(#bidGradient)"
                                dot={false}
                                activeDot={{ r: 4, fill: 'var(--primary)', stroke: 'var(--canvas)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--surface-elevated)',
                                    border: '1px solid var(--hairline-strong)',
                                    borderRadius: 6,
                                    color: 'var(--ink)',
                                    fontSize: 12,
                                }}
                                formatter={(v: number) => [`${v} pts`, 'Bid']}
                                labelFormatter={(i) => `Raise #${i}`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="bid-timeline__chart-empty">
                        {timeline.length === 1 ? 'Chart appears after 2nd raise' : 'No bids yet'}
                    </div>
                )}
            </div>

            <div className="bid-timeline__scroll">
                {/* Active raise list */}
                <AnimatePresence initial={false}>
                    {[...timeline].reverse().map((entry, i) => (
                        <motion.div
                            key={`${entry.captainId}-${entry.amount}-${i}`}
                            className="bid-row"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        >
                            <span
                                className="bid-row__dot"
                                style={{ background: getCaptainColor(entry.captainId) }}
                            />
                            <span className="bid-row__captain">{entry.captainName}</span>
                            <span className="bid-row__amount">{entry.amount} pts</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {timeline.length === 0 && bids.length === 0 && (
                    <p className="bid-timeline__empty">Waiting for first bid</p>
                )}

                {/* Sold players log */}
                {bids.length > 0 && (
                    <>
                        <div className="sold-log__divider">
                            <span className="sold-log__divider-label">Sold — {bids.length}</span>
                        </div>
                        <AnimatePresence initial={false}>
                            {bids.map((bid) => (
                                <motion.div
                                    key={bid.id}
                                    className="sold-log-row"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                                >
                                    <GroupBadge group={bid.group} size="sm" />
                                    <span className="sold-log-row__player">{bid.playerName}</span>
                                    <span className="sold-log-row__arrow">→</span>
                                    <span
                                        className="sold-log-row__captain"
                                        style={{ color: getCaptainColor(bid.captainId) }}
                                    >
                                        {bid.captainName}
                                    </span>
                                    <span className="sold-log-row__pts">{bid.soldPoints}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
