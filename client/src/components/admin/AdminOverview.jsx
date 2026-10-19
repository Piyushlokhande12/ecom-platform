import React from 'react';
import { DollarSign, Package, Layers, AlertTriangle } from 'lucide-react';

export default function AdminOverview({ stats, categories, onNavigateOrders }) {
  return (
    <div className="admin-tab-pane">
      {/* KPI Cards Row */}
      <div className="kpi-cards-grid">
        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-revenue">
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Gross Revenue</span>
            <h3 className="kpi-value">${stats?.revenue?.toFixed(2) || '0.00'}</h3>
            <span className="kpi-subtext">From confirmed customer orders</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-orders">
            <Package size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Orders</span>
            <h3 className="kpi-value">{stats?.totalOrders || 0}</h3>
            <span className="kpi-subtext">Lifetime store checkouts</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-products">
            <Layers size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Catalog Products</span>
            <h3 className="kpi-value">{stats?.totalProducts || 0}</h3>
            <span className="kpi-subtext">Across {categories.length} active categories</span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-icon-wrap icon-stock">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Low Stock Alerts</span>
            <h3 className="kpi-value">{stats?.lowStockCount || 0}</h3>
            <span
              className="kpi-subtext"
              style={{ color: stats?.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}
            >
              {stats?.lowStockCount > 0 ? 'Requires immediate restock' : 'All inventory healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Breakdown Chips */}
      <div className="orders-breakdown-card card" style={{ marginTop: 24 }}>
        <h4>Order Status Distribution</h4>
        <div className="status-chips-row">
          <div className="status-chip-box">
            <span className="chip-count">{stats?.statusCounts?.PENDING || 0}</span>
            <span className="badge badge-neutral">Pending</span>
          </div>
          <div className="status-chip-box">
            <span className="chip-count">{stats?.statusCounts?.PROCESSING || 0}</span>
            <span className="badge badge-warning">Processing</span>
          </div>
          <div className="status-chip-box">
            <span className="chip-count">{stats?.statusCounts?.SHIPPED || 0}</span>
            <span className="badge badge-info">Shipped</span>
          </div>
          <div className="status-chip-box">
            <span className="chip-count">{stats?.statusCounts?.DELIVERED || 0}</span>
            <span className="badge badge-success">Delivered</span>
          </div>
          <div className="status-chip-box">
            <span className="chip-count">{stats?.statusCounts?.CANCELLED || 0}</span>
            <span className="badge badge-danger">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="admin-section-box card" style={{ marginTop: 24 }}>
        <div className="section-box-header">
          <h4>Recent Orders</h4>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateOrders}>
            View All Orders
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((ord) => (
                  <tr key={ord.id}>
                    <td><strong>{ord.orderNumber}</strong></td>
                    <td>{ord.user?.name || ord.user?.email}</td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        ord.status === 'DELIVERED' ? 'badge-success' :
                        ord.status === 'PROCESSING' ? 'badge-warning' :
                        ord.status === 'SHIPPED' ? 'badge-info' :
                        ord.status === 'CANCELLED' ? 'badge-danger' : 'badge-neutral'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>{ord._count?.items || 1} items</td>
                    <td><strong>${ord.totalAmount?.toFixed(2)}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
