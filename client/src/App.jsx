import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrdersView from './components/OrdersView';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { api } from './api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('store'); // 'store', 'orders', 'admin'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Toasts
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

  // Initial Data & Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res?.user) setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }

    loadCategories();
  }, []);

  // Reload products when category, sort, or search changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortOption, searchQuery]);

  // Sync cart when user logs in or out
  useEffect(() => {
    if (user) {
      loadCart();
      loadUserOrders();
    } else {
      // Load local guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      let subtotal = 0;
      guestCart.forEach((i) => {
        subtotal += (i.product?.price || 0) * i.quantity;
      });
      setCart({
        items: guestCart,
        itemCount: guestCart.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2))
      });
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await api.getProducts({
        category: selectedCategory,
        sort: sortOption,
        search: searchQuery
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      addToast('Could not load products.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCart = async () => {
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const loadUserOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const ordersData = await api.getMyOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Cart operations
  const handleAddToCart = async (product, quantity = 1) => {
    if (product.stock < quantity) {
      addToast(`Only ${product.stock} units available in stock.`, 'error');
      return;
    }

    if (user) {
      try {
        await api.addToCart(product.id, quantity);
        await loadCart();
        addToast(`Added "${product.name}" to cart!`, 'success');
        setIsCartOpen(true);
      } catch (err) {
        addToast(err.message || 'Failed to add item to cart', 'error');
      }
    } else {
      // Guest cart
      const guestCart = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      const existing = guestCart.find((i) => i.productId === product.id);
      let updated;
      if (existing) {
        existing.quantity += quantity;
        updated = [...guestCart];
      } else {
        updated = [...guestCart, { id: 'guest_' + Date.now(), productId: product.id, product, quantity }];
      }
      localStorage.setItem('lumina_guest_cart', JSON.stringify(updated));
      let subtotal = 0;
      updated.forEach((i) => { subtotal += i.product.price * i.quantity; });
      setCart({
        items: updated,
        itemCount: updated.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2))
      });
      addToast(`Added "${product.name}" to cart!`, 'success');
      setIsCartOpen(true);
    }
  };

  const handleUpdateCartQuantity = async (cartItemId, newQty) => {
    if (user) {
      try {
        await api.updateCartItem(cartItemId, newQty);
        await loadCart();
      } catch (err) {
        addToast(err.message || 'Failed to update quantity', 'error');
      }
    } else {
      let guestCart = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      if (newQty <= 0) {
        guestCart = guestCart.filter((i) => i.id !== cartItemId);
      } else {
        const item = guestCart.find((i) => i.id === cartItemId);
        if (item) item.quantity = newQty;
      }
      localStorage.setItem('lumina_guest_cart', JSON.stringify(guestCart));
      let subtotal = 0;
      guestCart.forEach((i) => { subtotal += i.product.price * i.quantity; });
      setCart({
        items: guestCart,
        itemCount: guestCart.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2))
      });
    }
  };

  const handleRemoveCartItem = async (cartItemId) => {
    if (user) {
      try {
        await api.removeCartItem(cartItemId);
        await loadCart();
        addToast('Item removed from cart.', 'info');
      } catch (err) {
        addToast(err.message || 'Failed to remove item', 'error');
      }
    } else {
      let guestCart = JSON.parse(localStorage.getItem('lumina_guest_cart') || '[]');
      guestCart = guestCart.filter((i) => i.id !== cartItemId);
      localStorage.setItem('lumina_guest_cart', JSON.stringify(guestCart));
      let subtotal = 0;
      guestCart.forEach((i) => { subtotal += i.product.price * i.quantity; });
      setCart({
        items: guestCart,
        itemCount: guestCart.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2))
      });
      addToast('Item removed from cart.', 'info');
    }
  };

  const handleClearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
        await loadCart();
        addToast('Cart cleared.', 'info');
      } catch (err) {
        addToast(err.message || 'Failed to clear cart', 'error');
      }
    } else {
      localStorage.removeItem('lumina_guest_cart');
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      addToast('Cart cleared.', 'info');
    }
  };

  // Instant Buy Flow
  const handleBuyNow = (product, quantity = 1) => {
    if (!user) {
      setIsAuthOpen(true);
      addToast('Please sign in or use one-click demo login to checkout.', 'info');
      return;
    }
    setSelectedProduct(null);
    setCheckoutItems([{
      id: product.id,
      productId: product.id,
      product,
      quantity,
      price: product.price
    }]);
    const shipping = (product.price * quantity) >= 100 ? 0 : 15;
    const tax = parseFloat(((product.price * quantity) * 0.08).toFixed(2));
    setCheckoutTotal(parseFloat(((product.price * quantity) + shipping + tax).toFixed(2)));
    setIsCheckoutOpen(true);
  };

  // Cart Checkout Flow
  const handleProceedToCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      addToast('Please sign in to proceed with checkout.', 'info');
      return;
    }
    if (cart.items.length === 0) return;

    setIsCartOpen(false);
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
    await loadCart();
    await loadUserOrders();
    await loadProducts(); // update live stock badges
    return res;
  };

  // Close checkout and decide navigation
  const handleCloseCheckout = (action) => {
    setIsCheckoutOpen(false);
    if (action === 'view-orders') {
      setCurrentView('orders');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (currentView === 'admin' || currentView === 'orders') {
      setCurrentView('store');
    }
    addToast('Signed out successfully.', 'info');
  };

  return (
    <div className="lumina-app">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Global Navigation Bar */}
      <Navbar
        user={user}
        cartCount={cart.itemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* View Switching */}
      <main className="main-content">
        {currentView === 'admin' ? (
          <AdminDashboard
            onBackToStore={() => setCurrentView('store')}
            onNotify={addToast}
          />
        ) : currentView === 'orders' ? (
          <OrdersView
            orders={orders}
            loading={loadingOrders}
            onBackToStore={() => setCurrentView('store')}
          />
        ) : (
          <>
            {/* Storefront View */}
            {!searchQuery && (
              <Hero
                onExploreClick={() => {
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            <ProductList
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onProductClick={(product) => setSelectedProduct(product)}
              onAddToCart={(product) => handleAddToCart(product, 1)}
              loading={loadingProducts}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => {
            handleAddToCart(product, qty);
            setSelectedProduct(null);
          }}
          onBuyNow={(product, qty) => handleBuyNow(product, qty)}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        items={checkoutItems}
        totalAmount={checkoutTotal}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
        }}
        onNotify={addToast}
      />

      {/* Modern Luxury Footer */}
      <footer className="footer-wrapper">
        <div className="container footer-container">
          <div className="footer-brand-col">
            <div className="brand-text">
              <span className="brand-title">LUMINA</span>
              <span className="brand-badge">TECH</span>
            </div>
            <p className="footer-tagline">
              Premium smart tech, creator ultrabooks, audiophile acoustics, and wearable electronics. Powered by Neon PostgreSQL and Node.js.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Store Catalog</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setCurrentView('store');
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-admin-col">
            <h4>Quick Demo Access</h4>
            <p>Test all customer and administrative features instantly:</p>
            <div className="footer-demo-chips">
              <button
                className="badge badge-info"
                onClick={() => {
                  setIsAuthOpen(true);
                }}
              >
                👑 Admin Login (admin@store.com)
              </button>
              <button
                className="badge badge-success"
                onClick={() => {
                  setIsAuthOpen(true);
                }}
              >
                👤 Customer Login (customer@store.com)
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Database: Neon PostgreSQL Serverless
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container footer-bottom-inner">
            <span>© 2026 LUMINA Technologies Inc. All rights reserved.</span>
            <span>REST API & Prisma ORM Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
