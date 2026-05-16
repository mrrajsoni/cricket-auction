import { useState } from 'react';
import type { NewAuctionPlayer } from '@/types';
import { parsePlayers, maxGroupNumber } from '@/lib/playerParser';

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
                        <th style={{ width: 32 }}>#</th>
                        <th>Player Name</th>
                        <th style={{ width: 120 }}>Group</th>
                        <th style={{ width: 40 }} />
                    </tr>
                </thead>
                <tbody>
                    {players.map((p, i) => (
                        <tr key={i}>
                            <td className="wiz-idx">{i + 1}</td>
                            <td>
                                <input
                                    className="wiz-input"
                                    style={{ height: 36, fontSize: 14 }}
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
                                    className="wiz-input"
                                    style={{ height: 36, fontSize: 14 }}
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

            <p className="wiz-helper" style={{ marginTop: 12 }}>
                {players.length} players across {activeGroups.length} group{activeGroups.length > 1 ? 's' : ''}.
                Press <strong>Enter</strong> in a name field to quickly add the next player.
            </p>

            <style>{`
                .remove-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: var(--r-sm);
                    border: 1px solid var(--hairline-strong);
                    background: transparent;
                    color: var(--muted);
                    font-size: 16px;
                    line-height: 1;
                    cursor: pointer;
                    transition: color 0.15s, border-color 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .remove-btn:hover:not(:disabled) { color: var(--down); border-color: var(--down); }
                .remove-btn:disabled { opacity: 0.25; cursor: not-allowed; }

                .add-player-btn {
                    margin-top: 14px;
                    background: var(--surface-elevated);
                    border: 1px dashed var(--hairline-strong);
                    border-radius: var(--r-md);
                    color: var(--muted);
                    font-size: 13px;
                    font-weight: 600;
                    padding: 9px 0;
                    width: 100%;
                    cursor: pointer;
                    transition: color 0.15s, border-color 0.15s;
                }
                .add-player-btn:hover { color: var(--ink); border-color: var(--primary); border-style: solid; }

                /* Paste panel */
                .paste-panel {
                    margin-bottom: 20px;
                }
                .paste-toggle {
                    background: transparent;
                    border: 1px solid var(--hairline-strong);
                    border-radius: var(--r-sm);
                    color: var(--muted);
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    padding: 6px 14px;
                    cursor: pointer;
                    transition: color 0.15s, border-color 0.15s;
                }
                .paste-toggle:hover { color: var(--ink); border-color: var(--primary); }

                .paste-body {
                    margin-top: 12px;
                    background: var(--surface-elevated);
                    border: 1px solid var(--hairline-strong);
                    border-radius: var(--r-lg);
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .paste-hint {
                    font-size: 13px;
                    color: var(--muted);
                }
                .paste-example {
                    font-family: var(--font-display);
                    font-size: 12px;
                    color: var(--muted-strong);
                    background: var(--canvas);
                    border: 1px solid var(--hairline);
                    border-radius: var(--r-sm);
                    padding: 10px 14px;
                    white-space: pre;
                    line-height: 1.6;
                }
                .paste-textarea {
                    width: 100%;
                    background: var(--canvas);
                    border: 1px solid var(--hairline-strong);
                    border-radius: var(--r-md);
                    color: var(--ink);
                    font-family: var(--font-body);
                    font-size: 13px;
                    line-height: 1.6;
                    padding: 10px 14px;
                    resize: vertical;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .paste-textarea:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--focus-ring);
                }
                .paste-actions { display: flex; gap: 8px; }
                .paste-btn {
                    border: none;
                    border-radius: var(--r-sm);
                    font-family: var(--font-display);
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    padding: 9px 20px;
                    cursor: pointer;
                    transition: background 0.15s, opacity 0.15s;
                }
                .paste-btn:disabled { opacity: 0.35; cursor: not-allowed; }
                .paste-btn--parse {
                    background: var(--surface-card);
                    color: var(--ink);
                    border: 1px solid var(--hairline-strong);
                }
                .paste-btn--parse:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .paste-btn--apply {
                    background: var(--primary);
                    color: var(--on-primary);
                }
                .paste-btn--apply:hover { background: var(--primary-active); }

                .paste-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding-top: 4px;
                    border-top: 1px solid var(--hairline);
                }
                .paste-preview__count {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--up);
                }
                .paste-preview__list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                .paste-preview__chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: var(--canvas);
                    border: 1px solid var(--hairline);
                    border-radius: var(--r-pill);
                    font-size: 11px;
                    color: var(--body);
                    padding: 3px 10px;
                }
                .paste-preview__chip--more {
                    color: var(--muted);
                    font-style: italic;
                }
                .paste-preview__group {
                    font-family: var(--font-display);
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}
