import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Wraps routes accessible to both captains and admins. Redirects to /login if unauthenticated. */
export function CaptainRoute() {
    const { user, role, loading } = useAuthStore();

    if (loading) return null;
    if (!user || (role !== 'captain' && role !== 'admin')) return <Navigate to="/login" replace />;
    return <Outlet />;
}
