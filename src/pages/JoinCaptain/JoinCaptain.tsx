import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './JoinCaptain.css';

/**
 * Landing page for captain magic-link invites.
 * Supabase sets the session before redirecting here.
 * This page claims the invite and creates the captain profile.
 */
export function JoinCaptain() {
    const { claimInvite, error, user, loading } = useAuthStore();
    const navigate = useNavigate();
    const [claiming, setClaiming] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Already a captain — go straight to bidding
        const { role } = useAuthStore.getState();
        if (role === 'captain') {
            navigate('/owners', { replace: true });
            return;
        }

        if (!user) return; // waiting for session

        const claim = async () => {
            setClaiming(true);
            await claimInvite();
            setClaiming(false);

            if (!useAuthStore.getState().error) {
                setDone(true);
                setTimeout(() => navigate('/owners', { replace: true }), 1500);
            }
        };

        claim();
    }, [user, loading]);

    return (
        <div className="join-page">
            <div className="join-card">
                <div className="join-card__brand">Cricket Auction</div>

                {!user && !loading && (
                    <>
                        <h2 className="join-card__title">Invalid or expired link</h2>
                        <p className="join-card__sub">
                            Ask your auction admin to resend your invite.
                        </p>
                    </>
                )}

                {(loading || claiming) && (
                    <>
                        <div className="join-spinner" />
                        <p className="join-card__sub">Setting up your account…</p>
                    </>
                )}

                {done && (
                    <>
                        <div className="join-check">✓</div>
                        <h2 className="join-card__title">You're in!</h2>
                        <p className="join-card__sub">Redirecting to the bidding page…</p>
                    </>
                )}

                {error && !claiming && (
                    <>
                        <h2 className="join-card__title">Something went wrong</h2>
                        <p className="join-card__error">{error}</p>
                        <p className="join-card__sub">Ask your admin to resend the invite.</p>
                    </>
                )}
            </div>
        </div>
    );
}
