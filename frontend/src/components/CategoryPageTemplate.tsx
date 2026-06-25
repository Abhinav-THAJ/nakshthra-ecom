'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, SlidersHorizontal, ChevronDown, Heart, Star, Home } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
  metal?: string;
  deliveryTime?: string;
}

interface FilterOption {
  label: string;
  options: string[];
}

interface CategoryPageTemplateProps {
  categoryName: string;
  categorySlug: string;
  breadcrumb?: string[];
  subtitle?: string;
  bannerImage?: string;
  products: Product[];
  filters?: FilterOption[];
}

const defaultFilters: FilterOption[] = [
  { label: 'Metal Type', options: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Silver'] },
  { label: 'Stone Type', options: ['Diamond', 'Gemstone', 'Pearl', 'Navratna', 'No Stone'] },
  { label: 'Price Range', options: ['Under ₹10k', '₹10k–20k', '₹20k–30k', '₹30k–50k', 'Above ₹50k'] },
  { label: 'Style', options: ['Casual', 'Bridal', 'Festive', 'Everyday', 'Office Wear'] },
  { label: 'Rating', options: ['4★ & above', '3★ & above'] },
];

const sortOptions = ['Popularity', 'Price: Low to High', 'Price: High to Low', 'New Arrivals', 'Discount'];

export default function CategoryPageTemplate({
  categoryName,
  categorySlug,
  breadcrumb = [],
  subtitle,
  bannerImage,
  products,
  filters = defaultFilters,
}: CategoryPageTemplateProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('Popularity');
  const [showSort, setShowSort] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(filters[0]?.label ?? null);

  const toggleFilter = (label: string, option: string) => {
    setActiveFilters((prev) => {
      const current = prev[label] ?? [];
      const updated = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [label]: updated };
    });
  };

  const activeCount = Object.values(activeFilters).flat().length;

  return (
    <>
      <Header />
      <main className="cat-page-main">
        {/* Breadcrumb */}
        <div className="cat-breadcrumb container">
          <Link href="/" className="bc-link"><Home size={13} /> Home</Link>
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              <span className="bc-sep">›</span>
              <span className="bc-link">{crumb}</span>
            </React.Fragment>
          ))}
          <span className="bc-sep">›</span>
          <span className="bc-current">{categoryName}</span>
        </div>

        {/* Hero Banner */}
        {bannerImage && (
          <div className="cat-hero-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
            <div className="cat-hero-overlay">
              <h1 className="cat-hero-title">{categoryName}</h1>
              {subtitle && <p className="cat-hero-sub">{subtitle}</p>}
            </div>
          </div>
        )}

        {!bannerImage && (
          <div className="cat-title-bar container">
            <div>
              <h1 className="cat-page-title">{categoryName}</h1>
              {subtitle && <p className="cat-page-sub">{subtitle}</p>}
            </div>
            <span className="cat-count">{products.length} Designs</span>
          </div>
        )}

        {/* Main layout: Sidebar + Grid */}
        <div className="cat-body container">
          {/* Sidebar Filters */}
          <aside className="cat-sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title"><Filter size={15} /> Filters</span>
              {activeCount > 0 && (
                <button
                  className="clear-filters-btn"
                  onClick={() => setActiveFilters({})}
                >
                  Clear All ({activeCount})
                </button>
              )}
            </div>

            {filters.map((filter) => (
              <div key={filter.label} className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => setExpandedFilter(expandedFilter === filter.label ? null : filter.label)}
                >
                  <span>{filter.label}</span>
                  <ChevronDown
                    size={15}
                    className={expandedFilter === filter.label ? 'rotated' : ''}
                  />
                </button>
                {expandedFilter === filter.label && (
                  <ul className="filter-options">
                    {filter.options.map((opt) => {
                      const checked = activeFilters[filter.label]?.includes(opt);
                      return (
                        <li key={opt}>
                          <label className={`filter-opt-label ${checked ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!!checked}
                              onChange={() => toggleFilter(filter.label, opt)}
                            />
                            {opt}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </aside>

          {/* Product Grid */}
          <div className="cat-content">
            {/* Sort Bar */}
            <div className="cat-sort-bar">
              <p className="cat-result-count">{products.length} results</p>
              <div className="sort-dropdown-wrapper">
                <button className="sort-trigger" onClick={() => setShowSort(!showSort)}>
                  <SlidersHorizontal size={14} /> Sort: <strong>{sortBy}</strong> <ChevronDown size={13} />
                </button>
                {showSort && (
                  <ul className="sort-dropdown">
                    {sortOptions.map((opt) => (
                      <li
                        key={opt}
                        className={opt === sortBy ? 'active' : ''}
                        onClick={() => { setSortBy(opt); setShowSort(false); }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Active filter pills */}
            {activeCount > 0 && (
              <div className="active-filters-row">
                {Object.entries(activeFilters).flatMap(([label, vals]) =>
                  vals.map((v) => (
                    <span key={`${label}-${v}`} className="filter-pill">
                      {v}
                      <button onClick={() => toggleFilter(label, v)}>×</button>
                    </span>
                  ))
                )}
              </div>
            )}

            {/* Products */}
            <div className="cat-products-grid">
              {products.map((prod) => {
                const discount = prod.oldPrice
                  ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)
                  : 0;
                return (
                  <div key={prod.id} className="product-card-wrapper">
                    <div className="product-image-box">
                      {prod.isNew && <span className="badge new-badge">NEW</span>}
                      {discount > 0 && <span className="badge discount-badge">Flat {discount}% Off</span>}
                      {prod.isBestseller && !prod.isNew && (
                        <span className="badge bestseller-badge">Bestseller</span>
                      )}
                      <button className="wishlist-btn-card">
                        <Heart size={17} color="#888" />
                      </button>
                      <img src={prod.image} alt={prod.name} />
                      <div className="try-at-home-bar">Book Try At Home</div>
                    </div>
                    <div className="product-info">
                      <div className="rating-row flex">
                        <div className="rating-box flex-center">
                          <span>{prod.rating}</span>
                          <Star size={11} fill="#ffb300" color="#ffb300" />
                        </div>
                        <span className="reviews-text">({prod.reviews} reviews)</span>
                      </div>
                      <h3 className="product-title">{prod.name}</h3>
                      <div className="price-row flex">
                        <span className="current-price">₹{prod.price.toLocaleString('en-IN')}</span>
                        {prod.oldPrice && (
                          <span className="old-price">₹{prod.oldPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <div className="delivery-row">
                        <p>Express Delivery: <span>{prod.deliveryTime ?? 'Tomorrow'}</span></p>
                      </div>
                      <button className="add-to-cart-btn-card">Add to Cart</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
