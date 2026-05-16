import { useEffect, useRef } from 'react';
import { useAuctionStore } from '@/store/auctionStore';
import { GroupBadge } from '@/components/GroupBadge/GroupBadge';
import type { Group } from '@/types';
import './AdminPanel.css';

const GROUPS: Group[] = ['A', 'B', 'C', 'D'];

export function AdminPanel() {
    const {
        players, liveSession,
        selectGroupAndShuffle, confirmSale, markUnsold,
        advancePlayer, previousPlayer, jumpToPlayer,
    } = useAuctionStore();

    const listRef = useRef<HTMLDivElement>(null);

    const currentQueueIndex = liveSession?.currentQueueIndex ?? 0;
    const queueLength = liveSession?.playerQueue.length ?? 0;
    const noSession = !liveSession;
    const atStart = currentQueueIndex <= 0;
    const atEnd = currentQueueIndex >= queueLength - 1;

    // Resolve full player list from queue
    const queuedPlayers = liveSession
        ? liveSession.playerQueue.map((id) => players.find((p) => p.id === id))
        : [];

    // Auto-scroll current row into view when index changes
    useEffect(() => {
        const current = listRef.current?.querySelector('.player-list-row--current');
        current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [currentQueueIndex]);

    const availableCountForGroup = (g: Group) =>
        players.filter((p) => p.group === g && p.status === 'available').length;

    return (
        <div className="admin-panel">

            {/* Group selector */}
            <section className="admin-section">
                <h3 className="admin-section__title">Select Group</h3>
                <div className="group-pills">
                    {GROUPS.map((g) => {
                        const count = availableCountForGroup(g);
                        return (
                            <button
                                key={g}
                                className={`group-pill ${liveSession?.activeGroup === g ? 'group-pill--active' : ''}`}
                                onClick={() => selectGroupAndShuffle(g)}
                                disabled={count === 0}
                            >
                                <span className="group-pill__letter">{g}</span>
                                <span className="group-pill__count">{count}</span>
                            </button>
                        );
                    })}
                </div>
                {liveSession?.activeGroup && (
                    <button
                        className="admin-btn admin-btn--ghost admin-shuffle"
                        onClick={() => selectGroupAndShuffle(liveSession.activeGroup!)}
                    >
                        Reshuffle Group {liveSession.activeGroup}
                    </button>
                )}
            </section>

            {/* Player list with cursor */}
            {queuedPlayers.length > 0 && (
                <section className="admin-section admin-section--list">
                    <div className="admin-section__title-row">
                        <h3 className="admin-section__title">Players</h3>
                        <span className="admin-section__sub">
                            {currentQueueIndex + 1} / {queueLength}
                        </span>
                    </div>
                    <div className="player-list" ref={listRef}>
                        {queuedPlayers.map((p, i) => {
                            if (!p) return null;
                            const isCurrent = i === currentQueueIndex;
                            return (
                                <button
                                    key={p.id}
                                    className={[
                                        'player-list-row',
                                        isCurrent ? 'player-list-row--current' : '',
                                        p.status === 'sold' ? 'player-list-row--sold' : '',
                                        p.status === 'unsold' ? 'player-list-row--unsold' : '',
                                    ].join(' ')}
                                    onClick={() => jumpToPlayer(i)}
                                >
                                    <span className="player-list-row__index">{i + 1}</span>
                                    <GroupBadge group={p.group} size="sm" />
                                    <span className="player-list-row__name">{p.name}</span>
                                    <span className="player-list-row__base">{p.baseValue}</span>
                                    {p.status === 'sold' && (
                                        <span className="player-list-row__tag player-list-row__tag--sold">sold</span>
                                    )}
                                    {p.status === 'unsold' && (
                                        <span className="player-list-row__tag player-list-row__tag--unsold">unsold</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="nav-row">
                        <button
                            className="admin-btn admin-btn--nav"
                            onClick={previousPlayer}
                            disabled={noSession || atStart}
                        >
                            ← Prev
                        </button>
                        <button
                            className="admin-btn admin-btn--nav"
                            onClick={advancePlayer}
                            disabled={noSession || atEnd}
                        >
                            Next →
                        </button>
                    </div>
                </section>
            )}

            {/* SOLD / Unsold */}
            <section className="admin-section admin-actions">
                <button
                    className="admin-btn admin-btn--sold"
                    onClick={confirmSale}
                    disabled={!liveSession?.highestCaptainId}
                >
                    SOLD
                </button>
                <button
                    className="admin-btn admin-btn--unsold"
                    onClick={markUnsold}
                    disabled={noSession}
                >
                    Unsold
                </button>
            </section>

        </div>
    );
}
