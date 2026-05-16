import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {Layout} from '@/components/Layout/Layout';
import {AuctionRoom} from '@/pages/AuctionRoom/AuctionRoom';
import {Dashboard} from '@/pages/Dashboard/Dashboard';
import {PlayerPool} from '@/pages/PlayerPool/PlayerPool';
import {CaptainProfile} from '@/pages/CaptainProfile/CaptainProfile';
import {LiveAuction} from '@/pages/LiveAuction/LiveAuction';
import {OwnerBid} from '@/pages/OwnerBid/OwnerBid';
import {NewAuction} from '@/pages/NewAuction/NewAuction';
import {Login} from '@/pages/Login/Login';
import {Signup} from '@/pages/Signup/Signup';
import {JoinCaptain} from '@/pages/JoinCaptain/JoinCaptain';
import {AdminRoute} from '@/components/AuthGuard/AdminRoute';
import {CaptainRoute} from '@/components/AuthGuard/CaptainRoute';
import {useAuctionStore} from '@/store/auctionStore';
import {useAuthStore} from '@/store/authStore';
import './styles/app-init.css';

function AppInit({children}: {children: React.ReactNode}) {
    const {initialize, loading: auctionLoading, error} = useAuctionStore();
    const {loadSession, loading: authLoading} = useAuthStore();

    useEffect(() => {
        // Load auth session first, then initialize auction data
        loadSession().then(() => initialize());
    }, []);

    if (authLoading || auctionLoading) {
        return (
            <div className="app-init">
                <div className="app-init__spinner" />
                <p className="app-init__text">Loading…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-init app-init--error">
                <span className="app-init__icon">⚠️</span>
                <p className="app-init__text">{error}</p>
                <p className="app-init__sub">Check your .env.local Supabase credentials and run schema.sql.</p>
                <button className="app-init__retry" onClick={initialize}>Retry</button>
            </div>
        );
    }

    return <>{children}</>;
}

export function App() {
    return (
        <BrowserRouter>
            <AppInit>
                <Routes>
                    {/* ── Auth pages (no layout chrome) ──────────────────────── */}
                    <Route path="/login"  element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/join"   element={<JoinCaptain />} />

                    {/* ── App pages (with layout chrome) ─────────────────────── */}
                    <Route element={<Layout />}>
                        <Route index element={<Navigate to="/live" replace />} />

                        {/* Public — no auth required */}
                        <Route path="/live"              element={<LiveAuction isAdmin={false} />} />
                        <Route path="/players"           element={<PlayerPool />} />
                        <Route path="/captain/:captainId" element={<CaptainProfile />} />

                        {/* Captain + Admin */}
                        <Route element={<CaptainRoute />}>
                            <Route path="/owners" element={<OwnerBid />} />
                        </Route>

                        {/* Admin only */}
                        <Route element={<AdminRoute />}>
                            <Route path="/live/admin" element={<LiveAuction isAdmin={true} />} />
                            <Route path="/auction"    element={<AuctionRoom />} />
                            <Route path="/dashboard"  element={<Dashboard />} />
                            <Route path="/setup"      element={<NewAuction />} />
                        </Route>
                    </Route>
                </Routes>
            </AppInit>
        </BrowserRouter>
    );
}
