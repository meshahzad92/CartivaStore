import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginModal({ isOpen, onClose }) {
    const { login } = useAdminAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) { setError('Please enter email and password'); return; }
        setLoading(true);
        try {
            await login(form.email, form.password);
            onClose();
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally { setLoading(false); }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Backdrop */}
            <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.5)' }} onClick={onClose} />

            {/* Card */}
            <div
                className="relative w-full max-w-sm overflow-hidden"
                style={{
                    background: 'white',
                    borderRadius: 24,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                    animation: 'loginFadeIn 0.25s ease-out',
                }}
            >
                {/* Top indigo bar */}
                <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)' }} />

                <div style={{ padding: '36px 32px 32px' }}>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 cursor-pointer transition-colors rounded-lg p-1 hover:bg-gray-100"
                        style={{ color: '#94A3B8' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                        >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                                <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-bold" style={{ color: '#1E293B' }}>Admin Login</p>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>Cartiva Store management</p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="flex items-start gap-2 mb-4 rounded-xl px-3 py-2.5 text-sm"
                            style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
                        >
                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="admin@cartiva.com"
                                autoComplete="email"
                                className="w-full px-4 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                style={{ border: '1.5px solid #E5E7EB', background: '#F8FAFC', color: '#1E293B' }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPwd ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    style={{ border: '1.5px solid #E5E7EB', background: '#F8FAFC', color: '#1E293B' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: '#94A3B8' }}
                                >
                                    {showPwd ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : 'Login to Dashboard'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes loginFadeIn {
                    from { opacity: 0; transform: scale(0.96) translateY(-8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
}
