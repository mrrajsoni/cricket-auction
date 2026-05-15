import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {Layout} from '@/components/Layout/Layout';
import {AuctionRoom} from '@/pages/AuctionRoom/AuctionRoom';
import {Dashboard} from '@/pages/Dashboard/Dashboard';
import {PlayerPool} from '@/pages/PlayerPool/PlayerPool';
import {CaptainProfile} from '@/pages/CaptainProfile/CaptainProfile';
import {useAuctionStore} from '@/store/auctionStore';
import './styles/app-init.css';

function AppInit({children}: {children: React.ReactNode}) {
    const {initialize, loading, error} = useAuctionStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (loading) {
        return (
            <div className="app-init">
                <div className="app-init__spinner" />
                <p className="app-init__text">Loading auction data…</p>
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
                    <Route element={<Layout />}>
                        <Route index element={<Navigate to="/auction" replace />} />
                        <Route path="/auction" element={<AuctionRoom />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/players" element={<PlayerPool />} />
                        <Route path="/captain/:captainId" element={<CaptainProfile />} />
                    </Route>
                </Routes>
            </AppInit>
        </BrowserRouter>
    );
}
