import {NavLink, Outlet} from 'react-router-dom';
import {useState, useEffect} from 'react';
import './Layout.css';

type Theme = 'dark' | 'light';

const NAV_ITEMS = [
    {to: '/live', label: 'Live'},
    {to: '/owners', label: 'Owners'},
    {to: '/auction', label: 'Record Sale'},
    {to: '/dashboard', label: 'Dashboard'},
    {to: '/players', label: 'Players'},
    {to: '/setup', label: 'Setup'},
];

export function Layout() {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('ca-theme') as Theme) ?? 'dark'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ca-theme', theme);
    }, [theme]);

    return (
        <div className="layout">
            <header className="layout__header">
                <div className="layout__brand">
                    <span className="layout__brand-name">Cricket Auction</span>
                </div>
                <nav className="layout__nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({isActive}) =>
                                `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    className="layout__theme-toggle"
                    onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
            </header>
            <main className="layout__main">
                <Outlet />
            </main>
        </div>
    );
}
