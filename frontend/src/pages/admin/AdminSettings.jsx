import { useState, useEffect, useCallback, memo } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
    return (
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer select-none">
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
            <div
                className="w-10 h-5 rounded-full transition-all duration-200"
                style={{ background: checked ? '#6366f1' : '#CBD5E1' }}
            />
            <div
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
            />
        </label>
    );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Input({ value, onChange, type = 'text', placeholder = '', multiline = false }) {
    const cls = `w-full px-3.5 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300`;
    const style = { background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#1E293B' };
    if (multiline) {
        return (
            <textarea
                className={cls}
                style={{ ...style, resize: 'vertical', minHeight: 72 }}
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        );
    }
    return (
        <input
            className={cls}
            style={style}
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
}

function Select({ value, onChange, options }) {
    return (
        <select
            className="w-full px-3.5 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
            style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#1E293B' }}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, field, form, setForm }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <span className="text-[13px]" style={{ color: '#475569' }}>{label}</span>
            <Toggle
                id={field}
                checked={!!form[field]}
                onChange={v => setForm(p => ({ ...p, [field]: v }))}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
    token: '',
    pickup_address: '',
    return_address: '',
    default_weight: '0.5',
    shipper_remarks: '',
    shipper_type: 'Normal',
    shipper_handling: 'Normal',
    print_item_details: false,
    print_item_details_sku: false,
    auto_order_fulfillment: false,
    auto_save_tracking: true,
    auto_calculate_weight: false,
    auto_calculate_pieces: false,
    calculate_paid_as_zero: false,
    add_order_notes_remarks: false,
};

function AdminSettings() {
    const { authFetch } = useAdminAuth();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [showToken, setShowToken] = useState(false);

    const set = (field) => (val) => setForm(p => ({ ...p, [field]: val }));

    // Fetch current settings
    useEffect(() => {
        (async () => {
            try {
                const res = await authFetch(`${API_BASE}/admin/settings`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setForm(prev => ({
                    ...prev,
                    ...data,
                    default_weight: String(data.default_weight ?? 0.5),
                    token: data.token ?? '',
                }));
            } catch { /* use defaults */ }
            finally { setLoading(false); }
        })();
    }, [authFetch]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const payload = {
                ...form,
                default_weight: parseFloat(form.default_weight) || 0.5,
                // Don't send empty string for token — send null to keep existing
                token: form.token.trim() || null,
            };
            const res = await authFetch(`${API_BASE}/admin/settings`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setForm(prev => ({ ...prev, ...data, default_weight: String(data.default_weight ?? 0.5) }));
            setSaved(true);
            setTimeout(() => setSaved(false), 3500);
        } catch (e) {
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const SHIPPER_TYPES = ['Normal', 'Fragile', 'Oversized'];
    const SHIPPER_HANDLING = ['Normal', 'Fragile', 'Extreme Care'];

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#6366F1' }}>
                            <Settings size={18} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: '#1E293B' }}>Settings</h1>
                    </div>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Configure your PostEx courier integration. Changes apply to all future uploads.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    style={{
                        background: 'linear-gradient(135deg,#6366F1,#4F46E5)',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    }}
                >
                    {saving
                        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        : <Save size={15} />}
                    {saving ? 'Saving…' : 'Save Settings'}
                </button>
            </div>

            {/* Success / error banners */}
            {saved && (
                <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm font-medium"
                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' }}>
                    <CheckCircle size={16} />
                    Settings saved successfully!
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm font-medium"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse h-12 rounded-xl" style={{ background: '#F1F5F9' }} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* ── Left column: main config ── */}
                    <div className="space-y-5">

                        {/* API Token */}
                        <div
                            className="bg-white rounded-2xl p-5"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-base font-bold mb-4" style={{ color: '#1E293B' }}>PostEx Courier</h2>
                            <Field label="API Token">
                                <div className="relative">
                                    <input
                                        type={showToken ? 'text' : 'password'}
                                        className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                                        style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#1E293B' }}
                                        value={form.token ?? ''}
                                        onChange={e => set('token')(e.target.value)}
                                        placeholder="Paste your PostEx API token here"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                        style={{ color: '#94A3B8' }}
                                    >
                                        {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </Field>
                        </div>

                        {/* Addresses */}
                        <div
                            className="bg-white rounded-2xl p-5 space-y-4"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-base font-bold" style={{ color: '#1E293B' }}>Addresses</h2>
                            <Field label="Pickup Address">
                                <Input
                                    value={form.pickup_address}
                                    onChange={set('pickup_address')}
                                    placeholder="House no, street, area, city"
                                    multiline
                                />
                            </Field>
                            <Field label="Return Address">
                                <Input
                                    value={form.return_address}
                                    onChange={set('return_address')}
                                    placeholder="Same as Pickup Address"
                                    multiline
                                />
                            </Field>
                        </div>

                        {/* Shipment defaults */}
                        <div
                            className="bg-white rounded-2xl p-5 space-y-4"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-base font-bold" style={{ color: '#1E293B' }}>Shipment Defaults</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Default Weight (KG)">
                                    <Input
                                        type="number"
                                        value={form.default_weight}
                                        onChange={set('default_weight')}
                                        placeholder="0.5"
                                    />
                                </Field>
                                <Field label="Shipper Remarks">
                                    <Input
                                        value={form.shipper_remarks}
                                        onChange={set('shipper_remarks')}
                                        placeholder="Optional remarks"
                                    />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Shipper Type">
                                    <Select
                                        value={form.shipper_type}
                                        onChange={set('shipper_type')}
                                        options={SHIPPER_TYPES.map(t => ({ value: t, label: t }))}
                                    />
                                </Field>
                                <Field label="Shipper Handling">
                                    <Select
                                        value={form.shipper_handling}
                                        onChange={set('shipper_handling')}
                                        options={SHIPPER_HANDLING.map(t => ({ value: t, label: t }))}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* ── Right column: feature toggles ── */}
                    <div>
                        <div
                            className="bg-white rounded-2xl p-5"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}
                        >
                            <h2 className="text-base font-bold mb-2" style={{ color: '#1E293B' }}>Feature Toggles</h2>
                            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
                                These settings affect how PostEx labels and orders are processed.
                            </p>

                            {[
                                { field: 'print_item_details', label: 'Print Item Details' },
                                { field: 'print_item_details_sku', label: 'Print Item Details with SKU' },
                                { field: 'auto_order_fulfillment', label: 'Auto Order Fulfillment' },
                                { field: 'auto_save_tracking', label: 'Auto Save Tracking Details' },
                                { field: 'auto_calculate_weight', label: 'Auto Calculate Weight' },
                                { field: 'auto_calculate_pieces', label: 'Auto Calculate Pieces' },
                                { field: 'calculate_paid_as_zero', label: 'Calculate Paid Orders as Zero' },
                                { field: 'add_order_notes_remarks', label: 'Add Order Notes in Remarks' },
                            ].map(({ field, label }) => (
                                <ToggleRow key={field} label={label} field={field} form={form} setForm={setForm} />
                            ))}

                            {/* Bottom save button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full mt-5 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl cursor-pointer transition-all disabled:opacity-60"
                                style={{
                                    background: 'linear-gradient(135deg,#6366F1,#4F46E5)',
                                    boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
                                }}
                            >
                                {saving
                                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Settings'}
                            </button>
                        </div>

                        {/* Info card */}
                        <div
                            className="mt-4 rounded-2xl p-4"
                            style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
                        >
                            <p className="text-xs font-bold mb-1" style={{ color: '#0C4A6E' }}>PostEx Integration</p>
                            <p className="text-xs leading-relaxed" style={{ color: '#0369A1' }}>
                                Your token and settings are stored locally in the database — never sent anywhere except PostEx.
                                For support contact <strong>babar@postex.pk</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default memo(AdminSettings);
