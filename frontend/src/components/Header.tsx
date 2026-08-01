'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, Heart, ShoppingCart, User, X, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MobileCategories from './MobileCategories';
import AuthModal from './AuthModal';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface Suggestion {
  products: { id: string; name: string; price: number; category: string }[];
  categories: { slug: string; label: string }[];
}

interface MenuData {
  featured: string[];
  styles: string[];
  metalStone: { name: string; class: string }[];
  prices: string[];
  promos: { image: string; title: string }[];
  filters: string[];
}

const menuConfigs: Record<string, MenuData> = {
  'Rings': {
    featured: ['Latest Designs', 'Bestsellers'],
    styles: ['Finger Rings'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Diamond & Blue Stone', class: 'gemstone-dot' },
      { name: 'Diamond & Red Stone', class: 'rose-gold-dot' },
      { name: 'Diamond & Green Stone', class: 'navratna-dot' }
    ],
    prices: ['₹ 20,000 - ₹ 30,000', '₹ 30,000 - ₹ 40,000', '₹ 40,000 - ₹ 50,000'],
    promos: [
      { image: '/product_ring.png', title: 'Diamond Rings' },
      { image: '/product_solitaire.png', title: 'Luxury Rings' }
    ],
    filters: ['For Women']
  },
  'Earrings': {
    featured: ['Latest Designs', 'Bestsellers'],
    styles: ['Nose Pins', 'Studs'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Diamond & Blue Stone', class: 'gemstone-dot' },
      { name: 'Diamond & Red Stone', class: 'rose-gold-dot' },
      { name: 'Diamond & Green Stone', class: 'navratna-dot' }
    ],
    prices: ['₹ 20,000 - ₹ 30,000', '₹ 30,000 - ₹ 40,000', '₹ 40,000 - ₹ 50,000'],
    promos: [
      { image: '/menu_switch.png', title: 'Diamond Studs' },
      { image: '/menu_hoops.png', title: 'Nose Pins' }
    ],
    filters: ['For Women']
  },
  'Bracelets & Bangles': {
    featured: ['Latest Designs', 'Bestsellers'],
    styles: ['Bangles', 'Bracelets'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Diamond & Blue Stone', class: 'gemstone-dot' },
      { name: 'Diamond & Red Stone', class: 'rose-gold-dot' },
      { name: 'Diamond & Green Stone', class: 'navratna-dot' }
    ],
    prices: ['₹ 20,000 - ₹ 30,000', '₹ 30,000 - ₹ 40,000', '₹ 40,000 - ₹ 50,000'],
    promos: [
      { image: '/product_bracelet.png', title: 'Diamond Bangles' },
      { image: '/product_mangalsutra.png', title: 'Charm Bracelets' }
    ],
    filters: ['For Women']
  },
  'Necklaces & Pendants': {
    featured: ['Latest Designs', 'Bestsellers'],
    styles: ['Necklaces', 'Pendants'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Diamond & Blue Stone', class: 'gemstone-dot' },
      { name: 'Diamond & Red Stone', class: 'rose-gold-dot' },
      { name: 'Diamond & Green Stone', class: 'navratna-dot' }
    ],
    prices: ['₹ 20,000 - ₹ 30,000', '₹ 30,000 - ₹ 40,000', '₹ 40,000 - ₹ 50,000'],
    promos: [
      { image: '/cat_pendant.png', title: 'Diamond Pendants' },
      { image: '/polki_banner.png', title: 'Necklaces' }
    ],
    filters: ['For Women']
  }
};

