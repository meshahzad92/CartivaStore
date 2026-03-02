import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { submitOrderToBackend } from '../../services/api';
import {
    formatCurrency,
    validatePhone,
    sanitizeInput,
    saveUserInfo,
    loadSavedUserInfo
} from '../../utils/helpers';

function InstantBuyModal({ isOpen, onClose, product, selectedPackage, addOnSelected, addOn }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [saveInfo, setSaveInfo] = useState(false);
    const lastSubmitRef = useRef(0);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: ''
    });

    // Auto-fill from localStorage
    useEffect(() => {
        if (isOpen) {
            const saved = loadSavedUserInfo();
            if (saved) {
                setForm((prev) => ({
                    fullName: saved.fullName || prev.fullName,
                    phone: saved.phone || prev.phone,
                    address: saved.address || prev.address,
                    city: saved.city || prev.city
                }));
                setSaveInfo(true);
            }
        }
    }, [isOpen]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const pkg = selectedPackage || product.packages?.[0] || { qty: 1, price: product.price };
    const subtotal = pkg.price + (addOnSelected && addOn ? addOn.price : 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Required';
        else if (form.fullName.trim().length < 2) e.fullName = 'Too short';
        if (!form.phone.trim()) e.phone = 'Required';
        else if (!validatePhone(form.phone)) e.phone = 'Invalid phone';
        if (!form.address.trim()) e.address = 'Required';
        else if (form.address.trim().length < 5) e.address = 'Too short';
        if (!form.city.trim()) e.city = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Debounce: prevent double-submit within 2s
        const now = Date.now();
        if (now - lastSubmitRef.current < 2000) return;
        lastSubmitRef.current = now;

        setLoading(true);
        try {
            const items = [{ id: product.id, name: product.name, price: pkg.price, quantity: pkg.qty }];
            if (addOnSelected && addOn) {
                items.push({ id: product.id + 1000, name: addOn.name, price: addOn.price, quantity: 1 });
            }

            const orderData = {
                fullName: sanitizeInput(form.fullName.trim()),
                phone: sanitizeInput(form.phone.trim()),
                address: sanitizeInput(form.address.trim()),
                city: sanitizeInput(form.city.trim()),
                postalCode: '00000',
                paymentMethod: 'Cash on Delivery',
                items,
                total
            };

            if (saveInfo) {
                saveUserInfo({ fullName: form.fullName.trim(), phone: form.phone.trim(), address: form.address.trim(), city: form.city.trim() });
            }

            const result = await submitOrderToBackend(orderData);
            onClose();
            navigate('/confirmation', { state: { order: result } });
        } catch {
            setErrors({ form: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-bold text-card-foreground">Complete Your Order</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-4 space-y-5">
                    {/* Product Summary */}
                    <div className="flex gap-3 p-3 bg-muted/50 rounded-xl">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-card-foreground truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{pkg.label} — Qty: {pkg.qty}</p>
                            <p className="text-sm font-bold text-primary mt-0.5">{formatCurrency(pkg.price)}</p>
                        </div>
                    </div>

                    {addOnSelected && addOn && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-accent/30 rounded-lg text-sm">
                            <span>🎁</span>
                            <span className="flex-1">{addOn.name}</span>
                            <span className="font-semibold">{formatCurrency(addOn.price)}</span>
                        </div>
                    )}

                    {errors.form && (
                        <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-sm">{errors.form}</div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div>
                            <input
                                name="fullName" value={form.fullName} onChange={handleChange}
                                placeholder="Full Name *"
                                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-sm ${errors.fullName ? 'border-destructive' : 'border-input'}`}
                            />
                            {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                            <input
                                name="phone" type="tel" value={form.phone} onChange={handleChange}
                                placeholder="Phone Number *"
                                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-sm ${errors.phone ? 'border-destructive' : 'border-input'}`}
                            />
                            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <input
                                name="address" value={form.address} onChange={handleChange}
                                placeholder="Full Address *"
                                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-sm ${errors.address ? 'border-destructive' : 'border-input'}`}
                            />
                            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                        </div>
                        <div>
                            <input
                                name="city" value={form.city} onChange={handleChange}
                                placeholder="City *"
                                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-sm ${errors.city ? 'border-destructive' : 'border-input'}`}
                            />
                            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                        </div>
                    </div>

                    {/* Save info checkbox */}
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="accent-primary cursor-pointer" />
                        <span className="text-muted-foreground">Save info for faster checkout</span>
                    </label>

                    {/* Order Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-border text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment</span>
                            <span className="font-medium">Cash on Delivery</span>
                        </div>
                    </div>

                    {/* Sticky Submit */}
                    <div className="sticky bottom-0 bg-card pt-3 pb-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>COMPLETE ORDER — {formatCurrency(total)}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>,
        document.body
    );
}

export default memo(InstantBuyModal);
