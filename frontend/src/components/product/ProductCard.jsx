import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatCurrency, getDiscountPercentage, truncateText } from '../../utils/helpers';

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-primary' : 'text-muted'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const discount = getDiscountPercentage(product.originalPrice, product.price);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <Link
            to={`/products/${product.id}`}
            className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                        {product.badge}
                    </span>
                )}
                {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                        -{discount}%
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {truncateText(product.description, 70)}
                </p>

                <div className="flex items-center gap-2 mt-auto">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.originalPrice)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default memo(ProductCard);
