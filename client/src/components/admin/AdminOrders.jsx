import React from 'react';
import { Package } from 'lucide-react';

export default function AdminOrders({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  onStatusChange
}) {
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

  const parseAddress = (addrRaw) => {
    try {
      if (typeof addrRaw === 'object') return addrRaw;
      return JSON.parse(addrRaw);
    } catch {
      return { recipientName: 'Customer', street: addrRaw };
    }
  };

  return (
    <div className="admin-tab-pane">
      <div className="tab-pane-header">
        <div>
          <h3>Order Status Management</h3>
          <p>Filter, view details, and change lifecycle status in real-time.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-filter-buttons">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              className={`status-filter-btn ${orderStatusFilter === st ? 'active' : ''}`}
              onClick={() => setOrderStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-manage-list">
        {orders.length === 0 ? (
          <div className="card empty-orders-pane">
            <Package size={44} color="var(--text-muted)" />
            <h4>No orders matching "{orderStatusFilter}"</h4>
            <p>Change your filter above to view all orders.</p>
          </div>
        ) : (
          orders.map((ord) => {
            const addr = parseAddress(ord.shippingAddress);

            return (
              <div key={ord.id} className="order-manage-card card">
                <div className="manage-card-header">
                  <div className="manage-order-id-group">
                    <span className="order-id-title">{ord.orderNumber}</span>
                    <span className="order-date-sub">
                      {new Date(ord.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="manage-status-selector">
                    <label className="status-dropdown-label">Order Status:</label>
                    <select
                      value={ord.status}
                      onChange={(e) => onStatusChange(ord.id, e.target.value)}
                      className={`order-status-select select-${ord.status.toLowerCase()}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="manage-card-body">
                  {/* Customer & Address */}
                  <div className="manage-customer-col">
                    <h5>Customer & Shipping</h5>
                    <p>
                      <strong>{ord.user?.name || addr.recipientName}</strong><br />
                      Email: {ord.user?.email}<br />
                      Phone: {addr.phone || 'N/A'}<br />
                      Address: {addr.street}, {addr.city}, {addr.postalCode}
                    </p>
                  </div>

                  {/* Items ordered */}
                  <div className="manage-items-col">
                    <h5>Items ({ord.items?.length || 0})</h5>
                    <div className="manage-items-mini-list">
                      {ord.items?.map((it) => (
                        <div key={it.id} className="manage-item-chip">
                          <img
                            src={parseImage(it.product?.images)}
                            alt=""
                            className="mini-thumb"
                          />
                          <div className="mini-info">
                            <span>{it.product?.name}</span>
                            <strong>{it.quantity}x @ ${it.price.toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Total */}
                  <div className="manage-total-col">
                    <span className="manage-payment-method">
                      Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                    </span>
                    <div className="manage-grand-total">
                      <span>Total Charged:</span>
                      <h3>${ord.totalAmount.toFixed(2)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
