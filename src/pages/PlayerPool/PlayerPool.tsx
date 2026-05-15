import {useState} from 'react';
import {useAuctionStore} from '@/store/auctionStore';
import {GroupBadge} from '@/components/GroupBadge/GroupBadge';
import type {Group} from '@/types';
import './PlayerPool.css';

type Filter = 'all' | 'available' | 'sold';

const GROUPS: Group[] = ['A', 'B', 'C', 'D'];

export function PlayerPool() {
    const {players, captains} = useAuctionStore();
    const [statusFilter, setStatusFilter] = useState<Filter>('all');
    const [groupFilter, setGroupFilter] = useState<Group | 'all'>('all');
    const [search, setSearch] = useState('');

    const filtered = players.filter(p => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (groupFilter !== 'all' && p.group !== groupFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const getCaptainName = (captainId?: string) =>
        captains.find(c => c.id === captainId)?.name ?? '—';

    return (
        <div className="player-pool">
            <div className="player-pool__toolbar">
                <div className="player-pool__search-wrap">
                    <input
                        className="player-pool__search"
                        placeholder="Search player..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="player-pool__filters">
                    {(['all', 'available', 'sold'] as Filter[]).map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${statusFilter === f ? 'filter-btn--active' : ''}`}
                            onClick={() => setStatusFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    <div className="player-pool__divider" />
                    {(['all', ...GROUPS] as (Group | 'all')[]).map(g => (
                        <button
                            key={g}
                            className={`filter-btn filter-btn--group ${groupFilter === g ? 'filter-btn--active' : ''}`}
                            onClick={() => setGroupFilter(g)}
                        >
                            {g === 'all' ? 'All Groups' : `Group ${g}`}
                        </button>
                    ))}
                </div>
                <span className="player-pool__count">{filtered.length} players</span>
            </div>

            <div className="player-pool__table-wrap">
                <table className="player-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Group</th>
                            <th>Base</th>
                            <th>Status</th>
                            <th>Sold To</th>
                            <th>Sold For</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(player => (
                            <tr key={player.id} className={`player-row player-row--${player.status}`}>
                                <td className="player-row__name">{player.name}</td>
                                <td><GroupBadge group={player.group} size="sm" /></td>
                                <td className="player-row__base">{player.baseValue}</td>
                                <td>
                                    <span className={`status-pill status-pill--${player.status}`}>
                                        {player.status}
                                    </span>
                                </td>
                                <td className="player-row__captain">
                                    {player.soldTo ? getCaptainName(player.soldTo) : '—'}
                                </td>
                                <td className="player-row__sold-for">
                                    {player.soldPoints ? (
                                        <span style={{color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700}}>
                                            {player.soldPoints}
                                        </span>
                                    ) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <p className="player-pool__empty">No players match the current filters.</p>
                )}
            </div>
        </div>
    );
}
