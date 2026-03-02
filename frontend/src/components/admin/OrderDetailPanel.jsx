import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import StatusBadge from './StatusBadge';
import MarkAsDropdown from './MarkAsDropdown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Format currency
const fmt = (n) => `Rs ${Math.round(n || 0).toLocaleString()}`;

export default function OrderDetailPanel({ order, onClose, onStatusChange, onOrderUpdate, authFetch }) {
    const [address, setAddress] = useState(order?.address ?? '');
    const [notes, setNotes] = useState(order?.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const firstInputRef = useRef(null);

    // Sync fields when order changes
    useEffect(() => {
        setAddress(order?.address ?? '');
        setNotes(order?.notes ?? '');
        setSaveMsg('');
    }, [order?.id]);

    // Focus trap close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!order) return null;

    const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? order.total_amount;

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await authFetch(`${API_BASE}/admin/orders/${order.id}/details`, {
                method: 'PATCH',
                body: JSON.stringify({ address, notes }),
            });
            if (!res.ok) throw new Error('Failed');
            const updated = await res.json();
            setSaveMsg('Saved');
            if (onOrderUpdate) onOrderUpdate(updated);
            setTimeout(() => setSaveMsg(''), 2000);
        } catch {
            setSaveMsg('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusSelect = async (newStatus) => {
        setStatusLoading(true);
        if (onStatusChange) await onStatusChange(order.id, newStatus);
        setStatusLoading(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            {/* Panel */}
            <div className="relative ml-auto h-full w-full max-w-[520px] bg-white shadow-2xl flex flex-col order-panel-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-gray-900">#{order.id}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-2">
                        <MarkAsDropdown
                            currentStatus={order.status}
                            onSelect={handleStatusSelect}
                            loading={statusLoading}
                        />
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Order date */}
                    <p className="text-xs text-gray-400">
                        Placed on{' '}
                        {new Date(order.created_at).toLocaleString('en-PK', {
                            weekday: 'short', year: 'numeric', month: 'short',
                            day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                    </p>

                    {/* Products */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Items</h3>
                        <div className="space-y-2">
                            {order.items?.length > 0 ? order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {item.product?.name ?? `Product #${item.product_id}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {item.quantity} × {fmt(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{fmt(item.price * item.quantity)}</span>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400">No items data available</p>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span><span>{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span><span className="text-emerald-600">Free</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                                <span>Total</span><span>{fmt(order.total_amount)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Customer Info */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <InfoRow label="Name" value={order.full_name} />
                            <InfoRow label="Phone" value={order.phone} />
                            <InfoRow label="City" value={order.city} />
                            <InfoRow label="Postal" value={order.postal_code} />
                        </div>
                    </section>

                    {/* Editable Fields */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Editable Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Address</label>
                                <textarea
                                    ref={firstInputRef}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (internal)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Optional notes..."
                                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-800"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer / Save */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    {saveMsg ? (
                        <span className={`text-xs font-medium ${saveMsg === 'Saved' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {saveMsg === 'Saved' ? (
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Changes saved
                                </span>
                            ) : saveMsg}
                        </span>
                    ) : <span />}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-gray-400 shrink-0">{label}</span>
            <span className="text-gray-800 font-medium text-right">{value || '—'}</span>
        </div>
    );
}
