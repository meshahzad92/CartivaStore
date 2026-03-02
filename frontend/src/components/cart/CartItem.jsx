import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="flex gap-4 p-4 bg-card rounded-xl border border-border">
            {/* Image */}
            <Link to={`/products/${item.id}`} className="shrink-0">
                <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    loading="lazy"
                />
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <Link
                            to={`/products/${item.id}`}
                            className="font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                            {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {formatCurrency(item.price)} each
                        </p>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                        aria-label={`Remove ${item.name}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Quantity & Total */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center border-x border-border">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                    <span className="font-bold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default memo(CartItem);
