import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/common/Button';

function Confirmation() {
    const { state } = useLocation();
    const order = state?.order;

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">No order found</h2>
                <p className="text-muted-foreground mb-8">It seems you haven't placed an order yet.</p>
                <Link to="/products">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {/* Success Icon */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
                <p className="text-muted-foreground mt-2">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>
            </div>

            {/* Order Details */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Order ID</p>
                        <p className="font-mono font-semibold text-foreground">{order.orderId}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-semibold text-green-600 capitalize">{order.status}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Delivery</p>
                        <p className="font-semibold text-foreground">{order.estimatedDelivery}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="font-semibold text-foreground">{order.paymentMethod}</p>
                    </div>
                </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <h3 className="font-semibold text-card-foreground mb-3">Shipping To</h3>
                <p className="text-sm text-muted-foreground">
                    {order.fullName}<br />
                    {order.address}<br />
                    {order.city}, {order.postalCode}<br />
                    {order.phone}
                </p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h3 className="font-semibold text-card-foreground mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {item.name} &times; {item.quantity}
                                </span>
                                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div className="border-t border-border pt-3 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/products">
                    <Button size="lg">Continue Shopping</Button>
                </Link>
                <Link to="/">
                    <Button variant="outline" size="lg">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}

export default memo(Confirmation);
