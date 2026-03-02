import { memo } from 'react';
import ProductCard from './ProductCard';

function ProductGrid({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-semibold text-muted-foreground">No products found</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

export default memo(ProductGrid);
