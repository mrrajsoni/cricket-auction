import type { WizardDetails } from './NewAuction';
import './StepDetails.css';

interface StepDetailsProps {
    details: WizardDetails;
    onChange: (d: WizardDetails) => void;
}

export function StepDetails({ details, onChange }: StepDetailsProps) {
    const set = (patch: Partial<WizardDetails>) => onChange({ ...details, ...patch });

    return (
        <div>
            <h2 className="wizard-step-title">Auction Details</h2>
            <p className="wizard-step-sub">Basic settings that apply to the entire auction.</p>

            <div className="wiz-field">
                <label className="wiz-label">Auction Name</label>
                <input
                    className="wiz-input"
                    placeholder="e.g. Summer T20 2026"
                    value={details.name}
                    onChange={e => set({ name: e.target.value })}
                    autoFocus
                />
            </div>

            <div className="details-grid">
                <div className="wiz-field">
                    <label className="wiz-label">Default Purse per Captain (pts)</label>
                    <input
                        className="wiz-input"
                        type="number"
                        min={1}
                        value={details.defaultPurse}
                        onChange={e => set({ defaultPurse: parseInt(e.target.value) || 0 })}
                    />
                    <span className="wiz-helper">Pre-fills every captain's purse in the next step</span>
                </div>

                <div className="wiz-field">
                    <label className="wiz-label">Team Size</label>
                    <input
                        className="wiz-input"
                        type="number"
                        min={2}
                        max={25}
                        value={details.teamSize}
                        onChange={e => set({ teamSize: parseInt(e.target.value) || 0 })}
                    />
                    <span className="wiz-helper">
                        Includes captain — each team bids for{' '}
                        <strong>{Math.max(0, details.teamSize - 1)}</strong> players
                    </span>
                </div>
            </div>

            <div className="wiz-field">
                <label className="wiz-label">Number of Groups</label>
                <input
                    type="number"
                    min={1}
                    max={20}
                    className="wiz-input wiz-input--narrow"
                    value={details.numGroups}
                    onChange={e => set({ numGroups: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <span className="wiz-helper">
                    Groups will be named <strong>Group 1</strong>, <strong>Group 2</strong> … <strong>Group {details.numGroups}</strong>
                </span>
            </div>
        </div>
    );
}
