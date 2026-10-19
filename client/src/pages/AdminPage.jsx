import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Layers,
  ArrowLeft,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api/api.js';
import AdminOverview from '../components/admin/AdminOverview.jsx';
import AdminOrders from '../components/admin/AdminOrders.jsx';
import AdminProducts from '../components/admin/AdminProducts.jsx';
import AdminInventory from '../components/admin/AdminInventory.jsx';
import AdminCustomers from '../components/admin/AdminCustomers.jsx';

export default function AdminPage({ onBackToStore, onNotify }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  useEffect(() => {
    loadDashboardData();
  }, [orderStatusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, categoriesRes, inventoryRes, customersRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getAdminOrders(orderStatusFilter),
          api.getProducts(),
          api.getCategories(),
          api.getInventory(),
          api.getAdminCustomers().catch(() => ({ data: [] }))
        ]);

      setStats(statsRes);
      setOrders(ordersRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setInventory(inventoryRes);
      setCustomers(customersRes.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      if (onNotify) onNotify(err.message || 'Failed to refresh admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      if (onNotify) onNotify(`Order status updated to ${newStatus}`, 'success');
      const [updatedOrders, updatedStats, updatedInventory] = await Promise.all([
        api.getAdminOrders(orderStatusFilter),
        api.getAdminStats(),
        api.getInventory()
      ]);
      setOrders(updatedOrders);
      setStats(updatedStats);
      setInventory(updatedInventory);
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleStockAdjust = async (productId, delta) => {
    try {
      await api.updateStock(productId, undefined, delta);
      if (onNotify) onNotify(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta}`, 'success');
      const updatedInventory = await api.getInventory();
      setInventory(updatedInventory);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to update stock', 'error');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Top Banner / Navigation */}
      <div className="admin-header-bar">
        <div className="container admin-header-inner">
          <div className="admin-title-wrap">
            <button className="btn btn-secondary btn-back-store" onClick={onBackToStore}>
              <ArrowLeft size={16} />
              <span>Back to Storefront</span>
            </button>
            <div className="admin-title-text">
              <h2>Lumina Command Center</h2>
              <span className="badge badge-info">
                <ShieldCheck size={12} /> Administrator Active
              </span>
            </div>
          </div>

          <div className="admin-top-actions">
            <button className="btn btn-secondary" onClick={loadDashboardData} title="Refresh Live Data">
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              <span>Sync Database</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container admin-main-layout">
        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <DollarSign size={17} />
            <span>Overview & KPIs</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={17} />
            <span>Order Management</span>
            {orders.length > 0 && <span className="tab-counter">{orders.length}</span>}
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={17} />
            <span>Products Catalog</span>
            <span className="tab-counter">{products.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <AlertTriangle size={17} />
            <span>Inventory & Stock</span>
            {stats?.lowStockCount > 0 && (
              <span className="tab-counter counter-warning">{stats.lowStockCount} alert</span>
            )}
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={17} />
            <span>Customers</span>
            <span className="tab-counter">{customers.length}</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <AdminOverview
            stats={stats}
            categories={categories}
            onNavigateOrders={() => setActiveTab('orders')}
          />
        )}

        {/* Tab 2: Orders & Status Management */}
        {activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Tab 3: Products Catalog */}
        {activeTab === 'products' && (
          <AdminProducts
            products={products}
            categories={categories}
            onRefresh={loadDashboardData}
            onNotify={onNotify}
          />
        )}

        {/* Tab 4: Inventory & Stock */}
        {activeTab === 'inventory' && (
          <AdminInventory
            inventory={inventory}
            onStockAdjust={handleStockAdjust}
          />
        )}

        {/* Tab 5: Customers */}
        {activeTab === 'customers' && (
          <AdminCustomers customers={customers} />
        )}
      </div>
    </div>
  );
}
