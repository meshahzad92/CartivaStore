import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/common/Button';

function Cart() {
    const { items, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <svg
                        className="w-24 h-24 mx-auto text-muted-foreground/20 mb-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-8">
                        Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                    </p>
                    <Link to="/products">
                        <Button size="lg">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                    <p className="text-muted-foreground mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <CartSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(Cart);
