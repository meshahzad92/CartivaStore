const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Generic fetch helper with error handling.
 */
async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    return res.json();
}

// ── Products ────────────────────────────────────────────────────────────────

export async function getProducts({ search, category, minPrice, maxPrice, sortBy, page, pageSize } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (minPrice != null) params.set('min_price', minPrice);
    if (maxPrice != null) params.set('max_price', maxPrice);
    if (sortBy) params.set('sort_by', sortBy);
    if (page) params.set('page', page);
    if (pageSize) params.set('page_size', pageSize);

    const qs = params.toString();
    const data = await apiFetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`);

    // Normalize items to match frontend expectations
    return data.items.map(normalizeProduct);
}

export async function getProductById(id) {
    const data = await apiFetch(`${API_BASE}/products/${id}`);
    return normalizeProduct(data);
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
    return apiFetch(`${API_BASE}/products/categories`);
}

// ── Testimonials ────────────────────────────────────────────────────────────

export async function getTestimonials() {
    const data = await apiFetch(`${API_BASE}/testimonials`);
    return data.map((t) => ({
        id: t.id,
        name: t.name,
        comment: t.message,
        rating: t.rating,
        role: 'Verified Buyer',
        avatar: t.name.split(' ').map((w) => w[0]).join('').slice(0, 2),
    }));
}

// ── Orders ──────────────────────────────────────────────────────────────────

export async function submitOrderToBackend(orderData) {
    const payload = {
        full_name: orderData.fullName,
        phone: orderData.phone.replace(/[^0-9+]/g, ''),
        address: orderData.address,
        city: orderData.city,
        postal_code: orderData.postalCode || '00000',
        items: orderData.items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
        })),
    };

    const data = await apiFetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    return {
        orderId: data.order_id,
        totalAmount: data.total_amount,
        itemCount: data.item_count,
        status: 'confirmed',
        estimatedDelivery: '3-5 business days',
        message: data.message,
        ...orderData,
    };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalize a backend product to match the shape the frontend components expect.
 */
function normalizeProduct(p) {
    return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        originalPrice: p.original_price || null,
        category: p.category,
        images: p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : []),
        rating: p.rating ?? 4.5,
        reviews: p.reviews ?? 0,
        badge: p.badge || null,
        inStock: p.in_stock ?? true,
        stock: p.stock,
        packages: p.packages || [],
        addOn: p.add_on || null,
    };
}
