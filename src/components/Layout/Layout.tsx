import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {useAuthStore} from '@/store/authStore';
import './Layout.css';

type Theme = 'dark' | 'light';

export function Layout() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('ca-theme') as Theme) ?? 'dark'
    );
    const {user, role, signOut} = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ca-theme', theme);
    }, [theme]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login', {replace: true});
    };

    return (
        <div className="layout">
            <header className="layout__header">
                <div className="layout__brand">
                    <span className="layout__brand-name">Cricket Auction</span>
                </div>

                <nav className="layout__nav">
                    {/* Public */}
                    <NavLink to="/live"    className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Live</NavLink>
                    <NavLink to="/players" className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Players</NavLink>

                    {/* Captain + Admin */}
                    {(role === 'captain' || role === 'admin') && (
                        <NavLink to="/owners" className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Bid</NavLink>
                    )}

                    {/* Admin only */}
                    {role === 'admin' && (<>
                        <NavLink to="/live/admin" className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Admin</NavLink>
                        <NavLink to="/auction"    className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Record Sale</NavLink>
                        <NavLink to="/dashboard"  className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Dashboard</NavLink>
                        <NavLink to="/setup"      className={({isActive}) => `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`}>Setup</NavLink>
                    </>)}
                </nav>

                <div className="layout__right">
                    {user && (
                        <span className="layout__user-email">{user.email}</span>
                    )}
                    <button
                        className="layout__theme-toggle"
                        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                    {user ? (
                        <button className="layout__auth-btn" onClick={handleSignOut}>
                            Sign out
                        </button>
                    ) : (
                        <NavLink to="/login" className="layout__auth-btn">
                            Sign in
                        </NavLink>
                    )}
                </div>
            </header>
            <main className="layout__main">
                <Outlet />
            </main>
        </div>
    );
}
