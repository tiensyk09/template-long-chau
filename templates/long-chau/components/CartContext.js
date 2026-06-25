'use client';
import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity = 1 } = action.payload;
      const key = `${product.id}-${variant?.id || 'default'}`;
      const existing = state.items.find(i => i.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          )
        };
      }
      return {
        ...state,
        items: [...state.items, {
          key,
          product_id: product.id,
          product_name: product.name,
          variant_id: variant?.id || null,
          variant_name: variant?.name || product.unit || 'Hộp',
          thumbnail: product.thumbnail,
          unit_price: variant ? variant.price : (product.flash_sale_price || product.price),
          quantity,
        }]
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.key !== action.payload.key) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.key === action.payload.key ? { ...i, quantity: Math.max(1, action.payload.quantity) } : i
        )
      };
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lc_cart');
      if (stored) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) });
      }
    } catch { }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('lc_cart', JSON.stringify(state));
    }
  }, [state, hydrated]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      subtotal,
      dispatch,
      addItem: (product, variant, quantity) => dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } }),
      removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: { key } }),
      updateQty: (key, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
