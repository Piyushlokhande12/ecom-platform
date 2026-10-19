import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="hero-pill-icon" />
            <span>Next-Gen Autumn Flagship Release 2026</span>
          </div>

          <h1 className="hero-headline">
            Engineered for <span className="gradient-text">Uncompromising</span> Performance.
          </h1>

          <p className="hero-description">
            Experience next-level craftsmanship. From aerospace titanium flagships to carbon ultrabooks and studio acoustic engineering — built for creators, innovators, and power users.
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={onExploreClick}>
              <span>Explore Collection</span>
              <ArrowRight size={18} />
            </button>
            <div className="hero-delivery-badge">
              <Truck size={18} color="var(--accent-pink)" />
              <div>
                <strong>Free Express Shipping</strong>
                <p>On all orders above $100</p>
              </div>
            </div>
          </div>

          <div className="hero-perks">
            <div className="perk-item">
              <CheckCircle2 size={16} color="var(--success)" />
              <span>100% Genuine Certified</span>
            </div>
            <div className="perk-item">
              <Zap size={16} color="var(--warning)" />
              <span>Real-time Neon DB Sync</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={16} color="var(--info)" />
              <span>2-Year Comprehensive Warranty</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-glow"></div>
          <div className="hero-showcase-card">
            <img
              src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
              alt="Apex Pro Titanium Flagship"
              className="hero-showcase-img"
            />
            <div className="hero-floating-badge badge-top-right">
              <span className="floating-badge-tag">FEATURED</span>
              <strong>Apex Titanium 5G</strong>
              <span className="floating-badge-price">$1,199.99</span>
            </div>
            <div className="hero-floating-badge badge-bottom-left">
              <div className="stock-pulse-indicator"></div>
              <span>Active Inventory Synced</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
