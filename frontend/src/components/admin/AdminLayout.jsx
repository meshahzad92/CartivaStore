import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
    LayoutDashboard, ClipboardList, Truck, LogOut, Menu, X,
    Bell, Search, ChevronRight, Settings,
} from 'lucide-react';

const NAV_ITEMS = [
    {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        to: '/admin/orders',
        label: 'Orders',
        icon: ClipboardList,
    },
    {
        to: '/admin/postex',
        label: 'Postex',
        icon: Truck,
        accent: '#FF6B00',
    },
    {
        to: '/admin/settings',
        label: 'Settings',
        icon: Settings,
        accent: '#6366F1',
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

    // Initials avatar from admin email
    const initials = admin
        ? admin.split('@')[0].slice(0, 2).toUpperCase()
        : 'AD';

    return (
        <div className="min-h-screen flex" style={{ background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ─────────────────────────────────────────────── */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-[240px] flex flex-col z-40
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
                style={{ background: '#1E293B' }}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 h-[68px] border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                            <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-white tracking-tight">Cartiva</p>
                        <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Admin Panel</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Main Menu
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const accentColor = item.accent ?? '#6366f1';
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${isActive
                                        ? 'text-white'
                                        : 'hover:text-white'
                                    }`
                                }
                                style={({ isActive }) => isActive
                                    ? { background: `${accentColor}22`, color: 'white' }
                                    : { color: 'rgba(255,255,255,0.5)' }
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active left bar */}
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                                style={{ background: accentColor }}
                                            />
                                        )}
                                        <span
                                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive ? 'shadow-lg' : ''}`}
                                            style={isActive ? { background: `${accentColor}33` } : {}}
                                        >
                                            <Icon size={16} style={{ color: isActive ? accentColor : 'inherit' }} />
                                        </span>
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <ChevronRight size={13} style={{ color: accentColor, opacity: 0.7 }} />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="shrink-0 px-3 pb-5 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                        >
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white truncate">Admin</p>
                            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{admin}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer hover:bg-red-500/10 hover:text-red-400"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ─────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-[240px]">

                {/* Top bar */}
                <header
                    className="sticky top-0 z-20 h-[68px] flex items-center gap-4 px-6 border-b"
                    style={{ background: 'white', borderColor: '#E5E7EB' }}
                >
                    {/* Hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search */}
                    <div className="flex-1 max-w-sm">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders, customers…"
                                className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                                style={{ borderColor: '#E5E7EB', background: '#F8FAFC', color: '#111827' }}
                            />
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {/* Date */}
                        <span className="hidden sm:block text-xs font-medium" style={{ color: '#6B7280' }}>
                            {new Date().toLocaleDateString('en-PK', {
                                weekday: 'short', month: 'short', day: 'numeric',
                            })}
                        </span>

                        {/* Bell */}
                        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" style={{ color: '#6B7280' }}>
                            <Bell size={18} />
                        </button>

                        {/* Avatar */}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                        >
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto" style={{ padding: '28px 28px' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
