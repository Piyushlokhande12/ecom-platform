import React from 'react';
import { ChevronDown, ChevronUp, MapPin, CreditCard } from 'lucide-react';
import OrderStatusStepper from './OrderStatusStepper.jsx';

/**
 * Individual Order summary and expandable items card
 */
export default function OrderCard({ order, isExpanded, onToggleExpand }) {
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

  const parseAddress = (addrRaw) => {
    try {
      if (typeof addrRaw === 'object' && addrRaw !== null) return addrRaw;
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

  const address = parseAddress(order.shippingAddress);

  return (
    <div className="order-card card">
      {/* Order Top Bar */}
      <div className="order-card-header">
        <div className="order-meta-col">
          <div className="order-number-row">
            <span className="order-label">Order #</span>
            <strong className="order-ref">{order.orderNumber}</strong>
            {getStatusBadge(order.status)}
          </div>
          <div className="order-date-text">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
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
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Fulfillment Status Stepper */}
      <OrderStatusStepper status={order.status} />

      {/* Expandable Order Details */}
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
                Payment Status:{' '}
                <strong
                  style={{
                    color:
                      order.paymentStatus === 'PAID'
                        ? 'var(--success)'
                        : 'var(--warning)'
                  }}
                >
                  {order.paymentStatus}
                </strong><br />
                Courier: Lumina Global Express
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
