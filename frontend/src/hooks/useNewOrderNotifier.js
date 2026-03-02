import { useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SOUND_URL = 'http://localhost:8000/static/sound/shopify_sale_sound.mp3';
const POLL_INTERVAL = 7000; // 7 seconds
const STORAGE_KEY = 'cartiva-last-order-id';

export function useNewOrderNotifier({ token, onNewOrder }) {
    const lastOrderIdRef = useRef(parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10));
    const audioRef = useRef(null);
    const intervalRef = useRef(null);

    // Pre-load the audio
    useEffect(() => {
        const audio = new Audio(SOUND_URL);
        audio.preload = 'auto';
        audioRef.current = audio;
    }, []);

    const playSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { }); // browser may block autoplay
        }
    }, []);

    const poll = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/admin/orders/latest-id`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            const latestId = data.latest_order_id || 0;

            if (latestId > lastOrderIdRef.current) {
                // New order(s) came in
                const newCount = latestId - lastOrderIdRef.current;
                lastOrderIdRef.current = latestId;
                localStorage.setItem(STORAGE_KEY, String(latestId));
                playSound();
                if (onNewOrder) onNewOrder(newCount);
            } else if (lastOrderIdRef.current === 0 && latestId > 0) {
                // Initialize — don't alert on startup
                lastOrderIdRef.current = latestId;
                localStorage.setItem(STORAGE_KEY, String(latestId));
            }
        } catch {
            // network error — silently ignore
        }
    }, [token, onNewOrder, playSound]);

    useEffect(() => {
        if (!token) return;
        poll(); // immediate first poll
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [token, poll]);
}
