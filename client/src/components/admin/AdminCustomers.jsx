import React from 'react';
import { Users } from 'lucide-react';

export default function AdminCustomers({ customers = [] }) {
  return (
    <div className="admin-tab-pane">
      <div className="tab-pane-header">
        <div>
          <h3>Registered Customers</h3>
          <p>View customer accounts, lifetime spending, and order history.</p>
        </div>
      </div>

      <div className="table-responsive card">
        {customers.length === 0 ? (
          <div className="empty-orders-pane" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <Users size={40} color="var(--text-muted)" />
            <h4>No customer records found</h4>
            <p>Customer accounts will appear here once registered.</p>
          </div>
        ) : (
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
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.email}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.ordersCount || 0}</td>
                  <td>
                    <strong>${(c.totalSpent || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
