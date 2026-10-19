import React, { useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import CartItem from './CartItem.jsx';

export default function CartDrawer({ onProceedToCheckout }) {
  const { cart, isCartOpen, setIsCartOpen, clearCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15.00;
  const estimatedTax = subtotal > 0 ? parseFloat((subtotal * 0.08).toFixed(2)) : 0;
  const grandTotal = parseFloat((subtotal + shippingCost + estimatedTax).toFixed(2));

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="drawer-icon" />
            <h3>Your Shopping Cart</h3>
            <span className="drawer-item-count">
              ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            title="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="free-shipping-meter-wrap">
          <div className="shipping-meter-text">
            <Truck size={16} color="var(--accent-primary)" />
            {amountToFreeShipping === 0 ? (
              <span className="shipping-unlocked">
                🎉 You've unlocked <strong>Free Express Shipping!</strong>
              </span>
            ) : (
              <span>
                Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more for <strong>Free Shipping</strong>
              </span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-bar"
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Drawer Items Body */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon-wrap">
                <ShoppingBag size={48} color="var(--text-muted)" />
              </div>
              <h4>Your cart is empty</h4>
              <p>Explore our premium tech catalog and add your favorite gear.</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
                style={{ marginTop: 16 }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Price Breakdown & Checkout Button */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-pricing-breakdown">
              <div className="pricing-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong style={{ color: 'var(--success)' }}>FREE</strong>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pricing-row">
                <span>Estimated Tax (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="pricing-row pricing-total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="drawer-actions">
              <button
                className="btn btn-primary btn-checkout-proceed"
                onClick={onProceedToCheckout}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            <div className="drawer-security-note">
              <ShieldCheck size={14} color="var(--success)" />
              <span>Encrypted 256-Bit Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
