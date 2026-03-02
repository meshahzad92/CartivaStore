import { useState, useEffect, memo } from 'react';
import { getProducts } from '../../services/api';

const names = [
    'Ali', 'Ahmed', 'Sara', 'Fatima', 'Hassan', 'Zainab', 'Omar', 'Ayesha',
    'Bilal', 'Hira', 'Usman', 'Maryam', 'Imran', 'Sana', 'Hamza', 'Nadia'
];

const cities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function SocialProofPopup() {
    const [productNames, setProductNames] = useState([]);
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);

    // Fetch product names once on mount
    useEffect(() => {
        getProducts()
            .then((products) => setProductNames(products.map((p) => p.name)))
            .catch(() => setProductNames(['a product']));
    }, []);

    useEffect(() => {
        if (productNames.length === 0) return;

        function generateNotification() {
            const name = getRandomItem(names);
            const city = getRandomItem(cities);
            const qty = Math.floor(Math.random() * 4) + 1;
            const productName = getRandomItem(productNames);
            return { name, city, qty, productName };
        }

        function showNotification() {
            const n = generateNotification();
            setNotification(n);
            setVisible(true);
            setTimeout(() => setVisible(false), 3500);
        }

        const initialTimeout = setTimeout(() => showNotification(), 5000);
        const interval = setInterval(() => showNotification(), 10000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [productNames]);

    if (!notification) return null;

    return (
        <div
            className={`
        fixed bottom-4 left-4 z-30 max-w-xs
        bg-card border border-border rounded-xl shadow-lg
        px-4 py-3 flex items-center gap-3
        transition-all duration-500 ease-in-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
        >
            <div className="w-9 h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-card-foreground leading-tight">
                    {notification.name} from {notification.city}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    just bought {notification.qty} {notification.qty === 1 ? 'item' : 'items'}
                </p>
            </div>
        </div>
    );
}

export default memo(SocialProofPopup);
