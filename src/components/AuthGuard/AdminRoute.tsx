import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Wraps routes that require admin role. Redirects to /login if not authenticated or not admin. */
export function AdminRoute() {
    const { user, role, loading } = useAuthStore();

    if (loading) return null;
    if (!user || role !== 'admin') return <Navigate to="/login" replace />;
    return <Outlet />;
}
