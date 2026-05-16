import { useState } from 'react';
import { useAuctionStore } from '@/store/auctionStore';
import { useAuthStore } from '@/store/authStore';
import './CaptainManagement.css';

export function CaptainManagement() {
    const { captains, auctionId } = useAuctionStore();
    const { sendCaptainInvite, error } = useAuthStore();

    const [emailMap, setEmailMap] = useState<Record<string, string>>({});
    const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
    const [sendingId, setSendingId] = useState<string | null>(null);

    const handleSend = async (captainId: string) => {
        const email = emailMap[captainId]?.trim();
        if (!email || !auctionId) return;
        setSendingId(captainId);
        await sendCaptainInvite(email, captainId, auctionId);
        setSendingId(null);
        if (!useAuthStore.getState().error) {
            setSentMap(m => ({ ...m, [captainId]: true }));
        }
    };

    return (
        <div className="cap-mgmt">
            <div className="cap-mgmt__header">
                <h2 className="cap-mgmt__title">Captain Invites</h2>
                <p className="cap-mgmt__sub">
                    Enter each captain's email and send them a one-click magic link to join as a bidder.
                </p>
            </div>

            {error && <p className="cap-mgmt__error">{error}</p>}

            <div className="cap-mgmt__list">
                {captains.map((captain) => (
                    <div key={captain.id} className="cap-row">
                        <div className="cap-row__identity">
                            <span
                                className="cap-row__dot"
                                style={{ background: captain.color }}
                            />
                            <span className="cap-row__name">{captain.name}</span>
                        </div>

                        {sentMap[captain.id] ? (
                            <span className="cap-row__sent">Invite sent</span>
                        ) : (
                            <div className="cap-row__invite">
                                <input
                                    className="cap-row__input"
                                    type="email"
                                    placeholder="captain@email.com"
                                    value={emailMap[captain.id] ?? ''}
                                    onChange={e =>
                                        setEmailMap(m => ({ ...m, [captain.id]: e.target.value }))
                                    }
                                    onKeyDown={e => e.key === 'Enter' && handleSend(captain.id)}
                                />
                                <button
                                    className="cap-row__btn"
                                    onClick={() => handleSend(captain.id)}
                                    disabled={!emailMap[captain.id]?.trim() || sendingId === captain.id}
                                >
                                    {sendingId === captain.id ? (
                                        <span className="cap-row__spinner" />
                                    ) : (
                                        'Send Invite'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {captains.length === 0 && (
                    <p className="cap-mgmt__empty">No captains in this auction yet.</p>
                )}
            </div>
        </div>
    );
}
