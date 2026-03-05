import { useState, useEffect, useCallback, memo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    ShoppingBag, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import NewOrderToast from '../../components/admin/NewOrderToast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNewOrderNotifier } from '../../hooks/useNewOrderNotifier';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Design tokens ────────────────────────────────────────────────────────────
const STAT_CARDS = [
    {
        key: 'total_today',
        label: "Today's Orders",
        icon: ShoppingBag,
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        bg: '#EEF2FF',
        iconColor: '#6366f1',
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: Clock,
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
        bg: '#FFFBEB',
        iconColor: '#F59E0B',
    },
    {
        key: 'fulfilled',
        label: 'Fulfilled',
        icon: CheckCircle,
        gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        bg: '#ECFDF5',
        iconColor: '#10B981',
    },
    {
        key: 'cancelled',
        label: 'Cancelled',
        icon: XCircle,
        gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        bg: '#FEF2F2',
        iconColor: '#EF4444',
    },
];

const DONUT_COLORS = {
    pending: '#F59E0B',
    confirmed: '#6366f1',
    on_hold: '#F97316',
    fulfilled: '#10B981',
    cancelled: '#EF4444',
};

// ── Custom tooltip for bar chart ─────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-3 py-2 shadow-lg text-sm"
            style={{ background: '#1E293B', color: 'white', minWidth: 110 }}
        >
            <p className="font-semibold text-indigo-300 text-xs mb-0.5">{label}</p>
            <p className="text-white font-bold text-base">{payload[0].value} orders</p>
        </div>
    );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ card, value, loading }) {
    const Icon = card.icon;
    return (
        <div
            className="bg-white rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-default"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
        >
            <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: card.bg }}
            >
                <Icon size={20} style={{ color: card.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium mb-1" style={{ color: '#94A3B8' }}>{card.label}</p>
                {loading ? (
                    <div className="h-8 w-14 bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                    <p className="text-3xl font-bold" style={{ color: '#1E293B' }}>{value ?? 0}</p>
                )}
            </div>
        </div>
    );
}

// ── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ text, sub, color }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
            <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: color }} />
            <div>
                <p className="text-[13px] font-medium" style={{ color: '#1E293B' }}>{text}</p>
                <p className="text-[11px]" style={{ color: '#94A3B8' }}>{sub}</p>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
