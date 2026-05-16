import { CAPTAIN_COLORS } from '@/store/auctionStore';
import type { NewAuctionCaptain } from '@/types';


interface StepCaptainsProps {
    captains: NewAuctionCaptain[];
    defaultPurse: number;
    onChange: (captains: NewAuctionCaptain[]) => void;
}

const COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

export function StepCaptains({ captains, defaultPurse, onChange }: StepCaptainsProps) {
    const setCount = (n: number) => {
        const next = [...captains];
        while (next.length < n) next.push({ name: '', purse: defaultPurse });
        onChange(next.slice(0, n));
    };

    const update = (i: number, patch: Partial<NewAuctionCaptain>) => {
        const next = [...captains];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };

    return (
        <div>
            <h2 className="wizard-step-title">Captains</h2>
            <p className="wizard-step-sub">How many teams are playing? Set each captain's name and purse.</p>

            {/* Count selector */}
            <div className="wiz-field">
                <label className="wiz-label">Number of Captains</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {COUNT_OPTIONS.map(n => (
                        <button
                            key={n}
                            type="button"
                            className={`count-pill ${captains.length === n ? 'count-pill--active' : ''}`}
                            onClick={() => setCount(n)}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Captain table */}
            <table className="wiz-table">
                <thead>
                    <tr>
                        <th style={{ width: 32 }}>#</th>
                        <th>Captain Name</th>
                        <th style={{ width: 160 }}>Purse (pts)</th>
                    </tr>
                </thead>
                <tbody>
                    {captains.map((c, i) => (
                        <tr key={i}>
                            <td className="wiz-idx">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: CAPTAIN_COLORS[i % CAPTAIN_COLORS.length],
                                    }}
                                />
                            </td>
                            <td>
                                <input
                                    className="wiz-input"
                                    style={{ height: 36, fontSize: 14 }}
                                    placeholder={`Captain ${i + 1}`}
                                    value={c.name}
                                    onChange={e => update(i, { name: e.target.value })}
                                />
                            </td>
                            <td>
                                <input
                                    className="wiz-input"
                                    style={{ height: 36, fontSize: 14 }}
                                    type="number"
                                    min={1}
                                    value={c.purse}
                                    onChange={e => update(i, { purse: parseInt(e.target.value) || 0 })}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .count-pill {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--r-md);
                    border: 1px solid var(--hairline-strong);
                    background: var(--surface-elevated);
                    color: var(--body);
                    font-family: var(--font-display);
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                }
                .count-pill:hover { color: var(--ink); border-color: var(--muted); }
                .count-pill--active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: var(--on-primary);
                }
            `}</style>
        </div>
    );
}
