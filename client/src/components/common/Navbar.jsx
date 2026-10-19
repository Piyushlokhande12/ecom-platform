import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, User, Package, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery
}) {
  const { user, logout, setIsAuthOpen } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setCurrentView('store')}>
          <div className="brand-logo-icon">
            <Sparkles size={20} color="#fff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">LUMINA</span>
            <span className="brand-badge">TECH</span>
          </div>
        </div>

        {/* Search Bar */}
        {currentView === 'store' && (
          <div className="navbar-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search flagship phones, ultrabooks, acoustics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Admin Navigation Button */}
          {user && user.role === 'ADMIN' && (
            <button
              className={`btn ${currentView === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-admin-nav`}
              onClick={() => setCurrentView(currentView === 'admin' ? 'store' : 'admin')}
            >
              <ShieldCheck size={17} />
              <span>{currentView === 'admin' ? 'Back to Store' : 'Admin Panel'}</span>
            </button>
          )}

          {/* Orders Link */}
          {user && currentView !== 'admin' && (
            <button
              className={`nav-icon-btn ${currentView === 'orders' ? 'active' : ''}`}
              onClick={() => setCurrentView('orders')}
              title="My Orders"
            >
              <Package size={20} />
              <span className="nav-btn-label">Orders</span>
            </button>
          )}

          {/* Cart Trigger */}
          {currentView !== 'admin' && (
            <button
              className="nav-icon-btn cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
            >
              <ShoppingBag size={21} />
              {cart.itemCount > 0 && (
                <span className="cart-badge-count">{cart.itemCount}</span>
              )}
              <span className="nav-btn-label">Cart</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <div className="user-profile-menu-container">
              <button
                className="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-circle">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="user-meta-text">
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className="user-role-tag">{user.role}</span>
                </div>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                    <span
                      className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-neutral'}`}
                      style={{ marginTop: 6 }}
                    >
                      {user.role} ACCOUNT
                    </span>
                  </div>

                  <div className="user-dropdown-links">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setCurrentView('orders');
                        setShowUserMenu(false);
                      }}
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setCurrentView('admin');
                          setShowUserMenu(false);
                        }}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="dropdown-divider"></div>

                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        if (currentView === 'admin' || currentView === 'orders') {
                          setCurrentView('store');
                        }
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-signin"
              onClick={() => setIsAuthOpen(true)}
            >
              <User size={17} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
