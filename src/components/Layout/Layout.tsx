import {NavLink, Outlet} from 'react-router-dom';
import './Layout.css';

const NAV_ITEMS = [
    {to: '/auction', label: 'Auction Room'},
    {to: '/dashboard', label: 'Dashboard'},
    {to: '/players', label: 'Players'},
];

export function Layout() {
    return (
        <div className="layout">
            <header className="layout__header">
                <div className="layout__brand">
                    <span className="layout__brand-icon">🏏</span>
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
            </header>
            <main className="layout__main">
                <Outlet />
            </main>
        </div>
    );
}
