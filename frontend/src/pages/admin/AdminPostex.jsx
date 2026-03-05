import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Truck, Upload, RefreshCw, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Editable cell component
// ─────────────────────────────────────────────────────────────────────────────
function EditableCell({ value, onChange, type = 'text', width = 'w-28', placeholder = '' }) {
    return (
        <input
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="block px-2 py-1.5 text-[12px] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
            style={{
                width: '100%',
                minWidth: 80,
                background: '#FFFBF7',
                border: '1.5px solid #FED7AA',
                color: '#1E293B',
            }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────
function TableSkeleton() {
    return (
        <div className="space-y-3 p-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                    <div className="h-4 w-4 bg-gray-100 rounded" />
                    {[80, 100, 120, 90, 70, 60, 110, 80, 60].map((w, j) => (
                        <div key={j} className="h-8 bg-gray-100 rounded-lg" style={{ width: w }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload result toast
// ─────────────────────────────────────────────────────────────────────────────
function UploadToast({ results, onDismiss }) {
    if (!results) return null;
    return (
        <div
            className="fixed bottom-6 right-6 z-50 rounded-2xl p-4 w-80"
            style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-sm font-bold" style={{ color: '#1E293B' }}>Upload Complete</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                        {results.uploaded} uploaded · {results.failed} failed
                    </p>
                </div>
                <button onClick={onDismiss} className="cursor-pointer text-gray-400 hover:text-gray-600">
                    <X size={15} />
                </button>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {(results.results || []).map(r => (
                    <div key={r.order_id} className="flex items-start gap-2 text-xs">
                        {r.success
                            ? <CheckCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                            : <XCircle size={12} className="shrink-0 mt-0.5" style={{ color: '#EF4444' }} />}
                        <span style={{ color: '#475569' }}>
                            <span className="font-bold">#{r.order_id}</span>{' '}
                            {r.success
                                ? <span style={{ color: '#059669' }}>→ {r.tracking_number}</span>
                                : <span style={{ color: '#EF4444' }}>{r.error || 'Failed'}</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
function AdminPostex() {
    const { authFetch } = useAdminAuth();

    // Raw orders from server
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Per-row edited data: { [orderId]: { orderDetail, customerName, customerPhone, deliveryAddress, cityName, invoicePayment, items } }
    const [edits, setEdits] = useState({});

    // Selection
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Upload
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/admin/postex/orders`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = data.orders ?? [];
            setOrders(list);
            // Seed edits with current values
            const initial = {};
            list.forEach(o => {
                initial[o.id] = {
                    orderRefNumber: String(o.id),
                    invoicePayment: String(Math.round(o.total_amount)),
                    orderDetail: o.notes || 'Order from Cartiva Store',
                    customerName: o.full_name,
                    customerPhone: o.phone,
                    deliveryAddress: o.address,
                    cityName: o.city,
                    items: String(o.item_count ?? (o.items?.length ?? 1)),
                };
            });
            setEdits(initial);
            setSelectedIds(new Set());
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [authFetch]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Field change ─────────────────────────────────────────────────────────

    const setField = (orderId, field, value) => {
        setEdits(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [field]: value },
        }));
    };

    // ── Selection ────────────────────────────────────────────────────────────

    const toggleOne = (id) => setSelectedIds(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });
    const allSelected = orders.length > 0 && orders.every(o => selectedIds.has(o.id));
    const toggleAll = () => {
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(orders.map(o => o.id)));
    };

    // ── Upload ───────────────────────────────────────────────────────────────

    const handleUpload = async () => {
        if (!selectedIds.size) return;
        setUploading(true);
        setUploadResult(null);
        try {
            // Build payload using edited values
            const selectedOrders = orders
                .filter(o => selectedIds.has(o.id))
                .map(o => {
                    const e = edits[o.id] || {};
                    return {
                        id: o.id,
                        total_amount: parseFloat(e.invoicePayment) || o.total_amount,
                        full_name: e.customerName || o.full_name,
                        phone: e.customerPhone || o.phone,
                        address: e.deliveryAddress || o.address,
                        city: e.cityName || o.city,
                        notes: e.orderDetail || o.notes,
                        items: Array(parseInt(e.items, 10) || 1).fill(null), // length only
                    };
                });

            // Send to backend — pass edited overrides as metadata
            // We'll send ids + the edited payloads so the backend can use them
            const res = await authFetch(`${API_BASE}/admin/postex/upload`, {
                method: 'POST',
                body: JSON.stringify({ ids: [...selectedIds], overrides: Object.fromEntries(selectedOrders.map(o => [o.id, o])) }),
            });
            const data = await res.json();
            setUploadResult(data);
            await fetchOrders(); // refresh — uploaded ones disappear
        } catch {
            setUploadResult({ uploaded: 0, failed: selectedIds.size, results: [] });
        } finally {
            setUploading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    const FIELDS = [
        { key: 'orderRefNumber', label: 'Order Ref #', width: 80, type: 'text' },
        { key: 'invoicePayment', label: 'Invoice (Rs)', width: 90, type: 'number' },
        { key: 'orderDetail', label: 'Order Detail', width: 180, type: 'text' },
        { key: 'customerName', label: 'Customer Name', width: 140, type: 'text' },
        { key: 'customerPhone', label: 'Phone', width: 120, type: 'text' },
        { key: 'deliveryAddress', label: 'Delivery Address', width: 200, type: 'text' },
        { key: 'cityName', label: 'City', width: 100, type: 'text' },
        { key: 'items', label: 'Items (qty)', width: 80, type: 'number' },
    ];

    return (
        <AdminLayout>
            <UploadToast results={uploadResult} onDismiss={() => setUploadResult(null)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FF6B00' }}>
                            <Truck size={18} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Postex Upload</h1>
                    </div>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Edit order details inline, select and upload to Postex. Uploaded orders auto-move to <strong>Booked</strong> status.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="p-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                        style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!selectedIds.size || uploading}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: selectedIds.size ? '#FF6B00' : '#CBD5E1',
                            boxShadow: selectedIds.size ? '0 4px 14px rgba(255,107,0,0.35)' : 'none',
                        }}
                    >
                        {uploading
                            ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            : <Upload size={15} />}
                        {uploading ? 'Uploading…' : selectedIds.size ? `Upload (${selectedIds.size}) to Postex` : 'Upload to Postex'}
                    </button>
                </div>
            </div>

            {/* Hint banner */}
            <div
                className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-xs"
                style={{ background: '#FFF7ED', border: '1px solid #FDE68A', color: '#92400E' }}
            >
                <Edit2 size={13} className="shrink-0 mt-0.5" />
                <span>
                    All fields are <strong>editable</strong> — change the invoice amount, address, city or any detail before uploading. Only <strong>confirmed</strong> orders that haven't been uploaded yet are shown here.
                </span>
            </div>

            {/* Table */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}
            >
                {loading ? <TableSkeleton /> : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#FFF7ED' }}>
                            <Truck size={26} style={{ color: '#FB923C' }} />
                        </div>
                        <p className="text-sm font-bold" style={{ color: '#1E293B' }}>All caught up!</p>
                        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                            No confirmed orders pending Postex upload.<br />
                            Mark orders as <strong>Confirmed</strong> in the Orders page to see them here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ borderBottom: '1.5px solid #F1F5F9' }}>
                                    {/* Checkbox */}
                                    <th className="py-3 pl-5 pr-3 text-left" style={{ background: '#FAFAFA' }}>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="w-3.5 h-3.5 rounded cursor-pointer"
                                            style={{ accentColor: '#FF6B00' }}
                                        />
                                    </th>
                                    {FIELDS.map(f => (
                                        <th
                                            key={f.key}
                                            className="py-3 pr-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                                            style={{ background: '#FAFAFA', color: '#94A3B8', minWidth: f.width }}
                                        >
                                            {f.label}
                                        </th>
                                    ))}
                                    <th className="py-3 pr-5 text-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ background: '#FAFAFA', color: '#94A3B8' }}>
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => {
                                    const e = edits[order.id] || {};
                                    const isSelected = selectedIds.has(order.id);
                                    return (
                                        <tr
                                            key={order.id}
                                            style={{
                                                borderBottom: idx < orders.length - 1 ? '1px solid #F8FAFC' : 'none',
                                                background: isSelected ? '#FFF7ED' : 'transparent',
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <td className="py-3 pl-5 pr-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOne(order.id)}
                                                    className="w-3.5 h-3.5 rounded cursor-pointer"
                                                    style={{ accentColor: '#FF6B00' }}
                                                />
                                            </td>

                                            {/* Order Ref # (read-only label, editable text) */}
                                            <td className="py-3 pr-3">
                                                <EditableCell
                                                    value={e.orderRefNumber}
                                                    onChange={v => setField(order.id, 'orderRefNumber', v)}
                                                    placeholder={String(order.id)}
                                                />
                                            </td>

                                            {/* Invoice Payment */}
                                            <td className="py-3 pr-3">
                                                <EditableCell
                                                    type="number"
                                                    value={e.invoicePayment}
                                                    onChange={v => setField(order.id, 'invoicePayment', v)}
                                                    placeholder="Amount"
                                                />
                                            </td>

                                            {/* Order Detail */}
                                            <td className="py-3 pr-3" style={{ minWidth: 180 }}>
                                                <EditableCell
                                                    value={e.orderDetail}
                                                    onChange={v => setField(order.id, 'orderDetail', v)}
                                                    placeholder="Order detail"
                                                />
                                            </td>

                                            {/* Customer Name */}
                                            <td className="py-3 pr-3" style={{ minWidth: 140 }}>
                                                <EditableCell
                                                    value={e.customerName}
                                                    onChange={v => setField(order.id, 'customerName', v)}
                                                    placeholder="Customer name"
                                                />
                                            </td>

                                            {/* Phone */}
                                            <td className="py-3 pr-3" style={{ minWidth: 120 }}>
                                                <EditableCell
                                                    value={e.customerPhone}
                                                    onChange={v => setField(order.id, 'customerPhone', v)}
                                                    placeholder="Phone"
                                                />
                                            </td>

                                            {/* Delivery Address */}
                                            <td className="py-3 pr-3" style={{ minWidth: 200 }}>
                                                <EditableCell
                                                    value={e.deliveryAddress}
                                                    onChange={v => setField(order.id, 'deliveryAddress', v)}
                                                    placeholder="Delivery address"
                                                />
                                            </td>

                                            {/* City */}
                                            <td className="py-3 pr-3" style={{ minWidth: 100 }}>
                                                <EditableCell
                                                    value={e.cityName}
                                                    onChange={v => setField(order.id, 'cityName', v)}
                                                    placeholder="City"
                                                />
                                            </td>

                                            {/* Items (qty count) */}
                                            <td className="py-3 pr-3" style={{ minWidth: 80 }}>
                                                <EditableCell
                                                    type="number"
                                                    value={e.items}
                                                    onChange={v => setField(order.id, 'items', v)}
                                                    placeholder="1"
                                                />
                                            </td>

                                            {/* Date */}
                                            <td className="py-3 pr-5 text-center whitespace-nowrap">
                                                <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                                                    {new Date(order.created_at).toLocaleString('en-PK', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: '#F1F5F9' }}>
                            <p className="text-xs" style={{ color: '#94A3B8' }}>
                                {selectedIds.size > 0
                                    ? `${selectedIds.size} of ${orders.length} selected`
                                    : `${orders.length} order${orders.length !== 1 ? 's' : ''} pending upload`}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#FF6B00' }} />
                                Postex Live Integration — edit fields freely before upload
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default memo(AdminPostex);
