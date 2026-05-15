import {useParams, Link} from 'react-router-dom';
import {PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import {useAuctionStore} from '@/store/auctionStore';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import {PurseBar} from '@/components/PurseBar/PurseBar';
import type {Group} from '@/types';
import './CaptainProfile.css';

const GROUP_COLORS: Record<Group, string> = {
    A: 'var(--group-a)',
    B: 'var(--group-b)',
    C: 'var(--group-c)',
    D: 'var(--group-d)',
};

export function CaptainProfile() {
    const {captainId} = useParams<{captainId: string}>();
    const {captains, players, bids} = useAuctionStore();

    const captain = captains.find(c => c.id === captainId);
    if (!captain) {
        return (
            <div className="captain-profile captain-profile--not-found">
                <p>Captain not found.</p>
                <Link to="/dashboard" className="captain-profile__back">← Back to Dashboard</Link>
            </div>
        );
    }

    const captainBids = bids.filter(b => b.captainId === captain.id);
    const squad = players.filter(p => p.soldTo === captain.id);
    const spent = captain.purseTotal - captain.purseRemaining;

    const purseData = [
        {name: 'Spent', value: spent},
        {name: 'Remaining', value: captain.purseRemaining},
    ];

    const groupData = (['A', 'B', 'C', 'D'] as Group[]).map(g => ({
        group: `Group ${g}`,
        players: squad.filter(p => p.group === g).length,
        fill: GROUP_COLORS[g],
    })).filter(d => d.players > 0);

    return (
        <div className="captain-profile">
            <div className="captain-profile__header">
                <Link to="/dashboard" className="captain-profile__back">← All Captains</Link>
                <div className="captain-profile__identity" style={{'--captain-color': captain.color} as React.CSSProperties}>
                    <div className="captain-profile__name">{captain.name}</div>
                    <GroupBadge group={captain.group} size="lg" />
                </div>
            </div>

            <div className="captain-profile__stats-row">
                <div className="profile-stat">
                    <span className="profile-stat__value" style={{color: captain.color}}>{captain.purseRemaining}</span>
                    <span className="profile-stat__label">Purse Remaining</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__value">{spent}</span>
                    <span className="profile-stat__label">Total Spent</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__value">{squad.length}</span>
                    <span className="profile-stat__label">Players</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__value">
                        {captainBids.length > 0 ? Math.max(...captainBids.map(b => b.soldPoints)) : '—'}
                    </span>
                    <span className="profile-stat__label">Top Bid</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat__value">
                        {captainBids.length > 0
                            ? Math.round(captainBids.reduce((s, b) => s + b.soldPoints, 0) / captainBids.length)
                            : '—'}
                    </span>
                    <span className="profile-stat__label">Avg Per Player</span>
                </div>
            </div>

            <div className="captain-profile__purse-bar">
                <PurseBar
                    captainName={captain.name}
                    purseTotal={captain.purseTotal}
                    purseRemaining={captain.purseRemaining}
                    color={captain.color}
                />
            </div>

            <div className="captain-profile__charts">
                <div className="chart-card">
                    <h3 className="chart-card__title">Purse Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={purseData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                                <Cell fill={captain.color} />
                                <Cell fill="var(--surface-elevated)" />
                            </Pie>
                            <Tooltip
                                contentStyle={{background: 'var(--surface-elevated)', border: '1px solid var(--hairline-strong)', borderRadius: 8, color: 'var(--ink)'}}
                                formatter={(v: number) => [`${v} pts`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-card__legend">
                        <span style={{color: captain.color}}>■ Spent {spent}</span>
                        <span style={{color: 'var(--muted)'}}>■ Left {captain.purseRemaining}</span>
                    </div>
                </div>

                {groupData.length > 0 && (
                    <div className="chart-card">
                        <h3 className="chart-card__title">Squad by Group</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={groupData} barSize={32}>
                                <XAxis dataKey="group" tick={{fill: 'var(--muted)', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: 'var(--muted)', fontSize: 11}} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{background: 'var(--surface-elevated)', border: '1px solid var(--hairline-strong)', borderRadius: 8, color: 'var(--ink)'}}
                                    cursor={{fill: 'var(--hairline)'}}
                                />
                                <Bar dataKey="players" radius={[4, 4, 0, 0]}>
                                    {groupData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="captain-profile__squad">
                <h2 className="captain-profile__squad-title">Squad ({squad.length})</h2>
                {squad.length === 0 ? (
                    <p className="captain-profile__empty">No players acquired yet.</p>
                ) : (
                    <div className="squad-list">
                        {squad.map(player => (
                            <div key={player.id} className="squad-item">
                                <div className="squad-item__left">
                                    <GroupBadge group={player.group} size="sm" />
                                    <span className="squad-item__name">{player.name}</span>
                                </div>
                                <span className="squad-item__points" style={{color: captain.color}}>
                                    {player.soldPoints} pts
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