// Category → page route map
const categoryRoutes: Record<string, string> = {
  'Rings': '/rings',
  'Earrings': '/earrings',
  'Bracelets & Bangles': '/bracelets',
  'Solitaires': '/solitaires',
  'Mangalsutras': '/mangalsutras',
  'Necklaces & Pendants': '/necklaces',
  'Silver by Shaya': '/silver',
  'Gifting': '/gifting',
  'Collections': '/collections',
  'Trending': '/trending',
};

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [pinCode]                                   = useState('682303');
  const [isMenuOpen, setIsMenuOpen]                 = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen]       = useState(false);
  const [activeCategory, setActiveCategory]         = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen]     = useState(false);

  // ── Desktop search ──
  const [searchQuery, setSearchQuery]               = useState('');
  const [suggestions, setSuggestions]               = useState<Suggestion | null>(null);
  const [showSuggestions, setShowSuggestions]       = useState(false);
  const [highlightedIdx, setHighlightedIdx]         = useState(-1);
  const desktopSearchRef                            = useRef<HTMLDivElement>(null);
  const debounceTimer                               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mobile search ──
  const [mobileSearchQuery, setMobileSearchQuery]   = useState('');
  const [mobileSuggestions, setMobileSuggestions]   = useState<Suggestion | null>(null);
  const mobileInputRef                              = useRef<HTMLInputElement>(null);
  const mobileDebounce                              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigate to search results
  const handleSearch = useCallback((q: string) => {
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setSuggestions(null);
    setMobileSuggestions(null);
  }, [router]);

  // Fetch suggestions (desktop)
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (q.trim().length < 2) { setSuggestions(null); setShowSuggestions(false); return; }
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        const data: Suggestion = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
        setHighlightedIdx(-1);
      } catch { /* ignore */ }
    }, 220);
  }, []);

  // Fetch suggestions (mobile)
  const fetchMobileSuggestions = useCallback((q: string) => {
    if (mobileDebounce.current) clearTimeout(mobileDebounce.current);
    if (q.trim().length < 2) { setMobileSuggestions(null); return; }
    mobileDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
        const data: Suggestion = await res.json();
        setMobileSuggestions(data);
      } catch { /* ignore */ }
    }, 220);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Timer ref — used to delay closing so mouse can travel into megamenu
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
    if (!mobileSearchOpen) { setMobileSuggestions(null); setMobileSearchQuery(''); }
  }, [mobileSearchOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileSearchOpen(false); setShowSuggestions(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Build flat suggestion list for keyboard navigation
  const flatSuggestions = [
    ...(suggestions?.categories.map(c => ({ type: 'category' as const, label: c.label, href: `/${c.slug}` })) ?? []),
    ...(suggestions?.products.map(p => ({ type: 'product' as const, label: p.name, sub: p.category, query: p.name })) ?? []),
  ];

  const handleDesktopKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (highlightedIdx >= 0 && flatSuggestions[highlightedIdx]) {
        const item = flatSuggestions[highlightedIdx];
        if (item.type === 'category') router.push(item.href);
        else handleSearch(item.query ?? item.label);
        setShowSuggestions(false);
      } else {
        handleSearch(searchQuery);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, flatSuggestions.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, -1));
    }
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const handleMouseEnter = useCallback((catName: string) => {
    // Cancel any pending close
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategory(catName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Delay close by 120 ms so mouse can move into the dropdown
    closeTimer.current = setTimeout(() => {
      setActiveCategory(null);
    }, 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const categories = [
    { name: 'Rings',                href: '/rings',         hasMenu: true  },
    { name: 'Earrings',             href: '/earrings',      hasMenu: true  },
    { name: 'Bracelets & Bangles',  href: '/bracelets',     hasMenu: true  },
    { name: 'Necklaces & Pendants', href: '/necklaces',     hasMenu: true  },
  ];

  return (
    <header className="header-wrapper">
      {/* Top Announcement Banner */}
      <div className="top-banner">
        <p>
          Introducing Nakshathra Exclusives: Flat 10% Off on your first purchase — Use Code:&nbsp;<span>FIRST10</span>
        </p>
      </div>

      {/* Main Header Row */}
      <div className="main-header">
        <div className="container space-between header-container">

          {/* Mobile Left Icons (Search + User) */}
          <div className="mobile-left-icons flex hide-lg">
            <button
              className="icon-btn flex-center mobile-search-trigger"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={20} color="#C9A96E" />
            </button>
            <div className="icon-btn flex-center" onClick={() => setIsAuthModalOpen(true)} style={{ cursor: 'pointer' }}>
              <User size={20} color="#C9A96E" />
            </div>
          </div>

          {/* Logo */}
          <Link href="/" className="logo-container">
            <Image src="/logo.png" alt="Nakshathra Gold & Diamonds" width={100} height={85} className="logo-image" priority />
          </Link>

          {/* Search */}
          <div className="search-bar-container hide-md" ref={desktopSearchRef}>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search Rings, Earrings, Solitaires, Gold Coins..."
                value={searchQuery}
                autoComplete="off"
                onChange={(e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value); }}
                onFocus={() => { if (suggestions && searchQuery.length >= 2) setShowSuggestions(true); }}
                onKeyDown={handleDesktopKeyDown}
              />
              <button className="search-btn" onClick={() => handleSearch(searchQuery)}>
                <Search size={18} color="#ffffff" />
              </button>
            </div>

            {/* ── Suggestions Dropdown ── */}
            {showSuggestions && suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="search-suggestions-dropdown">
                {/* Category matches */}
                {suggestions.categories.length > 0 && (
                  <div className="sug-section">
                    <p className="sug-label">Categories</p>
                    {suggestions.categories.map((cat, i) => {
                      const idx = i;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/${cat.slug}`}
                          className={`sug-item sug-category${highlightedIdx === idx ? ' sug-highlighted' : ''}`}
                          onClick={() => setShowSuggestions(false)}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                        >
                          <span className="sug-cat-icon"><Tag size={13} /></span>
                          <span className="sug-item-text">{cat.label}</span>
                          <span className="sug-arrow">→</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Product matches */}
                {suggestions.products.length > 0 && (
                  <div className="sug-section">
                    <p className="sug-label">Products</p>
                    {suggestions.products.map((prod, i) => {
                      const idx = (suggestions?.categories.length ?? 0) + i;
                      return (
                        <button
                          key={prod.id}
                          className={`sug-item sug-product${highlightedIdx === idx ? ' sug-highlighted' : ''}`}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                          onClick={() => {
                            router.push(`/product/${prod.id}`);
                            setShowSuggestions(false);
                            setMobileSearchOpen(false);
                          }}
                        >
                          <Search size={13} color="#c8b89a" />
                          <span className="sug-item-text">{prod.name}</span>
                          <span className="sug-item-sub">in {prod.category}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="sug-footer">
                  <button className="sug-all-btn" onClick={() => { handleSearch(searchQuery); }}>
                    See all results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Utility Icons */}
          <div className="utility-container flex">
            <div className="pincode-wrapper flex-center hide-md">
              <MapPin size={16} color="#C9A96E" />
              <div className="pincode-text">
                <span>Delivery to</span>
                <p>{pinCode}</p>
              </div>
            </div>



            <div className="account-wrapper flex-center hide-md" onClick={() => setIsAuthModalOpen(true)} style={{ cursor: 'pointer' }}>
              <User size={20} color="#C9A96E" />
              <span>Login/Signup</span>
            </div>

            <Link href="#wishlist" className="icon-btn flex-center">
              <Heart size={20} color="#C9A96E" />
            </Link>

            <Link href="/cart" className="icon-btn flex-center cart-btn">
              <ShoppingCart size={20} color="#C9A96E" />
              {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`nav-bar ${isMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container nav-container">
          <ul className="nav-links flex">
            {categories.map((cat, idx) => (
              <li
                key={idx}
                className={cat.hasMenu ? 'nav-item-has-menu' : ''}
                onMouseEnter={() => cat.hasMenu && handleMouseEnter(cat.name)}
                onMouseLeave={() => cat.hasMenu && handleMouseLeave()}
              >
                <Link
                  href={cat.href}
                  onClick={() => { setIsMenuOpen(false); setActiveCategory(null); }}
                  className={activeCategory === cat.name ? 'active-link' : ''}
                >
                  {cat.name}
                </Link>

                {/* ── MEGA MENU ── */}
                {cat.hasMenu && activeCategory === cat.name && menuConfigs[cat.name] && (() => {
                  const menu = menuConfigs[cat.name];
                  const route = categoryRoutes[cat.name] ?? cat.href;
                  return (
                    <div
                      className="megamenu-dropdown"
                      onMouseEnter={cancelClose}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="megamenu-container container">
                        <div className="megamenu-columns-wrapper flex">

                          {/* Featured */}
                          <div className="megamenu-column">
                            <h4>Featured</h4>
                            <ul>
                              {menu.featured.map((item, i) => (
                                <li key={i}>
                                  <Link
                                    href={route}
                                    onClick={() => setActiveCategory(null)}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* By Style */}
                          <div className="megamenu-column">
                            <h4>By Style</h4>
                            <ul>
                              {menu.styles.map((item, i) => (
                                <li key={i}>
                                  <Link
                                    href={route}
                                    onClick={() => setActiveCategory(null)}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* By Metal & Stone */}
                          <div className="megamenu-column">
                            <h4>By Metal &amp; Stone</h4>
                            <ul>
                              {menu.metalStone.map((item, i) => (
                                <li key={i}>
                                  <Link
                                    href={route}
                                    className="flex"
                                    onClick={() => setActiveCategory(null)}
                                  >
                                    <span className={`menu-stone-dot ${item.class}`} />
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* By Price */}
                          <div className="megamenu-column">
                            <h4>By Price</h4>
                            <ul>
                              {menu.prices.map((item, i) => (
                                <li key={i}>
                                  <Link
                                    href={route}
                                    onClick={() => setActiveCategory(null)}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Promo Cards */}
                          <div className="megamenu-promo-column flex">
                            {menu.promos.map((item, i) => (
                              <Link
                                key={i}
                                href={route}
                                className="promo-card"
                                onClick={() => setActiveCategory(null)}
                              >
                                <div className="promo-img-wrapper">
                                  <img src={item.image} alt={item.title} />
                                </div>
                                <div className="promo-caption">{item.title}</div>
                              </Link>
                            ))}
                          </div>

                        </div>

                        {/* Footer filters */}
                        <div className="megamenu-footer flex">
                          {menu.filters.map((filter, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="divider" />}
                              <Link
                                href={route}
                                className="footer-filter-link"
                                onClick={() => setActiveCategory(null)}
                              >
                                {filter}
                              </Link>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>

        </div>
      </nav>



      {/* Mobile Categories Scroll & Submenu Overlay */}
      <MobileCategories categories={categories} menuConfigs={menuConfigs} categoryRoutes={categoryRoutes} />

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="mobile-search-overlay" onClick={(e) => { if (e.target === e.currentTarget) setMobileSearchOpen(false); }}>
          <div className="mobile-search-panel">
            {/* Header row */}
            <div className="mobile-search-header">
              <span className="mobile-search-title">Search</span>
              <button className="mobile-search-close" onClick={() => setMobileSearchOpen(false)} aria-label="Close search">
                <X size={22} />
              </button>
            </div>

            {/* Input */}
            <div className="mobile-search-input-row">
              <Search size={18} color="#C9A96E" className="mobile-search-icon-left" />
              <input
                ref={mobileInputRef}
                type="text"
                className="mobile-search-input"
                placeholder="Search rings, earrings, gold..."
                autoComplete="off"
                value={mobileSearchQuery}
                onChange={(e) => { setMobileSearchQuery(e.target.value); fetchMobileSuggestions(e.target.value); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(mobileSearchQuery)}
              />
              {mobileSearchQuery && (
                <button className="mobile-search-clear" onClick={() => { setMobileSearchQuery(''); setMobileSuggestions(null); }} aria-label="Clear">
                  <X size={16} />
                </button>
              )}
              <button
                className="mobile-search-go-btn"
                onClick={() => handleSearch(mobileSearchQuery)}
                aria-label="Search"
              >
                <Search size={16} color="#fff" />
              </button>
            </div>

            {/* ── Mobile live suggestions ── */}
            {mobileSuggestions && (mobileSuggestions.products.length > 0 || mobileSuggestions.categories.length > 0) && (
              <div className="mobile-sug-list">
                {mobileSuggestions.categories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    className="mobile-sug-item"
                    onClick={() => setMobileSearchOpen(false)}
                  >
                    <span className="mobile-sug-icon"><Tag size={14} color="#C9A96E" /></span>
                    <div>
                      <span className="mobile-sug-name">{cat.label}</span>
                      <span className="mobile-sug-type">Category</span>
                    </div>
                    <span className="mobile-sug-arrow">›</span>
                  </Link>
                ))}
                {mobileSuggestions.products.map(prod => (
                  <button
                    key={prod.id}
                    className="mobile-sug-item"
                    onClick={() => {
                      router.push(`/product/${prod.id}`);
                      setShowSuggestions(false);
                      setMobileSearchOpen(false);
                    }}
                  >
                    <span className="mobile-sug-icon"><Search size={14} color="#c8b89a" /></span>
                    <div>
                      <span className="mobile-sug-name">{prod.name}</span>
                      <span className="mobile-sug-type">₹{prod.price.toLocaleString('en-IN')} · {prod.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Category chips */}
            <div className="mobile-search-categories">
              <p className="mobile-search-categories-label">Browse Categories</p>
              <div className="mobile-search-chips">
                {categories.map((cat, i) => (
                  <Link
                    key={i}
                    href={cat.href}
                    className="mobile-search-chip"
                    onClick={() => setMobileSearchOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular searches */}
            <div className="mobile-search-popular">
              <p className="mobile-search-categories-label">Popular Searches</p>
              <div className="mobile-search-popular-list">
                {['Diamond Rings', 'Gold Earrings', 'Solitaire', 'Mangalsutra', 'Bangles', 'Pendants'].map((term, i) => (
                  <button
                    key={i}
                    className="mobile-search-popular-item"
                    onClick={() => handleSearch(term)}
                  >
                    <Search size={14} />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
