import { CAPTAIN_COLORS } from '@/store/auctionStore';
import type { NewAuctionCaptain } from '@/types';
import './StepCaptains.css';

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
                <div className="count-pill-row">
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
                        <th className="col-idx">#</th>
                        <th>Captain Name</th>
                        <th className="col-purse">Purse (pts)</th>
                    </tr>
                </thead>
                <tbody>
                    {captains.map((c, i) => (
                        <tr key={i}>
                            <td className="wiz-idx">
                                <span
                                    className="captain-color-dot"
                                    style={{ background: CAPTAIN_COLORS[i % CAPTAIN_COLORS.length] }}
                                />
                            </td>
                            <td>
                                <input
                                    className="wiz-input wiz-input--sm"
                                    placeholder={`Captain ${i + 1}`}
                                    value={c.name}
                                    onChange={e => update(i, { name: e.target.value })}
                                />
                            </td>
                            <td>
                                <input
                                    className="wiz-input wiz-input--sm"
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


        </div>
    );
}
