import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../api.js';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onNotify }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      let res;
      if (isRegister) {
        res = await api.register(formData.name, formData.email, formData.password, formData.role);
        onNotify('Account created! Welcome to Lumina.', 'success');
      } else {
        res = await api.login(formData.email, formData.password);
        onNotify(`Welcome back, ${res.user.name}!`, 'success');
      }

      localStorage.setItem('token', res.token);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-click Demo logins
  const handleQuickDemo = async (role) => {
    setErrorMsg('');
    try {
      setLoading(true);
      const email = role === 'ADMIN' ? 'admin@store.com' : 'customer@store.com';
      const password = role === 'ADMIN' ? 'adminpassword123' : 'customerpassword123';

      const res = await api.login(email, password);
      localStorage.setItem('token', res.token);
      onNotify(`Logged in as demo ${role.toLowerCase()}!`, 'success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        <div className="auth-modal-content">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-brand-badge">
              <Sparkles size={16} />
              <span>LUMINA MEMBERSHIP</span>
            </div>
            <h2>{isRegister ? 'Join Lumina' : 'Welcome Back'}</h2>
            <p>
              {isRegister
                ? 'Create an account to track shipments, save cart, and unlock express checkout.'
                : 'Sign in to access your orders, cart, and dashboard.'}
            </p>
          </div>

          {/* Quick Demo Login Buttons */}
          <div className="demo-accounts-box">
            <span className="demo-box-label">Quick Testing One-Click Login:</span>
            <div className="demo-buttons-row">
              <button
                type="button"
                className="btn-demo-pill demo-admin"
                onClick={() => handleQuickDemo('ADMIN')}
                disabled={loading}
              >
                <ShieldCheck size={14} />
                <span>👑 Sign in as Admin</span>
              </button>

              <button
                type="button"
                className="btn-demo-pill demo-customer"
                onClick={() => handleQuickDemo('USER')}
                disabled={loading}
              >
                <User size={14} />
                <span>👤 Sign in as Customer</span>
              </button>
            </div>
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              {errorMsg}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Alex Mercer"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">Customer Account</option>
                  <option value="ADMIN">Store Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-auth-submit"
              disabled={loading}
            >
              <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Switch tab */}
          <div className="auth-toggle-wrap">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setIsRegister(false)}
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setIsRegister(true)}
                >
                  Register now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
