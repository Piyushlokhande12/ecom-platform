import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  RotateCcw,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api.js';

export default function AdminDashboard({ onBackToStore, onNotify }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, inventory, customers
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orders Tab filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Product Modal state (Add / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    stock: '',
    categoryId: '',
    images: '',
    description: '',
    featured: false
  });

  // Load all admin data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, categoriesRes, inventoryRes, customersRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getAdminOrders(orderStatusFilter, orderSearchQuery),
          api.getProducts(),
          api.getCategories(),
          api.getInventory(),
          fetch('/api/admin/customers', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then((r) => r.json()).catch(() => ({ data: [] }))
        ]);

      setStats(statsRes);
      setOrders(ordersRes);
      setProducts(productsRes);
      setCategories(categoriesRes);
      setInventory(inventoryRes);
      setCustomers(customersRes.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      onNotify(err.message || 'Failed to refresh admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [orderStatusFilter]);

  // Order status update handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      onNotify(`Order status updated to ${newStatus}`, 'success');
      // Refresh orders and stats
      const [updatedOrders, updatedStats, updatedInventory] = await Promise.all([
        api.getAdminOrders(orderStatusFilter, orderSearchQuery),
        api.getAdminStats(),
        api.getInventory()
      ]);
      setOrders(updatedOrders);
      setStats(updatedStats);
      setInventory(updatedInventory);
    } catch (err) {
      onNotify(err.message || 'Failed to update order status', 'error');
    }
  };

  // Quick Stock adjustment
  const handleStockAdjust = async (productId, delta) => {
    try {
      await api.updateStock(productId, undefined, delta);
      onNotify(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta}`, 'success');
      const updatedInventory = await api.getInventory();
      setInventory(updatedInventory);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      onNotify(err.message || 'Failed to update stock', 'error');
    }
  };

  // Product Create/Edit
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      originalPrice: '',
      stock: 10,
      categoryId: categories[0]?.id || '',
      images: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      description: '',
      featured: false
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    let imgString = prod.images;
    try {
      if (typeof prod.images === 'string' && prod.images.startsWith('[')) {
        const arr = JSON.parse(prod.images);
        imgString = arr[0] || '';
      }
    } catch {
      imgString = prod.images;
    }

    setProductForm({
      name: prod.name,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      stock: prod.stock,
      categoryId: prod.categoryId,
      images: imgString,
      description: prod.description,
      featured: Boolean(prod.featured)
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        stock: parseInt(productForm.stock, 10),
        images: JSON.stringify([productForm.images])
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        onNotify('Product updated successfully', 'success');
      } else {
        await api.createProduct(payload);
        onNotify('New product created successfully', 'success');
      }

      setShowProductModal(false);
      loadDashboardData();
    } catch (err) {
      onNotify(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"?`)) return;
    try {
      await api.deleteProduct(prodId);
      onNotify('Product removed from catalog', 'success');
      loadDashboardData();
    } catch (err) {
      onNotify(err.message || 'Failed to delete product', 'error');
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

  const parseAddress = (addrRaw) => {
    try {
      if (typeof addrRaw === 'object') return addrRaw;
      return JSON.parse(addrRaw);
    } catch {
      return { recipientName: 'Customer', street: addrRaw };
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
                  <span className="kpi-subtext" style={{ color: stats?.lowStockCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
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
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('orders')}>
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
        )}

        {/* Tab 2: Orders & Status Management */}
        {activeTab === 'orders' && (
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
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
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
        )}

        {/* Tab 3: Products Catalog */}
        {activeTab === 'products' && (
          <div className="admin-tab-pane">
            <div className="tab-pane-header">
              <div>
                <h3>Product Catalog Management</h3>
                <p>Manage, add, and edit flagship hardware and accessories.</p>
              </div>

              <button className="btn btn-primary" onClick={handleOpenAddProduct}>
                <Plus size={17} />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="table-responsive card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const img = parseImage(p.images);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product-cell">
                            <img src={img} alt="" className="table-product-thumb" />
                            <div>
                              <strong>{p.name}</strong>
                              <span className="table-product-slug">{p.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.category?.name || 'Category'}</td>
                        <td>
                          <strong>${p.price.toFixed(2)}</strong>
                          {p.originalPrice && (
                            <span className="table-old-price">${p.originalPrice.toFixed(2)}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td>
                          {p.featured ? (
                            <span className="badge badge-info">Featured</span>
                          ) : (
                            <span className="badge badge-neutral">Standard</span>
                          )}
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button
                              className="btn-table-action btn-action-edit"
                              onClick={() => handleOpenEditProduct(p)}
                              title="Edit product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-table-action btn-action-delete"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Inventory & Stock */}
        {activeTab === 'inventory' && (
          <div className="admin-tab-pane">
            <div className="tab-pane-header">
              <div>
                <h3>Real-time Warehouse Inventory</h3>
                <p>Monitor warehouse stock levels, low-stock warnings, and execute quick replenishment.</p>
              </div>
            </div>

            {/* Inventory KPI Summary */}
            <div className="kpi-cards-grid">
              <div className="kpi-card card">
                <span className="kpi-label">Total Stock Units</span>
                <h3 className="kpi-value">{inventory?.summary?.totalStockUnits || 0}</h3>
                <span className="kpi-subtext">Across {inventory?.summary?.totalProducts || 0} items</span>
              </div>

              <div className="kpi-card card">
                <span className="kpi-label">Total Inventory Value</span>
                <h3 className="kpi-value">${inventory?.summary?.totalStockValue?.toFixed(2) || '0.00'}</h3>
                <span className="kpi-subtext">At current retail prices</span>
              </div>

              <div className="kpi-card card">
                <span className="kpi-label">Low Stock (≤ 5)</span>
                <h3 className="kpi-value" style={{ color: 'var(--warning)' }}>
                  {inventory?.summary?.lowStockCount || 0}
                </h3>
                <span className="kpi-subtext">Action recommended</span>
              </div>

              <div className="kpi-card card">
                <span className="kpi-label">Out of Stock (0)</span>
                <h3 className="kpi-value" style={{ color: 'var(--danger)' }}>
                  {inventory?.summary?.outOfStockCount || 0}
                </h3>
                <span className="kpi-subtext">Unavailable to customers</span>
              </div>
            </div>

            {/* Inventory Table with Quick Restock Controls */}
            <div className="table-responsive card" style={{ marginTop: 24 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Unit Price</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Quick Replenish</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory?.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <div className="table-product-slug">{item.category?.name}</div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <strong className="stock-number">{item.stock}</strong> units
                      </td>
                      <td>
                        <span className={`badge ${
                          item.status === 'OUT_OF_STOCK' ? 'badge-danger' :
                          item.status === 'LOW_STOCK' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="replenish-actions-group">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStockAdjust(item.id, -1)}
                            disabled={item.stock <= 0}
                            title="Decrement 1 unit"
                          >
                            -1
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStockAdjust(item.id, 5)}
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStockAdjust(item.id, 10)}
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Customers */}
        {activeTab === 'customers' && (
          <div className="admin-tab-pane">
            <div className="tab-pane-header">
              <div>
                <h3>Registered Customers</h3>
                <p>View customer accounts, lifetime spending, and order history.</p>
              </div>
            </div>

            <div className="table-responsive card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Orders Count</th>
                    <th>Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>{c.ordersCount || c.totalOrders || 0}</td>
                      <td><strong>${(c.totalSpent || 0).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Sale Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price ($) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    required
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  className="form-input"
                  required
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                />
                <label htmlFor="featured-checkbox" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>
                  Mark as Featured Product (Highlights on Homepage)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