function AdminDashboard() {
    const { token, authFetch } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeklyLoading, setWeeklyLoading] = useState(true);
    const [toast, setToast] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await authFetch(`${API_BASE}/admin/stats`);
            if (!res.ok) return;
            setStats(await res.json());
        } catch { /* silent */ } finally { setLoading(false); }
    }, [authFetch]);

    const fetchWeekly = useCallback(async () => {
        setWeeklyLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/analytics/weekly`);
            if (!res.ok) return;
            setWeekly(await res.json());
        } catch { /* silent */ } finally { setWeeklyLoading(false); }
    }, [authFetch]);

    useEffect(() => { fetchStats(); fetchWeekly(); }, [fetchStats, fetchWeekly]);

    const handleNewOrder = useCallback(() => {
        setToast(true);
        fetchStats();
        fetchWeekly();
        setTimeout(() => setToast(false), 4000);
    }, [fetchStats, fetchWeekly]);

    useNewOrderNotifier({ token, onNewOrder: handleNewOrder });

    // Donut chart data from stats
    const donutData = stats
        ? [
            { name: 'Pending', value: stats.pending, color: DONUT_COLORS.pending },
            { name: 'Confirmed', value: stats.confirmed, color: DONUT_COLORS.confirmed },
            { name: 'On Hold', value: stats.on_hold, color: DONUT_COLORS.on_hold },
            { name: 'Fulfilled', value: stats.fulfilled, color: DONUT_COLORS.fulfilled },
            { name: 'Cancelled', value: stats.cancelled, color: DONUT_COLORS.cancelled },
        ].filter(d => d.value > 0)
        : [];

    const totalOrders = donutData.reduce((s, d) => s + d.value, 0);

    // Bar chart data
    const barData = weekly?.days?.map(d => ({ name: d.date, orders: d.count })) ?? [];

    // Admin first name
    const adminName = 'Admin';

    return (
        <AdminLayout>
            <NewOrderToast show={toast} />

            {/* ── Greeting ── */}
            <div className="mb-7">
                <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>
                    Hello, <span style={{ color: '#6366f1' }}>{adminName}</span>
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                    Here's what's happening today
                </p>
            </div>

            {/* Two-column layout: main + right panel */}
            <div className="flex gap-6">

                {/* ── Left / center ── */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {STAT_CARDS.map(card => (
                            <StatCard key={card.key} card={card} value={stats?.[card.key]} loading={loading} />
                        ))}
                    </div>

                    {/* Bar chart — orders per day */}
                    <div
                        className="bg-white rounded-2xl p-6"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-[15px] font-bold" style={{ color: '#1E293B' }}>
                                    Orders — Last 7 Days
                                </h2>
                                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Daily order volumes</p>
                            </div>
                            {!weeklyLoading && weekly && (
                                <div className="flex gap-5">
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Avg / Day</p>
                                        <p className="text-xl font-bold" style={{ color: '#6366f1' }}>{weekly.average}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Week Total</p>
                                        <p className="text-xl font-bold" style={{ color: '#1E293B' }}>{weekly.total}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {weeklyLoading ? (
                            <div className="h-44 flex items-center justify-center">
                                <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={barData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F1F5F9', radius: 6 }} />
                                    <Bar
                                        dataKey="orders"
                                        fill="url(#barGradient)"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                    />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Status donut + table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Donut */}
                        <div
                            className="bg-white rounded-2xl p-6"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-[15px] font-bold mb-4" style={{ color: '#1E293B' }}>Status Breakdown</h2>

                            {loading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse" />
                                </div>
                            ) : donutData.length === 0 ? (
                                <p className="text-sm text-center py-10" style={{ color: '#94A3B8' }}>No orders yet</p>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <PieChart width={140} height={140}>
                                            <Pie
                                                data={donutData}
                                                cx={65}
                                                cy={65}
                                                innerRadius={44}
                                                outerRadius={64}
                                                dataKey="value"
                                                strokeWidth={2}
                                                stroke="white"
                                            >
                                                {donutData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                        {/* Center label */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{totalOrders}</p>
                                            <p className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>Total</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        {donutData.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                                                    <span style={{ color: '#64748B' }}>{d.name}</span>
                                                </div>
                                                <span className="font-semibold" style={{ color: '#1E293B' }}>{d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick stats table */}
                        <div
                            className="bg-white rounded-2xl p-6"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-[15px] font-bold mb-4" style={{ color: '#1E293B' }}>At a Glance</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Today\'s Orders', value: stats?.total_today ?? '—', color: '#6366f1' },
                                    { label: 'Pending Review', value: stats?.pending ?? '—', color: '#F59E0B' },
                                    { label: 'Confirmed', value: stats?.confirmed ?? '—', color: '#3B82F6' },
                                    { label: 'On Hold', value: stats?.on_hold ?? '—', color: '#F97316' },
                                    { label: 'Fulfilled', value: stats?.fulfilled ?? '—', color: '#10B981' },
                                    { label: 'Cancelled', value: stats?.cancelled ?? '—', color: '#EF4444' },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#F8FAFC' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                                            <span className="text-[13px]" style={{ color: '#64748B' }}>{row.label}</span>
                                        </div>
                                        <span className="text-[15px] font-bold" style={{ color: '#1E293B' }}>
                                            {loading ? <span className="inline-block w-6 h-4 bg-gray-100 animate-pulse rounded" /> : row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="hidden xl:flex flex-col gap-4" style={{ width: 260, minWidth: 260 }}>

                    {/* Date card */}
                    <div
                        className="bg-white rounded-2xl p-5"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Today</p>
                        <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>
                            {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric' })}
                        </p>

                        {/* Mini week strip */}
                        <div className="flex gap-1 mt-4">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                                const today = new Date().getDay();
                                // 0=Sun → map: Sun=6, Mon=0
                                const mapped = today === 0 ? 6 : today - 1;
                                const isToday = i === mapped;
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 flex items-center justify-center rounded-lg py-1.5 text-[10px] font-bold"
                                        style={{
                                            background: isToday ? '#6366f1' : '#F8FAFC',
                                            color: isToday ? 'white' : '#94A3B8',
                                        }}
                                    >
                                        {d}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly summary */}
                    {!weeklyLoading && weekly && (
                        <div
                            className="bg-white rounded-2xl p-5"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>This Week</p>
                            <div className="flex justify-between mb-3">
                                <div>
                                    <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>{weekly.total}</p>
                                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>Total orders</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{weekly.average}</p>
                                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>Avg / day</p>
                                </div>
                            </div>
                            <div
                                className="rounded-xl p-3 flex items-center justify-between"
                                style={{ background: '#ECFDF5' }}
                            >
                                <div>
                                    <p className="text-[11px] font-medium" style={{ color: '#059669' }}>Peak Day</p>
                                    <p className="text-sm font-bold" style={{ color: '#064E3B' }}>{weekly.peak_day}</p>
                                </div>
                                <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{weekly.peak_count}</p>
                            </div>
                        </div>
                    )}

                    {/* Activity feed */}
                    <div
                        className="bg-white rounded-2xl p-5 flex-1"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>Activity</p>
                        <ActivityItem text="Dashboard loaded" sub="Just now" color="#6366f1" />
                        <ActivityItem text="Orders synced" sub="Auto-refresh active" color="#10B981" />
                        <ActivityItem text="Stats updated" sub="Live polling" color="#F59E0B" />

                        {/* Live indicator */}
                        <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                            Live · updates every 7s
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default memo(AdminDashboard);
