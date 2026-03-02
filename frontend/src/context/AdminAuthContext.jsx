import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ADMIN_TOKEN_KEY = 'cartiva-admin-token';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
    const [admin, setAdmin] = useState(null); // email
    const [checking, setChecking] = useState(true);

    // Verify token on mount / refresh
    useEffect(() => {
        if (!token) {
            setChecking(false);
            return;
        }
        fetch(`${API_BASE}/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                if (!res.ok) throw new Error('Invalid');
                return res.json();
            })
            .then((data) => setAdmin(data.email))
            .catch(() => {
                localStorage.removeItem(ADMIN_TOKEN_KEY);
                setToken(null);
                setAdmin(null);
            })
            .finally(() => setChecking(false));
    }, [token]);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Invalid credentials');
        }
        const data = await res.json();
        localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token);
        setToken(data.access_token);
        setAdmin(email);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setAdmin(null);
    }, []);

    const authFetch = useCallback(
        (url, options = {}) => {
            return fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    ...(options.headers || {})
                }
            });
        },
        [token]
    );

    return (
        <AdminAuthContext.Provider value={{ token, admin, checking, login, logout, authFetch }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return ctx;
}
