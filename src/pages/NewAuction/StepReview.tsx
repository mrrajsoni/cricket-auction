import { useState } from "react";
import { CAPTAIN_COLORS } from "@/store/auctionStore";
import type { NewAuctionCaptain, NewAuctionPlayer } from "@/types";
import type { WizardDetails } from "./NewAuction";

interface StepReviewProps {
    details: WizardDetails;
    captains: NewAuctionCaptain[];
    players: NewAuctionPlayer[];
    activeGroups: string[];
    creating: boolean;
    createError: string | null;
    onCreate: () => void;
    onPlayersChange: (players: NewAuctionPlayer[]) => void;
}

export function StepReview({
    details,
    captains,
    players,
    activeGroups,
    creating,
    createError,
    onCreate,
    onPlayersChange,
}: StepReviewProps) {
    const [dragging, setDragging] = useState<number | null>(null);
    const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

    // Build group lists with original index preserved for DnD
    const playersByGroup = activeGroups.map((g) => ({
        group: g,
        entries: players
            .map((p, i) => ({ ...p, originalIndex: i }))
            .filter((p) => p.group === g),
    }));

    const handleDragStart = (originalIndex: number) =>
        setDragging(originalIndex);

    const handleDragOver = (e: React.DragEvent, group: string) => {
        e.preventDefault();
        setDragOverGroup(group);
    };

    const handleDrop = (e: React.DragEvent, targetGroup: string) => {
        e.preventDefault();
        if (dragging === null) return;
        const next = players.map((p, i) =>
            i === dragging ? { ...p, group: targetGroup } : p,
        );
        onPlayersChange(next);
        setDragging(null);
        setDragOverGroup(null);
    };

    const handleDragEnd = () => {
        setDragging(null);
        setDragOverGroup(null);
    };

    return (
        <div>
            <h2 className="wizard-step-title">Review & Create</h2>
            <p className="wizard-step-sub">
                Check everything below. Use <strong>Edit</strong> to jump back
                to any section, or drag players between groups.
            </p>

            {/* Summary stats bar */}
            <div className="review-stats-bar">
                <div className="review-stat">
                    <span className="review-stat__value review-stat__value--name">
                        {details.name}
                    </span>
                    <span className="review-stat__label">Auction</span>
                </div>
                <div className="review-stat">
                    <span className="review-stat__value">
                        {captains.length}
                    </span>
                    <span className="review-stat__label">Captains</span>
                </div>
                <div className="review-stat">
                    <span className="review-stat__value">{players.length}</span>
                    <span className="review-stat__label">Players</span>
                </div>
                <div className="review-stat">
                    <span className="review-stat__value">
                        {details.teamSize - 1}
                    </span>
                    <span className="review-stat__label">Bids / Team</span>
                </div>
                <div className="review-stat">
                    <span className="review-stat__value">
                        {activeGroups.length}
                    </span>
                    <span className="review-stat__label">Groups</span>
                </div>
            </div>

            <div className="review-columns">
                {/* Captains */}
                <div className="review-section">
                    <h3 className="review-section__title">Captains</h3>
                    <div className="review-list">
                        {captains.map((c, i) => (
                            <div key={i} className="review-captain-row">
                                <span
                                    className="review-captain-dot"
                                    style={{
                                        background:
                                            CAPTAIN_COLORS[
                                                i % CAPTAIN_COLORS.length
                                            ],
                                    }}
                                />
                                <span className="review-captain-name">
                                    {c.name || `Captain ${i + 1}`}
                                </span>
                                <span className="review-captain-purse">
                                    {c.purse} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Players by group with DnD */}
                <div className="review-section">
                    <div className="review-section__header">
                        <h3 className="review-section__title">
                            Players by Group
                        </h3>
                        <span className="review-dnd-hint">
                            drag to move between groups
                        </span>
                    </div>
                    {playersByGroup.map(({ group, entries }) => (
                        <div
                            key={group}
                            className={[
                                "review-group",
                                dragOverGroup === group
                                    ? "review-group--drag-over"
                                    : "",
                            ].join(" ")}
                            onDragOver={(e) => handleDragOver(e, group)}
                            onDragLeave={() => setDragOverGroup(null)}
                            onDrop={(e) => handleDrop(e, group)}
                        >
                            <div className="review-group__header">
                                <span className="review-group__label">
                                    Group {group}
                                </span>
                                <span className="review-group__count">
                                    {entries.length}
                                </span>
                            </div>
                            <div className="review-group__names">
                                {entries.map((p) => (
                                    <span
                                        key={p.originalIndex}
                                        className={[
                                            "review-player-name",
                                            "review-player-name--draggable",
                                            dragging === p.originalIndex
                                                ? "review-player-name--dragging"
                                                : "",
                                        ].join(" ")}
                                        draggable
                                        onDragStart={() =>
                                            handleDragStart(p.originalIndex)
                                        }
                                        onDragEnd={handleDragEnd}
                                    >
                                        {p.name || `Player`}
                                    </span>
                                ))}
                                {entries.length === 0 && (
                                    <span className="review-player-name review-player-name--empty">
                                        Drop players here
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {createError && <div className="review-error">{createError}</div>}

            <button
                className="review-create-btn"
                onClick={onCreate}
                disabled={creating}
            >
                {creating ? (
                    <span className="review-spinner" />
                ) : (
                    "Create Auction"
                )}
            </button>

            <style>{`
                .review-stats-bar {
                    display: flex;
                    background: var(--surface-card);
                    border: 1px solid var(--hairline-strong);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .review-stat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 20px 16px;
                    border-right: 1px solid var(--hairline);
                    text-align: center;
                }
                .review-stat:last-child { border-right: none; }
                .review-stat__value {
                    font-family: var(--font-display);
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--ink);
                    line-height: 1;
                    font-variant-numeric: tabular-nums;
                }
                .review-stat__value--name {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 0.01em;
                    word-break: break-word;
                    line-height: 1.2;
                }
                .review-stat__label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--muted);
                }
                .review-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 28px;
                }
                .review-section__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .review-section__title {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.09em;
                    text-transform: uppercase;
                    color: var(--muted);
                    margin-bottom: 8px;
                }
                .review-dnd-hint {
                    font-size: 10px;
                    color: var(--muted);
                    font-style: italic;
                }
                .review-list { display: flex; flex-direction: column; gap: 6px; }
                .review-captain-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: var(--surface-elevated);
                    border-radius: var(--r-sm);
                    border: 1px solid var(--hairline);
                }
                .review-captain-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .review-captain-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--ink);
                    flex: 1;
                }
                .review-captain-purse {
                    font-family: var(--font-display);
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--primary);
                    font-variant-numeric: tabular-nums;
                }
                .review-group { margin-bottom: 12px; }
                .review-group__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .review-group__label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--body);
                }
                .review-group__count {
                    font-size: 11px;
                    color: var(--muted);
                    background: var(--surface-elevated);
                    padding: 1px 7px;
                    border-radius: var(--r-pill);
                }
                .review-group__names {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                .review-group--drag-over {
                    background: var(--surface-elevated);
                    border-radius: var(--r-sm);
                    outline: 2px dashed var(--primary);
                    outline-offset: 2px;
                }
                .review-group--drag-over .review-group__names {
                    min-height: 32px;
                }
                .review-player-name {
                    font-size: 12px;
                    color: var(--body);
                    background: var(--surface-elevated);
                    border: 1px solid var(--hairline);
                    border-radius: var(--r-sm);
                    padding: 3px 8px;
                }
                .review-player-name--draggable {
                    cursor: grab;
                    user-select: none;
                    transition: opacity 0.15s, box-shadow 0.15s;
                }
                .review-player-name--draggable:hover {
                    border-color: var(--primary);
                    color: var(--ink);
                }
                .review-player-name--dragging {
                    opacity: 0.35;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                .review-player-name--empty {
                    color: var(--muted);
                    font-style: italic;
                    border-style: dashed;
                }
                .review-error {
                    background: var(--down-bg);
                    border: 1px solid var(--down);
                    border-radius: var(--r-sm);
                    color: var(--down);
                    font-size: 13px;
                    padding: 10px 14px;
                    margin-bottom: 16px;
                }
                .review-create-btn {
                    width: 100%;
                    background: var(--primary);
                    border: none;
                    border-radius: var(--r-md);
                    color: var(--on-primary);
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    padding: 18px 0;
                    cursor: pointer;
                    transition: background 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .review-create-btn:hover:not(:disabled) { background: var(--primary-active); }
                .review-create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .review-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0,0,0,0.25);
                    border-top-color: var(--on-primary);
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
