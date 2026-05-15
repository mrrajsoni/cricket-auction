import {useAuctionStore} from '@/store/auctionStore';
import {CaptainGrid} from '@/components/CaptainGrid/CaptainGrid';
import {LiveTicker} from '@/components/LiveTicker/LiveTicker';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import type {Group} from '@/types';
import './Dashboard.css';

const GROUPS: Group[] = ['A', 'B', 'C', 'D'];

export function Dashboard() {
    const {captains, players, bids} = useAuctionStore();

    const totalSpent = captains.reduce((s, c) => s + (c.purseTotal - c.purseRemaining), 0);
    const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.soldPoints)) : 0;
    const highestBidEntry = bids.find(b => b.soldPoints === highestBid);
    const mostActive = captains.reduce((prev, cur) => {
        const prevCount = bids.filter(b => b.captainId === prev.id).length;
        const curCount = bids.filter(b => b.captainId === cur.id).length;
        return curCount > prevCount ? cur : prev;
    }, captains[0]);

    const purseLeader = [...captains].sort((a, b) => b.purseRemaining - a.purseRemaining)[0];

    return (
        <div className="dashboard">
            <div className="dashboard__hero">
                <div className="hero-stat">
                    <span className="hero-stat__value">{bids.length}</span>
                    <span className="hero-stat__label">Players Sold</span>
                </div>
                <div className="hero-stat">
                    <span className="hero-stat__value">{highestBid || '—'}</span>
                    <span className="hero-stat__label">
                        {highestBidEntry ? `Highest — ${highestBidEntry.playerName}` : 'Highest Bid'}
                    </span>
                </div>
                <div className="hero-stat">
                    <span className="hero-stat__value">{totalSpent}</span>
                    <span className="hero-stat__label">Total Points Spent</span>
                </div>
                <div className="hero-stat">
                    <span className="hero-stat__value">{purseLeader?.purseRemaining ?? '—'}</span>
                    <span className="hero-stat__label">
                        {purseLeader ? `Purse Leader — ${purseLeader.name}` : 'Purse Leader'}
                    </span>
                </div>
            </div>

            <div className="dashboard__body">
                <div className="dashboard__left">
                    <h2 className="dashboard__section-title">Captains</h2>
                    <CaptainGrid />

                    <h2 className="dashboard__section-title" style={{marginTop: 28}}>Group Progress</h2>
                    <div className="group-progress">
                        {GROUPS.map(group => {
                            const total = players.filter(p => p.group === group).length;
                            const sold = players.filter(p => p.group === group && p.status === 'sold').length;
                            const pct = total > 0 ? (sold / total) * 100 : 0;
                            return (
                                <div key={group} className="group-progress__row">
                                    <GroupBadge group={group} size="md" />
                                    <div className="group-progress__track">
                                        <div
                                            className="group-progress__fill"
                                            style={{
                                                width: `${pct}%`,
                                                background: `var(--group-${group.toLowerCase()})`,
                                                boxShadow: `0 0 8px var(--group-${group.toLowerCase()}-glow)`,
                                            }}
                                        />
                                    </div>
                                    <span className="group-progress__label">{sold}/{total}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="dashboard__right">
                    <h2 className="dashboard__section-title">Live Feed</h2>
                    <div className="dashboard__ticker">
                        <LiveTicker />
                    </div>
                </div>
            </div>
        </div>
    );
}
