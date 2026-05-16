import { useState } from "react";
import { CAPTAIN_COLORS } from "@/store/auctionStore";
import type { NewAuctionCaptain, NewAuctionPlayer } from "@/types";
import type { WizardDetails } from "./NewAuction";
import "./StepReview.css";

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


        </div>
    );
}
