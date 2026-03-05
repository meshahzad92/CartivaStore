import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Search, Trash2, ChevronDown, CheckSquare } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import MarkAsDropdown from '../../components/admin/MarkAsDropdown';
import OrderDetailPanel from '../../components/admin/OrderDetailPanel';
import NewOrderToast from '../../components/admin/NewOrderToast';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNewOrderNotifier } from '../../hooks/useNewOrderNotifier';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: '#F59E0B' },
    { value: 'confirmed', label: 'Confirmed', color: '#3B82F6' },
    { value: 'on_hold', label: 'On Hold', color: '#F97316' },
    { value: 'fulfilled', label: 'Fulfilled', color: '#10B981' },
    { value: 'booked', label: 'Booked', color: '#06B6D4' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

const FILTER_TABS = [
    { label: 'All', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Fulfilled', value: 'fulfilled' },
    { label: 'Booked', value: 'booked' },
    { label: 'Cancelled', value: 'cancelled' },
];

function TableSkeleton() {
    return (
        <div className="space-y-3 p-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                    <div className="h-4 w-4 bg-gray-100 rounded" />
                    <div className="h-4 w-12 bg-gray-100 rounded" />
                    <div className="h-4 flex-1 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ search }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F1F5F9' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-sm font-bold" style={{ color: '#1E293B' }}>No orders found</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                {search ? `No results for "${search}"` : 'Try a different filter'}
            </p>
        </div>
    );
}

function OrderRow({ order, onStatusChange, updating, onClick, checked, onToggle }) {
    return (
        <tr
            onClick={onClick}
            className="border-b transition-colors cursor-pointer group"
            style={{
                borderColor: '#F1F5F9',
                background: checked ? '#EEF2FF' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
        >
            <td className="py-3.5 pl-6 pr-3 w-8" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onToggle}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                    style={{ accentColor: '#6366f1' }}
                />
            </td>
            <td className="py-3.5 pr-4">
                <span className="text-xs font-bold font-mono" style={{ color: '#6366f1' }}>#{order.id}</span>
            </td>
            <td className="py-3.5 pr-4 max-w-[170px]">
                <p className="text-[13px] font-semibold truncate" style={{ color: '#1E293B' }}>{order.full_name}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: '#94A3B8' }}>{order.phone}</p>
            </td>
            <td className="py-3.5 pr-4 hidden sm:table-cell">
                <p className="text-[12px]" style={{ color: '#64748B' }}>{order.city}</p>
            </td>
            <td className="py-3.5 pr-4">
                <p className="text-[13px] font-bold" style={{ color: '#1E293B' }}>
                    Rs {Math.round(order.total_amount).toLocaleString()}
                </p>
            </td>
            <td className="py-3.5 pr-4">
                <StatusBadge status={order.status} />
            </td>
            <td className="py-3.5 pr-4 hidden md:table-cell">
                <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                    {new Date(order.created_at).toLocaleString('en-PK', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                </p>
            </td>
            <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                <MarkAsDropdown
                    currentStatus={order.status}
                    onSelect={(s) => onStatusChange(order.id, s)}
                    loading={updating}
                />
            </td>
        </tr>
    );
}

function AdminOrders() {
    const { token, authFetch } = useAdminAuth();
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(false);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [bulkMarkLoading, setBulkMarkLoading] = useState(false);
    const [bulkMarkOpen, setBulkMarkOpen] = useState(false);
    const bulkMarkRef = useRef(null);
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
        } catch { /* silent */ } finally { setLoading(false); }
    }, [authFetch, page, activeTab, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { setSelectedIds(new Set()); }, [activeTab, page, search]);

    const handleNewOrder = useCallback(() => {
        setToast(true); fetchOrders();
        setTimeout(() => setToast(false), 4000);
    }, [fetchOrders]);

    useNewOrderNotifier({ token, onNewOrder: handleNewOrder });

    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        setUpdatingIds(prev => new Set([...prev, orderId]));
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: newStatus } : prev);
        try {
            const res = await authFetch(`${API_BASE}/admin/orders/${orderId}`, {
                method: 'PATCH', body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) await fetchOrders();
        } finally {
            setUpdatingIds(prev => { const n = new Set(prev); n.delete(orderId); return n; });
        }
    }, [authFetch, fetchOrders]);

    const handleOrderUpdate = useCallback((updated) => {
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSelectedOrder(prev => prev?.id === updated.id ? updated : prev);
    }, []);

    const handleSearchInput = (e) => {
        setSearchInput(e.target.value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => { setSearch(e.target.value); setPage(1); }, 400);
    };

    const handleToggle = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allSelected = orders.length > 0 && orders.every(o => selectedIds.has(o.id));
    const handleToggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(orders.map(o => o.id)));
    };

    const handleBulkDelete = async () => {
        setDeleting(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/orders`, {
                method: 'DELETE', body: JSON.stringify({ ids: [...selectedIds] }),
            });
            if (!res.ok) throw new Error();
            if (selectedOrder && selectedIds.has(selectedOrder.id)) setSelectedOrder(null);
            setSelectedIds(new Set());
            setShowDeleteModal(false);
            await fetchOrders();
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    // Close bulk mark dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (bulkMarkRef.current && !bulkMarkRef.current.contains(e.target)) setBulkMarkOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBulkMarkAs = async (newStatus) => {
        setBulkMarkOpen(false);
        setBulkMarkLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/orders/bulk-status`, {
                method: 'PATCH',
                body: JSON.stringify({ ids: [...selectedIds], status: newStatus }),
            });
            if (!res.ok) throw new Error();
            // Update local state immediately
            setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedIds.has(selectedOrder.id)) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : prev);
            }
            setSelectedIds(new Set());
        } catch { /* silent */ }
        finally { setBulkMarkLoading(false); }
    };

    return (
        <AdminLayout>
            <NewOrderToast show={toast} />

            {selectedOrder && (
                <OrderDetailPanel
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    onOrderUpdate={handleOrderUpdate}
                    authFetch={authFetch}
                />
            )}

            {showDeleteModal && (
                <ConfirmDeleteModal
                    count={selectedIds.size}
                    loading={deleting}
                    onConfirm={handleBulkDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Orders</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
                        {total > 0 ? `${total} total orders` : 'No orders yet'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.size > 0 && (
                        <>
                            {/* Bulk Mark-As dropdown */}
                            <div className="relative" ref={bulkMarkRef}>
                                <button
                                    onClick={() => setBulkMarkOpen(o => !o)}
                                    disabled={bulkMarkLoading}
                                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}
                                >
                                    {bulkMarkLoading ? (
                                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <CheckSquare size={14} />
                                    )}
                                    Mark As ({selectedIds.size})
                                    <ChevronDown size={13} />
                                </button>

                                {bulkMarkOpen && (
                                    <div
                                        className="absolute left-0 top-full mt-1.5 w-40 rounded-xl py-1 overflow-hidden z-50"
                                        style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleBulkMarkAs(opt.value)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors cursor-pointer hover:bg-gray-50"
                                                style={{ color: '#374151' }}
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bulk delete */}
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                                style={{ background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA' }}
                            >
                                <Trash2 size={14} />
                                Delete ({selectedIds.size})
                            </button>
                        </>
                    )}

                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Search orders…"
                            value={searchInput}
                            onChange={handleSearchInput}
                            className="pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all w-52"
                            style={{ border: '1px solid #E5E7EB', background: 'white', color: '#1E293B' }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => { setActiveTab(tab.value); setPage(1); }}
                        className="px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
                        style={activeTab === tab.value
                            ? { background: '#1E293B', color: 'white' }
                            : { background: 'white', color: '#64748B', border: '1px solid #E5E7EB' }
                        }
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table card */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
            >
                {loading ? (
                    <TableSkeleton />
                ) : orders.length === 0 ? (
                    <EmptyState search={search} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th className="pb-3 pt-4 pl-6 pr-3 w-8 text-left">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={el => { if (el) el.indeterminate = orders.some(o => selectedIds.has(o.id)) && !allSelected; }}
                                            onChange={handleToggleAll}
                                            className="w-3.5 h-3.5 rounded cursor-pointer"
                                            style={{ accentColor: '#6366f1' }}
                                        />
                                    </th>
                                    {['Order', 'Customer', 'City', 'Total', 'Status', 'Date', ''].map(h => (
                                        <th key={h} className="pb-3 pt-4 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        onStatusChange={handleStatusChange}
                                        updating={updatingIds.has(order.id)}
                                        onClick={() => setSelectedOrder(order)}
                                        checked={selectedIds.has(order.id)}
                                        onToggle={() => handleToggle(order.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ background: 'white', color: '#1E293B', border: '1px solid #E5E7EB' }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ background: '#1E293B', color: 'white' }}
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
