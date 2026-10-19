import React from 'react';
import { Star, ShoppingCart, Eye, Sparkles, AlertCircle } from 'lucide-react';

export default function ProductList({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  onProductClick,
  onAddToCart,
  loading,
  searchQuery,
  onClearSearch
}) {
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

  return (
    <section className="catalog-section" id="catalog">
      <div className="container">
        {/* Controls Bar: Category Pills + Sort Dropdown */}
        <div className="catalog-header-bar">
          <div className="category-pills-scroll">
            <button
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => onSelectCategory('all')}
            >
              All Gear
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="catalog-sort-wrapper">
            <label className="sort-label">Sort by:</label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="catalog-sort-select"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Search Notification */}
        {searchQuery && (
          <div className="search-filter-banner">
            <span>Showing results matching <strong>"{searchQuery}"</strong></span>
            <button onClick={onClearSearch} className="btn-clear-filter">
              Reset search
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {loading ? (
          <div className="product-grid-loading">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-card skeleton-card"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="product-empty-state">
            <AlertCircle size={48} color="var(--text-muted)" />
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or switching categories.</p>
            {searchQuery && (
              <button onClick={onClearSearch} className="btn btn-secondary" style={{ marginTop: 12 }}>
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const imageList = parseImages(product.images);
              const mainImg = imageList[0];
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <div
                  key={product.id}
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
                        <span className="rating-score">{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="reviews-count">({product.reviewsCount || 12})</span>
                    </div>

                    <p className="product-card-desc">
                      {product.description.length > 85
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
                          onAddToCart(product);
                        }}
                      >
                        <ShoppingCart size={16} />
                        <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
