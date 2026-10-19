import React from 'react';

export default function AdminInventory({ inventory, onStockAdjust }) {
  return (
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
                  <span
                    className={`badge ${
                      item.status === 'OUT_OF_STOCK'
                        ? 'badge-danger'
                        : item.status === 'LOW_STOCK'
                        ? 'badge-warning'
                        : 'badge-success'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className="replenish-actions-group">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onStockAdjust(item.id, -1)}
                      disabled={item.stock <= 0}
                      title="Decrement 1 unit"
                    >
                      -1
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onStockAdjust(item.id, 5)}
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onStockAdjust(item.id, 10)}
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
  );
}
