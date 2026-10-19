import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onOrderSuccess
}) {
  const { user } = useAuth();
  const [shipping, setShipping] = useState({
    recipientName: user?.name || '',
    phone: '+1 (555) 789-0123',
    street: '450 Innovation Way, Suite 800',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrefillDemo = () => {
    setShipping({
      recipientName: user?.name || 'Alex Mercer',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States'
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shipping.recipientName || !shipping.street || !shipping.city || !shipping.postalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await onOrderSuccess({
        shippingAddress: shipping,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId || i.product?.id || i.id,
          quantity: i.quantity,
          price: i.price || i.product?.price
        }))
      });

      if (res && res.order) {
        setCompletedOrder(res.order);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog checkout-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="checkout-success-view">
            <div className="success-icon-badge">
              <CheckCircle2 size={54} color="var(--success)" />
            </div>

            <h2 className="success-headline">Order Confirmed!</h2>
            <p className="success-subtext">
              Thank you for shopping with Lumina. Your order has been placed and inventory reserved.
            </p>

            <div className="order-receipt-card">
              <div className="receipt-row">
                <span className="receipt-label">Order Reference</span>
                <strong className="receipt-value order-num">{completedOrder.orderNumber}</strong>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment Method</span>
                <span className="receipt-value">{completedOrder.paymentMethod}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Order Status</span>
                <span className="badge badge-info">{completedOrder.status}</span>
              </div>
              <div className="receipt-row receipt-total-row">
                <span className="receipt-label">Amount Paid</span>
                <strong className="receipt-value">${completedOrder.totalAmount?.toFixed(2)}</strong>
              </div>
            </div>

            <div className="success-cta-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose('view-orders');
                }}
              >
                <span>View in My Orders</span>
                <ArrowRight size={17} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => onClose('keep-shopping')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="checkout-form-container">
            <div className="checkout-header">
              <h3>Secure Checkout</h3>
              <button
                type="button"
                className="btn-prefill-demo"
                onClick={handlePrefillDemo}
                title="Fill sample address for testing"
              >
                <Sparkles size={14} /> Prefill Demo Address
              </button>
            </div>

            {errorMsg && (
              <div className="checkout-error-banner">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitOrder}>
              {/* Shipping Details */}
              <div className="checkout-section">
                <h4 className="section-title">1. Shipping Address</h4>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shipping.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={shipping.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shipping.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shipping.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shipping.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shipping.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h4 className="section-title">2. Payment Method</h4>

                <div className="payment-options-grid">
                  <label className={`payment-card-option ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                    />
                    <CreditCard
                      size={22}
                      color={paymentMethod === 'CARD' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                    />
                    <div className="payment-label-text">
                      <strong>Credit / Debit Card</strong>
                      <span>Visa, MasterCard, Amex</span>
                    </div>
                  </label>

                  <label className={`payment-card-option ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <Smartphone
                      size={22}
                      color={paymentMethod === 'UPI' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                    />
                    <div className="payment-label-text">
                      <strong>UPI / Instant Pay</strong>
                      <span>Google Pay, Apple Pay, NetBanking</span>
                    </div>
                  </label>

                  <label className={`payment-card-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <DollarSign
                      size={22}
                      color={paymentMethod === 'COD' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                    />
                    <div className="payment-label-text">
                      <strong>Cash on Delivery</strong>
                      <span>Pay upon courier arrival</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="card-dummy-inputs">
                    <div className="form-group">
                      <label className="form-label">Card Number (Simulated)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="•••• •••• •••• 4242"
                        defaultValue="4242 •••• •••• 4242"
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="12/28"
                          defaultValue="12/28"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="•••"
                          defaultValue="789"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Total & Submit */}
              <div className="checkout-summary-bar">
                <div className="checkout-total-col">
                  <span>Grand Total to Pay:</span>
                  <strong className="checkout-grand-total">
                    ${totalAmount?.toFixed(2) || '0.00'}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-place-order"
                  disabled={submitting}
                >
                  <ShieldCheck size={18} />
                  <span>{submitting ? 'Authorizing & Placing Order...' : 'Place Order Now'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
