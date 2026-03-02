import { createContext, useReducer, useEffect, useMemo } from 'react';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cartiva-cart';

function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(items) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage full or unavailable
    }
}

function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingIndex = state.findIndex((item) => item.id === action.payload.id);
            if (existingIndex >= 0) {
                const updated = [...state];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + (action.payload.quantity || 1)
                };
                return updated;
            }
            return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
        }
        case 'REMOVE_FROM_CART':
            return state.filter((item) => item.id !== action.payload);
        case 'UPDATE_QUANTITY':
            return state.map((item) =>
                item.id === action.payload.id
                    ? { ...item, quantity: Math.max(1, action.payload.quantity) }
                    : item
            );
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [items, dispatch] = useReducer(cartReducer, [], loadCartFromStorage);

    useEffect(() => {
        saveCartToStorage(items);
    }, [items]);

    const cartTotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );

    const cartCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    const addToCart = (product, quantity = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const value = useMemo(
        () => ({
            items,
            cartTotal,
            cartCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }),
        [items, cartTotal, cartCount]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
