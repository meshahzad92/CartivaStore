import { useState, memo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoginModal from '../admin/AdminLoginModal';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
];

function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const { cartCount } = useCart();
    const { admin } = useAdminAuth();

    return (
        <>
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">C</span>
                            </div>
                            <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                Cartiva
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                                aria-label="Shopping cart"
                            >
                                <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Admin user icon */}
                            {admin ? (
                                <Link
                                    to="/admin/dashboard"
                                    className="p-2 rounded-lg hover:bg-indigo-50 transition-colors relative"
                                    aria-label="Admin Panel"
                                    title="Admin Panel"
                                >
                                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                    aria-label="Admin Login"
                                    title="Admin Login"
                                >
                                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </button>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-border bg-background">
                        <nav className="flex flex-col py-2 px-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <AdminLoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}

export default memo(Header);
