import React from 'react';
import { AlertCircle } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function ProductList({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  onProductClick,
  loading,
  searchQuery,
  onClearSearch
}) {
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
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
