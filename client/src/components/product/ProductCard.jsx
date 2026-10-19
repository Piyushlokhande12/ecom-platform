import React from 'react';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductCard({ product, onProductClick }) {
  const { addToCart } = useCart();

  const parseImages = (imagesRaw) => {
    try {
      if (Array.isArray(imagesRaw)) return imagesRaw;
      if (typeof imagesRaw === 'string' && imagesRaw.startsWith('[')) {
        return JSON.parse(imagesRaw);
      }
      return [imagesRaw || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'];
    } catch {
      return ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'];
    }
  };

  const imageList = parseImages(product.images);
  const mainImg = imageList[0];
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      className="product-card card-hover"
      onClick={() => onProductClick(product)}
    >
      {/* Card Thumbnail */}
      <div className="product-thumbnail-box">
        <img
          src={mainImg}
          alt={product.name}
          className="product-thumbnail-img"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="product-badges-overlay">
          {product.featured && (
            <span className="badge badge-featured">
              <Sparkles size={11} /> Featured
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="badge badge-discount">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Alert Badge */}
        <div className="product-stock-tag">
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-warning">Only {product.stock} left</span>
          ) : (
            <span className="badge badge-success">In Stock</span>
          )}
        </div>

        <button
          className="quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onProductClick(product);
          }}
          title="Quick View"
        >
          <Eye size={16} /> Quick View
        </button>
      </div>

      {/* Card Body */}
      <div className="product-card-body">
        <div className="product-card-category">
          {product.category?.name || 'Electronics'}
        </div>

        <h3 className="product-card-title">{product.name}</h3>

        <div className="product-card-rating">
          <div className="stars-row">
            <Star size={14} className="star-filled" />
            <span className="rating-score">{product.rating?.toFixed(1) || '4.8'}</span>
          </div>
          <span className="reviews-count">({product.reviewsCount || 12})</span>
        </div>

        <p className="product-card-desc">
          {product.description?.length > 85
            ? `${product.description.slice(0, 85)}...`
            : product.description}
        </p>

        <div className="product-card-footer">
          <div className="product-price-block">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button
            className="btn btn-primary btn-add-cart"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
