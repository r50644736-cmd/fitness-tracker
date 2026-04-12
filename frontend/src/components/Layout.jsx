import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Layout() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        api.getProfile()
            .then(res => setUsername(res.data.username || ''))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const sideNavItems = [
        { path: '/',              icon: 'grid_view',      label: 'Overview'     },
        { path: '/performance',   icon: 'show_chart',     label: 'Performance'  },
        { path: '/nutrition',     icon: 'restaurant',     label: 'Nutrition'    },
        { path: '/bio-metrics',   icon: 'monitor_heart',  label: 'Bio-Metrics'  },
        { path: '/program',       icon: 'fitness_center', label: 'Program'      },
        { path: '/archive',       icon: 'history',        label: 'Archive'      },
    ];

    return (
        <div className="dark bg-background text-on-background min-h-screen flex font-body selection:bg-primary selection:text-on-primary">

            {/* ── Desktop Left Sidebar ───────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col w-[240px] h-screen sticky top-0 bg-surface-container-lowest border-r border-outline-variant/20 p-6 z-50 flex-shrink-0">
                {/* Brand */}
                <div className="mb-10">
                    <span className="font-headline font-black tracking-tighter text-xl italic text-primary uppercase">
                        KINETIC CYBERNETICS
                    </span>
                </div>

                {/* Active User Badge */}
                <div className="mb-8 pl-3 border-l-4 border-primary/60">
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-label font-bold">Active Protocol</p>
                    <p className="text-on-surface font-headline font-bold text-sm tracking-tight truncate mt-0.5">
                        {username ? username.toUpperCase() : 'LOADING...'}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {sideNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 font-headline uppercase text-[11px] font-bold tracking-widest transition-all duration-200 ${
                                    isActive
                                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 border-l-2 border-transparent'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Links */}
                <div className="mt-auto space-y-1 pt-6 border-t border-outline-variant/20">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 font-headline uppercase text-[11px] font-bold tracking-widest transition-all duration-200 ${
                                isActive
                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 border-l-2 border-transparent'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                        Profile
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error font-headline text-[11px] font-bold tracking-widest uppercase transition-colors border-l-2 border-transparent"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ───────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">

                {/* Top Header */}
                <header className="w-full h-16 sticky top-0 z-[40] bg-background/80 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-4 lg:px-8">
                    {/* Mobile: Brand */}
                    <div className="lg:hidden flex items-center gap-3">
                        <span className="font-headline font-black tracking-tighter text-lg italic text-primary uppercase">KINETIC</span>
                    </div>

                    {/* Desktop: Page context hint */}
                    <div className="hidden lg:flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">monitoring</span>
                        <span className="font-label text-[9px] uppercase tracking-[0.2em] font-bold">
                            AI Fitness Tracker — Neural Dashboard
                        </span>
                    </div>

                    {/* Right: Profile avatar */}
                    <div className="flex items-center gap-4">
                        <NavLink
                            to="/profile"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            title="Go to Profile"
                        >
                            <div className="w-8 h-8 rounded-sm bg-primary/20 border border-primary/40 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                            </div>
                            <span className="hidden lg:block font-label text-[10px] uppercase tracking-widest text-on-surface-variant truncate max-w-[100px]">
                                {username || '...'}
                            </span>
                        </NavLink>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8 flex-1 max-w-[1440px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* ── Mobile Bottom Navigation ───────────────────────────────────── */}
            <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface-container-highest/90 backdrop-blur-xl border-t border-outline-variant/30">
                <div className="flex justify-around items-center h-16 px-1">
                    {sideNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center py-2 px-2 rounded-sm transition-colors active:scale-90 duration-200 flex-1 ${
                                    isActive
                                    ? 'text-primary'
                                    : 'text-on-surface-variant hover:text-primary'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="font-label text-[7px] uppercase tracking-wider mt-0.5 truncate w-full text-center">
                                {item.label.split('-')[0]}
                            </span>
                        </NavLink>
                    ))}
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center py-2 px-2 rounded-sm transition-colors flex-1 ${
                                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        <span className="font-label text-[7px] uppercase tracking-wider mt-0.5">Profile</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
}
