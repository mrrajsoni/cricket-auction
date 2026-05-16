import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuctionStore } from '@/store/auctionStore';
import type { NewAuctionCaptain, NewAuctionPlayer } from '@/types';
import { StepDetails } from './StepDetails';
import { StepCaptains } from './StepCaptains';
import { StepPlayers } from './StepPlayers';
import { StepReview } from './StepReview';
import './NewAuction.css';

const STEP_LABELS = ['Details', 'Captains', 'Players', 'Review'];

export interface WizardDetails {
    name: string;
    defaultPurse: number;
    teamSize: number;
    numGroups: number;
}

export function NewAuction() {
    const { createAuction, error } = useAuctionStore();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [maxStep, setMaxStep] = useState(1);
    const [creating, setCreating] = useState(false);

    const [details, setDetails] = useState<WizardDetails>({
        name: '',
        defaultPurse: 2200,
        teamSize: 11,
        numGroups: 4,
    });

    const [captains, setCaptains] = useState<NewAuctionCaptain[]>([
        { name: '', purse: 2200 },
        { name: '', purse: 2200 },
    ]);

    const [players, setPlayers] = useState<NewAuctionPlayer[]>([
        { name: '', group: '1' },
    ]);

    const activeGroups = Array.from({ length: details.numGroups }, (_, i) => String(i + 1));

    const stepValid = [
        details.name.trim() !== '' && details.defaultPurse > 0 && details.teamSize >= 2 && details.numGroups >= 1,
        captains.length >= 2 && captains.every(c => c.name.trim() !== '' && c.purse > 0),
        players.length >= 1 && players.every(p => p.name.trim() !== ''),
        true,
    ];

    const handleNext = () => {
        const next = Math.min(step + 1, 4);
        setStep(next);
        setMaxStep(m => Math.max(m, next));
    };
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    const handleGoToStep = (num: number) => { if (num <= maxStep) setStep(num); };

    const handleCreate = async () => {
        setCreating(true);
        await createAuction({ ...details, captains, players });
        setCreating(false);
        if (!error) navigate('/live/admin');
    };

    return (
        <div className="new-auction">
            {/* Progress bar */}
            <div className="wizard-progress">
                {STEP_LABELS.map((label, i) => {
                    const num = i + 1;
                    const done = num < step;
                    const active = num === step;
                    const reachable = num <= maxStep && !active;
                    return (
                        <div key={label} className="wizard-progress__item">
                            <button
                                className={[
                                    'wizard-step-dot',
                                    done ? 'wizard-step-dot--done' : '',
                                    active ? 'wizard-step-dot--active' : '',
                                    reachable ? 'wizard-step-dot--reachable' : '',
                                ].join(' ')}
                                onClick={() => handleGoToStep(num)}
                                disabled={!reachable && !active}
                                aria-current={active ? 'step' : undefined}
                            >
                                {done ? '✓' : num}
                            </button>
                            <span
                                className={[
                                    'wizard-step-label',
                                    active ? 'wizard-step-label--active' : '',
                                    reachable ? 'wizard-step-label--reachable' : '',
                                ].join(' ')}
                                onClick={() => handleGoToStep(num)}
                            >
                                {label}
                            </span>
                            {i < STEP_LABELS.length - 1 && (
                                <div className={`wizard-step-line ${done ? 'wizard-step-line--done' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step content */}
            <div className="wizard-body">
                {step === 1 && (
                    <StepDetails details={details} onChange={setDetails} />
                )}
                {step === 2 && (
                    <StepCaptains
                        captains={captains}
                        defaultPurse={details.defaultPurse}
                        onChange={setCaptains}
                    />
                )}
                {step === 3 && (
                    <StepPlayers
                        players={players}
                        activeGroups={activeGroups}
                        onChange={setPlayers}
                        onNumGroupsChange={n => setDetails(d => ({ ...d, numGroups: n }))}
                    />
                )}
                {step === 4 && (
                    <StepReview
                        details={details}
                        captains={captains}
                        players={players}
                        activeGroups={activeGroups}
                        creating={creating}
                        createError={error}
                        onCreate={handleCreate}
                        onPlayersChange={setPlayers}
                    />
                )}
            </div>

            {/* Navigation */}
            {step < 4 && (
                <div className="wizard-nav">
                    <button
                        className="wizard-btn wizard-btn--back"
                        onClick={handleBack}
                        disabled={step === 1}
                    >
                        Back
                    </button>
                    <button
                        className="wizard-btn wizard-btn--next"
                        onClick={handleNext}
                        disabled={!stepValid[step - 1]}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
