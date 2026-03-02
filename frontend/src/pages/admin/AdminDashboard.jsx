import { useState, useEffect, useCallback, memo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import NewOrderToast from '../../components/admin/NewOrderToast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNewOrderNotifier } from '../../hooks/useNewOrderNotifier';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const STAT_CARDS = [
    {
        key: 'total_today', label: "Today's Orders",
        iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500',
        valueCls: 'text-indigo-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        key: 'pending', label: 'Pending',
        iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
        valueCls: 'text-amber-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'confirmed', label: 'Confirmed',
        iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
        valueCls: 'text-blue-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'fulfilled', label: 'Fulfilled',
        iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
        valueCls: 'text-emerald-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
    },
    {
        key: 'cancelled', label: 'Cancelled',
        iconBg: 'bg-red-50', iconColor: 'text-red-500',
        valueCls: 'text-red-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'on_hold', label: 'On Hold',
        iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
        valueCls: 'text-orange-700',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

function StatCard({ card, value, loading }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                <div className="w-5 h-5">{card.icon}</div>
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                {loading ? (
                    <div className="h-7 w-10 bg-gray-100 animate-pulse rounded mt-1" />
                ) : (
                    <p className={`text-2xl font-bold mt-0.5 ${card.valueCls}`}>{value ?? 0}</p>
                )}
            </div>
        </div>
    );
}

function AdminDashboard() {
    const { token, authFetch } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/stats`);
            if (!res.ok) return;
            setStats(await res.json());
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleNewOrder = useCallback(() => {
        setToast(true);
        fetchStats();
        setTimeout(() => setToast(false), 4000);
    }, [fetchStats]);

    useNewOrderNotifier({ token, onNewOrder: handleNewOrder });

    return (
        <AdminLayout>
            <NewOrderToast show={toast} />

            {/* Page header */}
            <div className="mb-7">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-400 mt-0.5">Store overview</p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STAT_CARDS.map((card) => (
                    <StatCard
                        key={card.key}
                        card={card}
                        value={stats?.[card.key]}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Real-time indicator */}
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time order alerts active · polling every 7 s
            </div>
        </AdminLayout>
    );
}

export default memo(AdminDashboard);
