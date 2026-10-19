import React, { useState, useEffect } from 'react';
import Hero from '../components/common/Hero.jsx';
import ProductList from '../components/product/ProductList.jsx';
import ProductModal from '../components/product/ProductModal.jsx';
import { api } from '../api/api.js';

export default function HomePage({
  searchQuery,
  onClearSearch,
  onInstantBuy
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortOption, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({
        category: selectedCategory,
        sort: sortOption,
        search: searchQuery
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Presentation */}
      {!searchQuery && (
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Catalog & Filter Grid */}
      <ProductList
        products={products}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onProductClick={(p) => setSelectedProduct(p)}
        loading={loading}
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={(prod, qty) => {
            setSelectedProduct(null);
            onInstantBuy(prod, qty);
          }}
        />
      )}
    </div>
  );
}
