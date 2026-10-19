import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw, AlertTriangle, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductModal({
  product,
  onClose,
  onBuyNow
}) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const parseImages = (imagesRaw) => {
    try {
      if (Array.isArray(imagesRaw)) return imagesRaw;
      if (typeof imagesRaw === 'string' && imagesRaw.startsWith('[')) {
        return JSON.parse(imagesRaw);
      }
      return [imagesRaw || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'];
    } catch {
      return ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'];
    }
  };

  const images = parseImages(product.images);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog product-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        <div className="product-modal-grid">
          {/* Left: Gallery */}
          <div className="product-modal-gallery">
            <div className="modal-main-image-wrap">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="modal-main-image"
              />
            </div>
            {images.length > 1 && (
              <div className="modal-thumbnails-row">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    className={`modal-thumb-btn ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase */}
          <div className="product-modal-details">
            <span className="badge badge-info modal-cat-badge">
              {product.category?.name || 'Flagship Product'}
            </span>

            <h2 className="modal-product-title">{product.name}</h2>

            <div className="modal-rating-row">
              <div className="stars-row">
                <Star size={16} className="star-filled" />
                <strong>{product.rating?.toFixed(1) || '4.8'}</strong>
              </div>
              <span className="bullet-sep">•</span>
              <span className="modal-reviews-text">
                {product.reviewsCount || 12} Verified Customer Reviews
              </span>
            </div>

            {/* Price section */}
            <div className="modal-price-box">
              <span className="modal-current-price">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="modal-original-price">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="badge badge-discount">
                    SAVE ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="modal-stock-indicator">
              {isOutOfStock ? (
                <div className="stock-status-line status-out">
                  <AlertTriangle size={17} />
                  <span>Currently Out of Stock. Join waitlist.</span>
                </div>
              ) : isLowStock ? (
                <div className="stock-status-line status-low">
                  <AlertTriangle size={17} />
                  <span>Hurry! Only {product.stock} units left in stock.</span>
                </div>
              ) : (
                <div className="stock-status-line status-in">
                  <Check size={17} />
                  <span>In Stock — Available for immediate dispatch ({product.stock} units)</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="modal-desc-box">
              <h4>Overview</h4>
              <p>{product.description}</p>
            </div>

            {/* Purchase Controls */}
            {!isOutOfStock && (
              <div className="modal-purchase-controls">
                <div className="quantity-selector-wrap">
                  <label className="qty-label">Quantity:</label>
                  <div className="qty-counter">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="modal-action-buttons">
                  <button
                    className="btn btn-primary btn-modal-cart"
                    onClick={() => {
                      addToCart(product, quantity);
                      onClose();
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-modal-buy"
                    onClick={() => {
                      onBuyNow(product, quantity);
                    }}
                  >
                    <Zap size={18} />
                    <span>Instant Checkout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Perks Guarantee */}
            <div className="modal-perks-list">
              <div className="modal-perk">
                <Truck size={17} color="var(--accent-primary)" />
                <span>Free delivery on orders over $100</span>
              </div>
              <div className="modal-perk">
                <RotateCcw size={17} color="var(--accent-pink)" />
                <span>30-Day Hassle-Free Returns</span>
              </div>
              <div className="modal-perk">
                <ShieldCheck size={17} color="var(--success)" />
                <span>2-Year Lumina Elite Care Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
