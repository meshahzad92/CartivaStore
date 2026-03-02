import { useState, useEffect, useCallback, memo, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import MarkAsDropdown from '../../components/admin/MarkAsDropdown';
import OrderDetailPanel from '../../components/admin/OrderDetailPanel';
import NewOrderToast from '../../components/admin/NewOrderToast';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNewOrderNotifier } from '../../hooks/useNewOrderNotifier';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const FILTER_TABS = [
    { label: 'All', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Fulfilled', value: 'fulfilled' },
    { label: 'Cancelled', value: 'cancelled' },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <div className="space-y-2 p-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-10 w-12 bg-gray-100 rounded" />
                    <div className="h-10 flex-1 bg-gray-100 rounded" />
                    <div className="h-10 w-24 bg-gray-100 rounded" />
                    <div className="h-10 w-20 bg-gray-100 rounded" />
                    <div className="h-10 w-20 bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ search }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">
                {search ? `No results for "${search}"` : 'Try a different filter'}
            </p>
        </div>
    );
}

function OrdersTable({ orders, onStatusChange, updatingIds, onRowClick, search }) {
    if (orders.length === 0) return <EmptyState search={search} />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100">
                        {['Order', 'Customer', 'Phone', 'City', 'Total', 'Status', 'Date', ''].map((h) => (
                            <th key={h} className="pb-3 pr-4 last:pr-0 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            onClick={() => onRowClick(order)}
                            className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                        >
                            <td className="py-3.5 pr-4">
                                <span className="font-mono text-xs font-bold text-indigo-600">#{order.id}</span>
                            </td>
                            <td className="py-3.5 pr-4 max-w-[160px]">
                                <p className="font-medium text-gray-900 truncate">{order.full_name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{order.address}</p>
                            </td>
                            <td className="py-3.5 pr-4 text-gray-600 whitespace-nowrap">{order.phone}</td>
                            <td className="py-3.5 pr-4 text-gray-600">{order.city}</td>
                            <td className="py-3.5 pr-4 font-semibold text-gray-900 whitespace-nowrap">
                                Rs {Math.round(order.total_amount).toLocaleString()}
                            </td>
                            <td className="py-3.5 pr-4">
                                <StatusBadge status={order.status} />
                            </td>
                            <td className="py-3.5 pr-4 text-[11px] text-gray-400 whitespace-nowrap">
                                {new Date(order.created_at).toLocaleString('en-PK', {
                                    month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </td>
                            <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                                <MarkAsDropdown
                                    currentStatus={order.status}
                                    onSelect={(s) => onStatusChange(order.id, s)}
                                    loading={updatingIds.has(order.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────

function AdminOrders() {
    const { token, authFetch } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(false);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [activeTab, setActiveTab] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;
    const searchTimeout = useRef(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
            if (activeTab === 'today') params.set('today_only', 'true');
            else if (activeTab) params.set('status_filter', activeTab);
            if (search) params.set('search', search);

            const res = await authFetch(`${API_BASE}/admin/orders?${params}`);
            if (!res.ok) return;
            const data = await res.json();
            setOrders(data.orders);
            setTotal(data.total);
            setTotalPages(data.total_pages);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, [authFetch, page, activeTab, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleNewOrder = useCallback(() => {
        setToast(true);
        fetchOrders();
        setTimeout(() => setToast(false), 4000);
    }, [fetchOrders]);

    useNewOrderNotifier({ token, onNewOrder: handleNewOrder });

    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        setUpdatingIds((prev) => new Set([...prev, orderId]));
        // Optimistic update
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
        setSelectedOrder((prev) => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
        try {
            const res = await authFetch(`${API_BASE}/admin/orders/${orderId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                // Revert on failure
                await fetchOrders();
            }
        } finally {
            setUpdatingIds((prev) => { const n = new Set(prev); n.delete(orderId); return n; });
        }
    }, [authFetch, fetchOrders]);

    const handleOrderUpdate = useCallback((updated) => {
        setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
        setSelectedOrder((prev) => prev?.id === updated.id ? updated : prev);
    }, []);

    const handleSearchInput = (e) => {
        setSearchInput(e.target.value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => { setSearch(e.target.value); setPage(1); }, 400);
    };

    const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };

    return (
        <AdminLayout>
            <NewOrderToast show={toast} />

            {/* Order detail panel */}
            {selectedOrder && (
                <OrderDetailPanel
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    onOrderUpdate={handleOrderUpdate}
                    authFetch={authFetch}
                />
            )}

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{total > 0 ? `${total} total` : 'No orders'}</p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name, phone, ID…"
                        value={searchInput}
                        onChange={handleSearchInput}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1.5 mb-5">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer
                            ${activeTab === tab.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <TableSkeleton />
                ) : (
                    <div className="px-6 py-4">
                        <OrdersTable
                            orders={orders}
                            onStatusChange={handleStatusChange}
                            updatingIds={updatingIds}
                            onRowClick={setSelectedOrder}
                            search={search}
                        />
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                    <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default memo(AdminOrders);
