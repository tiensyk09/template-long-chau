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

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className={`lc-toast lc-toast-${toast.type}`}>
      <div className="lc-toast-icon-wrap">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}
      </div>
      <div className="lc-toast-message">{toast.message}</div>
      <button className="lc-toast-close" onClick={onRemove}>×</button>
    </div>
  );
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState([]);

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

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      subtotal,
      dispatch,
      addItem: (product, variant, quantity) => {
        dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
      },
      removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: { key } }),
      updateQty: (key, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      showToast,
      hydrated,
    }}>
      {children}
      <div className="lc-toast-container">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
