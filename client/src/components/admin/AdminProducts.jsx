import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../api/api.js';

export default function AdminProducts({
  products,
  categories,
  onRefresh,
  onNotify
}) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    stock: 10,
    categoryId: '',
    images: '',
    description: '',
    featured: false
  });

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
      onRefresh();
    } catch (err) {
      onNotify(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"?`)) return;
    try {
      await api.deleteProduct(prodId);
      onNotify('Product removed from catalog', 'success');
      onRefresh();
    } catch (err) {
      onNotify(err.message || 'Failed to delete product', 'error');
    }
  };

  return (
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
                    <span
                      className={`badge ${
                        p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'
                      }`}
                    >
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
