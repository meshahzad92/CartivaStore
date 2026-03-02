import { useState, useEffect, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Loader from '../components/common/Loader';

const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Popular' }
];

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'default');
    const [priceRange, setPriceRange] = useState([0, 300]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        Promise.all([getProducts(), getCategories()])
            .then(([products, cats]) => {
                setAllProducts(products);
                setCategories(cats);
            })
            .catch((err) => console.error('Failed to load products:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setCategory(cat);
    }, [searchParams]);

    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }

        // Category
        if (category !== 'all') {
            result = result.filter((p) => p.category === category);
        }

        // Price range
        result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Sort
        switch (sort) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'reviews':
                result.sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                break;
        }

        return result;
    }, [allProducts, search, category, sort, priceRange]);

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">All Products</h1>
                <p className="text-muted-foreground mt-1">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:hidden px-4 py-2.5 rounded-lg border border-input bg-background text-foreground flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Filters
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className={`lg:w-56 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    {/* Category Filter */}
                    <div className="bg-card rounded-xl border border-border p-5">
                        <h3 className="font-semibold text-card-foreground mb-3">Category</h3>
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <label
                                    key={cat.value}
                                    className="flex items-center gap-2 text-sm cursor-pointer group"
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat.value}
                                        checked={category === cat.value}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="accent-primary cursor-pointer"
                                    />
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        {cat.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-card rounded-xl border border-border p-5">
                        <h3 className="font-semibold text-card-foreground mb-3">Price Range</h3>
                        <input
                            type="range"
                            min={0}
                            max={300}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            className="w-full accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>$0</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="flex-1">
                    <ProductGrid products={filteredProducts} />
                </div>
            </div>
        </div>
    );
}

export default memo(Products);
