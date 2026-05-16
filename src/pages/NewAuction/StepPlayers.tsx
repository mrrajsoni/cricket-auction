import { useState } from 'react';
import type { NewAuctionPlayer } from '@/types';
import { parsePlayers, maxGroupNumber } from '@/lib/playerParser';
import './StepPlayers.css';

interface StepPlayersProps {
    players: NewAuctionPlayer[];
    activeGroups: string[];
    onChange: (players: NewAuctionPlayer[]) => void;
    onNumGroupsChange?: (n: number) => void;
}

export function StepPlayers({ players, activeGroups, onChange, onNumGroupsChange }: StepPlayersProps) {
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const [preview, setPreview] = useState<NewAuctionPlayer[] | null>(null);

    const add = () =>
        onChange([...players, { name: '', group: activeGroups[0] ?? '1' }]);

    const remove = (i: number) =>
        onChange(players.filter((_, idx) => idx !== i));

    const update = (i: number, patch: Partial<NewAuctionPlayer>) => {
        const next = [...players];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    const handleParse = () => {
        const parsed = parsePlayers(pasteText);
        setPreview(parsed);
    };

    const handleApply = () => {
        if (!preview) return;
        const maxG = maxGroupNumber(preview);
        if (maxG > activeGroups.length && onNumGroupsChange) {
            onNumGroupsChange(maxG);
        }
        onChange(preview.length > 0 ? preview : players);
        setPasteText('');
        setPreview(null);
        setPasteOpen(false);
    };

    return (
        <div>
            <h2 className="wizard-step-title">Players</h2>
            <p className="wizard-step-sub">
                Add players manually or paste a formatted list and let the app parse groups automatically.
            </p>

            {/* Paste import panel */}
            <div className="paste-panel">
                <button
                    type="button"
                    className="paste-toggle"
                    onClick={() => { setPasteOpen(o => !o); setPreview(null); }}
                >
                    {pasteOpen ? '✕ Close paste import' : '⊕ Paste player list'}
                </button>

                {pasteOpen && (
                    <div className="paste-body">
                        <p className="paste-hint">
                            Paste any list that follows the pattern below — group headers and numbered players are detected automatically.
                        </p>
                        <pre className="paste-example">{`Group 1:\n1.Player Name\n2.Player Name\n\nGroup 2:\n3.Player Name`}</pre>
                        <textarea
                            className="paste-textarea"
                            placeholder="Paste your player list here…"
                            value={pasteText}
                            onChange={e => { setPasteText(e.target.value); setPreview(null); }}
                            rows={10}
                        />
                        <div className="paste-actions">
                            <button type="button" className="paste-btn paste-btn--parse" onClick={handleParse} disabled={!pasteText.trim()}>
                                Parse
                            </button>
                        </div>

                        {preview && (
                            <div className="paste-preview">
                                <span className="paste-preview__count">
                                    {preview.length} players detected across {[...new Set(preview.map(p => p.group))].length} groups
                                </span>
                                <div className="paste-preview__list">
                                    {preview.slice(0, 8).map((p, i) => (
                                        <span key={i} className="paste-preview__chip">
                                            <span className="paste-preview__group">G{p.group}</span>
                                            {p.name}
                                        </span>
                                    ))}
                                    {preview.length > 8 && (
                                        <span className="paste-preview__chip paste-preview__chip--more">
                                            +{preview.length - 8} more
                                        </span>
                                    )}
                                </div>
                                <button type="button" className="paste-btn paste-btn--apply" onClick={handleApply}>
                                    Import {preview.length} players
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <table className="wiz-table">
                <thead>
                    <tr>
                        <th className="col-idx">#</th>
                        <th>Player Name</th>
                        <th className="col-group">Group</th>
                        <th className="col-remove" />
                    </tr>
                </thead>
                <tbody>
                    {players.map((p, i) => (
                        <tr key={i}>
                            <td className="wiz-idx">{i + 1}</td>
                            <td>
                                <input
                                    className="wiz-input wiz-input--sm"
                                    placeholder="Player name"
                                    value={p.name}
                                    onChange={e => update(i, { name: e.target.value })}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            add();
                                        }
                                    }}
                                />
                            </td>
                            <td>
                                <select
                                    className="wiz-input wiz-input--sm"
                                    value={p.group}
                                    onChange={e => update(i, { group: e.target.value })}
                                >
                                    {activeGroups.map(g => (
                                        <option key={g} value={g}>Group {g}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => remove(i)}
                                    disabled={players.length === 1}
                                    title="Remove player"
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="button" className="add-player-btn" onClick={add}>
                + Add Player
            </button>

            <p className="wiz-helper players-footer-hint">
                {players.length} players across {activeGroups.length} group{activeGroups.length > 1 ? 's' : ''}.
                Press <strong>Enter</strong> in a name field to quickly add the next player.
            </p>


        </div>
    );
}
