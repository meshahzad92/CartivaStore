import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const navItems = [
    {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
            </svg>
        ),
    },
    {
        to: '/admin/orders',
        label: 'Orders',
        icon: (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children }) {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#f4f5f7] flex">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ───────────────────────────────────────────── */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-[220px] bg-[#0f1117] flex flex-col z-40
                    transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 h-[60px] border-b border-white/[0.06] shrink-0">
                    <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                            <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white leading-tight">Cartiva</p>
                        <p className="text-[10px] text-white/40 truncate">Admin</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-0.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative
                                ${isActive
                                    ? 'text-white bg-white/[0.08]'
                                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Left accent bar */}
                                    <span
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-150
                                            ${isActive ? 'h-5 bg-indigo-500' : 'h-0'}`}
                                    />
                                    <span className={`${isActive ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/70'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Admin info + Logout */}
                <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] space-y-0.5 shrink-0">
                    <div className="px-3 py-2 mb-1">
                        <p className="text-[11px] text-white/30 truncate">{admin}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-[220px]">

                {/* Top bar */}
                <header className="sticky top-0 z-20 h-[60px] bg-white border-b border-gray-200/80 flex items-center gap-3 px-5">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="ml-auto text-xs text-gray-400">
                        {new Date().toLocaleDateString('en-PK', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
