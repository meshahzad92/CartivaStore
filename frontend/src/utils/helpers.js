const USER_INFO_KEY = 'cartiva-user-info';

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

export function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CRV-${timestamp}-${random}`;
}

export function truncateText(text, maxLength = 80) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '…';
}

export function getDiscountPercentage(originalPrice, currentPrice) {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function validatePhone(phone) {
    const cleaned = phone.replace(/[^0-9+\-\s()]/g, '');
    return cleaned.length >= 7 && cleaned.length <= 20;
}

export function validatePostalCode(code) {
    return /^[a-zA-Z0-9\s\-]{3,10}$/.test(code);
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// ── Smart Cart Prefill ──────────────────────────────────────────────────────

export function saveUserInfo(info) {
    try {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    } catch {
        // ignore
    }
}

export function loadSavedUserInfo() {
    try {
        const stored = localStorage.getItem(USER_INFO_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

// ── Debounce ────────────────────────────────────────────────────────────────

export function debounce(fn, ms = 1000) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
