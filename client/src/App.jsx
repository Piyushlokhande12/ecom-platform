import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

// Common Components
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Toast from './components/common/Toast.jsx';
import AuthModal from './components/common/AuthModal.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import CheckoutModal from './components/checkout/CheckoutModal.jsx';

import { api } from './api/api.js';
import './App.css';

function MainLayout({ toasts, removeToast, addToast }) {
  const { user, setIsAuthOpen } = useAuth();
  const { cart, refreshCart } = useCart();

  const [currentView, setCurrentView] = useState('store'); // 'store', 'orders', 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Instant Buy Flow (from ProductModal)
  const handleInstantBuy = (product, quantity = 1) => {
    if (!user) {
      setIsAuthOpen(true);
      addToast('Please sign in to proceed with checkout.', 'info');
      return;
    }
    setCheckoutItems([
      {
        id: product.id,
        productId: product.id,
        product,
        quantity,
        price: product.price
      }
    ]);
    const shipping = product.price * quantity >= 100 ? 0 : 15;
    const tax = parseFloat(((product.price * quantity) * 0.08).toFixed(2));
    setCheckoutTotal(parseFloat(((product.price * quantity) + shipping + tax).toFixed(2)));
    setIsCheckoutOpen(true);
  };

  // Cart Checkout Flow
  const handleProceedToCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      addToast('Please sign in to proceed with checkout.', 'info');
      return;
    }
    if (cart.items.length === 0) return;

    setCheckoutItems(cart.items);
    const shipping = cart.subtotal >= 100 ? 0 : 15;
    const tax = parseFloat((cart.subtotal * 0.08).toFixed(2));
    setCheckoutTotal(parseFloat((cart.subtotal + shipping + tax).toFixed(2)));
    setIsCheckoutOpen(true);
  };

  // Place Order submission
  const handleOrderSuccess = async (orderPayload) => {
    const res = await api.createOrder(orderPayload);
    addToast('🎉 Order placed successfully!', 'success');
    refreshCart();
    return res;
  };

  const handleCloseCheckout = (action) => {
    setIsCheckoutOpen(false);
    if (action === 'view-orders') {
      setCurrentView('orders');
    }
  };

  return (
    <div className="lumina-app">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Header Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Dynamic Page Views */}
      <main className="main-content">
        {currentView === 'admin' ? (
          <AdminPage
            onBackToStore={() => setCurrentView('store')}
            onNotify={addToast}
          />
        ) : currentView === 'orders' ? (
          <OrdersPage
            onBackToStore={() => setCurrentView('store')}
          />
        ) : (
          <HomePage
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onInstantBuy={handleInstantBuy}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        items={checkoutItems}
        totalAmount={checkoutTotal}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Authentication Modal */}
      <AuthModal onNotify={addToast} />

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={() => {}}
        onNavigateStore={() => setCurrentView('store')}
      />
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AuthProvider onNotify={addToast}>
      <CartProvider onNotify={addToast}>
        <MainLayout
          toasts={toasts}
          addToast={addToast}
          removeToast={removeToast}
        />
      </CartProvider>
    </AuthProvider>
  );
}
