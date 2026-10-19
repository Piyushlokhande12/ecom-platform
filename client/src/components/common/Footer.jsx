import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Footer({ categories, onSelectCategory, onNavigateStore }) {
  const { setIsAuthOpen } = useAuth();

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        <div className="footer-brand-col">
          <div className="brand-text">
            <span className="brand-title">LUMINA</span>
            <span className="brand-badge">TECH</span>
          </div>
          <p className="footer-tagline">
            Premium smart tech, creator ultrabooks, audiophile acoustics, and wearable electronics. Powered by Neon PostgreSQL and Node.js.
          </p>
        </div>

        <div className="footer-links-col">
          <h4>Store Catalog</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    onSelectCategory(c.slug);
                    onNavigateStore();
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-admin-col">
          <h4>Quick Demo Access</h4>
          <p>Test all customer and administrative features instantly:</p>
          <div className="footer-demo-chips">
            <button
              className="badge badge-info"
              onClick={() => setIsAuthOpen(true)}
            >
              👑 Admin Login (admin@store.com)
            </button>
            <button
              className="badge badge-success"
              onClick={() => setIsAuthOpen(true)}
            >
              👤 Customer Login (customer@store.com)
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Database: Neon PostgreSQL Serverless
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <span>© 2026 LUMINA Technologies Inc. All rights reserved.</span>
          <span>REST API & Prisma ORM Architecture</span>
        </div>
      </div>
    </footer>
  );
}
