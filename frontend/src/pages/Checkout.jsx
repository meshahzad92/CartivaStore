import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { submitOrderToBackend } from '../services/api';
import { formatCurrency, validatePhone, validatePostalCode, sanitizeInput, loadSavedUserInfo, saveUserInfo } from '../utils/helpers';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

function Checkout() {
    const navigate = useNavigate();
    const { items, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    });
    const [errors, setErrors] = useState({});

    const shipping = cartTotal > 100 ? 0 : 9.99;
    const total = cartTotal + shipping;

    // Auto-fill from localStorage (smart prefill)
    useEffect(() => {
        const saved = loadSavedUserInfo();
        if (saved) {
            setForm((prev) => ({
                fullName: saved.fullName || prev.fullName,
                phone: saved.phone || prev.phone,
                address: saved.address || prev.address,
                city: saved.city || prev.city,
                postalCode: prev.postalCode
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
        else if (form.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';

        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!validatePhone(form.phone)) newErrors.phone = 'Enter a valid phone number';

        if (!form.address.trim()) newErrors.address = 'Address is required';
        else if (form.address.trim().length < 5) newErrors.address = 'Enter a complete address';

        if (!form.city.trim()) newErrors.city = 'City is required';

        if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        else if (!validatePostalCode(form.postalCode)) newErrors.postalCode = 'Enter a valid postal code';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const sanitizedForm = {
                fullName: sanitizeInput(form.fullName.trim()),
                phone: sanitizeInput(form.phone.trim()),
                address: sanitizeInput(form.address.trim()),
                city: sanitizeInput(form.city.trim()),
                postalCode: sanitizeInput(form.postalCode.trim()),
                paymentMethod: 'Cash on Delivery',
                items: items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total
            };

            // Save user info for future prefill
            saveUserInfo({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                city: form.city.trim()
            });

            const result = await submitOrderToBackend(sanitizedForm);
            clearCart();
            navigate('/confirmation', { state: { order: result } });
        } catch {
            setErrors({ form: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground">Add items to your cart before checking out.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-card rounded-xl border border-border p-6">
                            <h2 className="text-lg font-semibold text-card-foreground mb-6">Shipping Information</h2>

                            {errors.form && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {errors.form}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    id="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                    required
                                    placeholder="John Doe"
                                    className="sm:col-span-2"
                                />
                                <Input
                                    label="Phone Number"
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    required
                                    placeholder="+1 (555) 123-4567"
                                />
                                <Input
                                    label="City"
                                    id="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                    required
                                    placeholder="New York"
                                />
                                <Input
                                    label="Address"
                                    id="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    error={errors.address}
                                    required
                                    placeholder="123 Main Street, Apt 4B"
                                    className="sm:col-span-2"
                                />
                                <Input
                                    label="Postal Code"
                                    id="postalCode"
                                    value={form.postalCode}
                                    onChange={handleChange}
                                    error={errors.postalCode}
                                    required
                                    placeholder="10001"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="mt-8 pt-6 border-t border-border">
                                <h3 className="font-semibold text-card-foreground mb-3">Payment Method</h3>
                                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                                    <div className="w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Cash on Delivery</p>
                                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
                            <h2 className="text-lg font-semibold text-card-foreground mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                loading={loading}
                                className="w-full mt-6"
                            >
                                Place Order
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default memo(Checkout);
