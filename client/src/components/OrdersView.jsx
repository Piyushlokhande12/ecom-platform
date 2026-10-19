import React, { useState } from 'react';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, MapPin, CreditCard } from 'lucide-react';

export default function OrdersView({ orders, loading, onBackToStore }) {
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-info">Shipped</span>;
      case 'PROCESSING':
        return <span className="badge badge-warning">Processing</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">Pending</span>;
    }
  };

  const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  const getStepIndex = (status) => {
    return steps.indexOf(status);
  };

  const parseAddress = (addrRaw) => {
    try {
      if (typeof addrRaw === 'object') return addrRaw;
      return JSON.parse(addrRaw);
    } catch {
      return { street: addrRaw };
    }
  };

  const parseImage = (imagesRaw) => {
    try {
      if (Array.isArray(imagesRaw)) return imagesRaw[0];
      if (typeof imagesRaw === 'string' && imagesRaw.startsWith('[')) {
        return JSON.parse(imagesRaw)[0];
      }
      return imagesRaw || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80';
    }
  };

  return (
    <div className="orders-page-container">
      <div className="container">
        {/* Header navigation */}
        <div className="orders-header-row">
          <button className="btn btn-secondary btn-back-store" onClick={onBackToStore}>
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </button>

          <div className="orders-page-title">
            <h2>My Order History</h2>
            <span className="badge badge-info">{orders.length} Orders</span>
          </div>
        </div>

        {loading ? (
          <div className="orders-loading-state">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-card card">
            <Package size={52} color="var(--text-muted)" />
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Discover our flagship tech collection!</p>
            <button className="btn btn-primary" onClick={onBackToStore} style={{ marginTop: 16 }}>
              Explore Products
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order.id] !== false; // default open
              const currentStep = getStepIndex(order.status);
              const address = parseAddress(order.shippingAddress);

              return (
                <div key={order.id} className="order-card card">
                  {/* Order Top Bar */}
                  <div className="order-card-header">
                    <div className="order-meta-col">
                      <div className="order-number-row">
                        <span className="order-label">Order #</span>
                        <strong className="order-ref">{order.orderNumber}</strong>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="order-date-text">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="order-summary-col">
                      <div className="order-amount-box">
                        <span className="order-amount-label">Total Amount</span>
                        <span className="order-amount-value">${order.totalAmount.toFixed(2)}</span>
                      </div>

                      <button
                        className="btn-toggle-expand"
                        onClick={() => toggleExpand(order.id)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  {order.status !== 'CANCELLED' ? (
                    <div className="order-stepper-wrap">
                      <div className="stepper-track">
                        {steps.map((step, idx) => {
                          const isDone = idx < currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div
                              key={step}
                              className={`stepper-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
                            >
                              <div className="step-node">
                                {isDone ? (
                                  <CheckCircle2 size={16} />
                                ) : isCurrent ? (
                                  <div className="step-pulse-dot"></div>
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className="step-label">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="order-cancelled-banner">
                      <AlertCircle size={16} />
                      <span>This order was cancelled. Items have been restocked.</span>
                    </div>
                  )}

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="order-details-expanded">
                      <div className="order-items-table">
                        <div className="order-items-heading">Items in this order:</div>
                        {order.items?.map((item) => {
                          const img = parseImage(item.product?.images);

                          return (
                            <div key={item.id} className="order-item-row">
                              <img
                                src={img}
                                alt={item.product?.name || 'Product'}
                                className="order-item-thumb"
                              />
                              <div className="order-item-desc">
                                <h4>{item.product?.name}</h4>
                                <span className="order-item-qty">Qty: {item.quantity}</span>
                              </div>
                              <div className="order-item-pricing">
                                <span className="order-item-unit">${item.price.toFixed(2)} each</span>
                                <strong className="order-item-total">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="order-shipping-meta-grid">
                        <div className="shipping-info-block">
                          <div className="meta-block-title">
                            <MapPin size={15} />
                            <span>Delivery Address</span>
                          </div>
                          <p className="shipping-text">
                            <strong>{address.recipientName}</strong><br />
                            {address.street}<br />
                            {address.city}, {address.state} {address.postalCode}<br />
                            {address.country}
                          </p>
                        </div>

                        <div className="shipping-info-block">
                          <div className="meta-block-title">
                            <CreditCard size={15} />
                            <span>Payment & Billing</span>
                          </div>
                          <p className="shipping-text">
                            Method: <strong>{order.paymentMethod}</strong><br />
                            Payment Status: <strong style={{ color: order.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>{order.paymentStatus}</strong><br />
                            Courier: Lumina Global Express
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
