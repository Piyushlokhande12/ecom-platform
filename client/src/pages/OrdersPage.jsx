import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { api } from '../api/api.js';
import OrderCard from '../components/orders/OrderCard.jsx';

export default function OrdersPage({ onBackToStore }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
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

        {/* Content body */}
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
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrders[order.id] !== false}
                onToggleExpand={() => toggleExpand(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
