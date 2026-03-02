import { useState, useEffect, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/api';
import { useCart } from '../hooks/useCart';
import { formatCurrency, getDiscountPercentage } from '../utils/helpers';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import LiveViewerCount from '../components/conversion/LiveViewerCount';
import LowStockBadge from '../components/conversion/LowStockBadge';
import PackageSelector from '../components/conversion/PackageSelector';
import AddOnUpsell from '../components/conversion/AddOnUpsell';
import InstantBuyModal from '../components/conversion/InstantBuyModal';

const features = [
    { icon: '🚚', text: 'Free shipping on orders over Rs.10,000' },
    { icon: '🔄', text: '30-day easy returns' },
    { icon: '🛡️', text: '2-year quality guarantee' },
    { icon: '💵', text: 'Cash on Delivery available' }
];

function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);

    // Conversion state
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [addOnSelected, setAddOnSelected] = useState(false);
    const [buyNowOpen, setBuyNowOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setSelectedImage(0);
        setAddedToCart(false);
        setAddOnSelected(false);
        setSelectedPackage(null);

        Promise.all([getProductById(id), getProducts()]).then(([prod, allProducts]) => {
            setProduct(prod);
            setSelectedPackage(prod.packages?.[0] || { qty: 1, price: prod.price, label: 'Buy 1', tag: null });
            setRelated(
                allProducts
                    .filter((p) => p.category === prod.category && p.id !== prod.id)
                    .slice(0, 4)
            );
            setLoading(false);
        });
    }, [id]);

    const handleAddToCart = () => {
        if (product && selectedPackage) {
            // Pass the per-unit discounted price from the selected package
            const perUnitPrice = selectedPackage.price / selectedPackage.qty;
            addToCart({ ...product, price: perUnitPrice }, selectedPackage.qty);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    if (loading) return <Loader />;
    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
                <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
                    Back to products
                </Link>
            </div>
        );
    }

    const discount = getDiscountPercentage(product.originalPrice, product.price);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{product.name}</span>
            </nav>

            {/* Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === i ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    {product.badge && (
                        <span className="inline-block w-fit px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-3">
                            {product.badge}
                        </span>
                    )}

                    <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

                    {/* Live Viewer Count */}
                    <div className="mt-2">
                        <LiveViewerCount />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-primary' : 'text-muted'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {product.rating} ({product.reviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-5">
                        <span className="text-3xl font-bold text-foreground">{formatCurrency(product.price)}</span>
                        {product.originalPrice && (
                            <>
                                <span className="text-lg text-muted-foreground line-through">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                                <span className="px-2 py-0.5 text-sm font-semibold bg-destructive/10 text-destructive rounded-full">
                                    -{discount}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>

                    {/* Package Selector */}
                    {product.packages && product.packages.length > 0 && (
                        <div className="mt-6">
                            <PackageSelector
                                packages={product.packages}
                                selected={selectedPackage}
                                onSelect={setSelectedPackage}
                            />
                        </div>
                    )}

                    {/* Add-On Upsell */}
                    {product.addOn && (
                        <div className="mt-4">
                            <AddOnUpsell
                                addOn={product.addOn}
                                selected={addOnSelected}
                                onToggle={() => setAddOnSelected(!addOnSelected)}
                            />
                        </div>
                    )}

                    {/* Low Stock Urgency */}
                    <div className="mt-4">
                        <LowStockBadge productId={product.id} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        <Button size="lg" onClick={handleAddToCart} variant="outline" className="flex-1 sm:flex-none">
                            {addedToCart ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Added!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </Button>

                        <Button size="lg" onClick={() => setBuyNowOpen(true)} className="flex-1 sm:flex-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            Buy Now
                        </Button>
                    </div>

                    {/* Silver Achievement Feature Blocks */}
                    <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-3">
                        {features.map((feat, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 40%, #d4d4d4 100%)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.08)'
                                }}
                            >
                                <span className="text-lg">{feat.icon}</span>
                                <span className="text-xs font-semibold text-gray-700">{feat.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="pt-8 border-t border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
                    <ProductGrid products={related} />
                </section>
            )}

            {/* Instant Buy Modal */}
            <InstantBuyModal
                isOpen={buyNowOpen}
                onClose={() => setBuyNowOpen(false)}
                product={product}
                selectedPackage={selectedPackage}
                addOnSelected={addOnSelected}
                addOn={product.addOn}
            />
        </div>
    );
}

export default memo(ProductDetails);
