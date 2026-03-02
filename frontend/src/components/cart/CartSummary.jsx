import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';
import Button from '../common/Button';

function CartSummary({ showCheckout = true }) {
    const { items, cartTotal } = useCart();
    const shipping = cartTotal > 100 ? 0 : 9.99;
    const total = cartTotal + shipping;

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Order Summary</h3>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                        {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                        ) : (
                            formatCurrency(shipping)
                        )}
                    </span>
                </div>
                {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Free shipping on orders over $100
                    </p>
                )}
                <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-foreground">{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            {showCheckout && items.length > 0 && (
                <Link to="/checkout" className="block mt-6">
                    <Button className="w-full" size="lg">
                        Proceed to Checkout
                    </Button>
                </Link>
            )}
        </div>
    );
}

export default memo(CartSummary);
