'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, Heart, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MobileCategories from './MobileCategories';

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
    featured: ['Latest Designs', 'Bestsellers', 'Solitaire Rings', 'Fast Delivery', 'Special Deals'],
    styles: ['All Rings', 'Engagement Rings', 'Band Rings', 'Cocktail Rings', 'Eternity Rings', 'Couple Bands', 'Stackable Rings', 'Casual Rings'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Gemstone', class: 'gemstone-dot' },
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'White Gold', class: 'white-gold-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' },
      { name: 'Platinum', class: 'platinum-dot' }
    ],
    prices: ['Under ₹ 10k', '₹ 10k - 20k', '₹ 20k - 30k', '₹ 30k - 50k', 'Above ₹ 50k'],
    promos: [
      { image: '/product_ring.png', title: 'Engagement Rings' },
      { image: '/product_solitaire.png', title: 'Luxury Solitaires' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
  },
  'Earrings': {
    featured: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'],
    styles: ['All Earrings', 'Studs', 'Hoops', 'Drops', 'Earcuffs', 'Sui Dhagas', 'Jhumkas', 'Silver Earrings'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Pearl', class: 'pearl-dot' },
      { name: 'Navratna', class: 'navratna-dot' },
      { name: 'Gemstone', class: 'gemstone-dot' },
      { name: 'Platinum', class: 'platinum-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' },
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'White Gold', class: 'white-gold-dot' },
      { name: '22kt Gold', class: 'gold-22kt-dot' }
    ],
    prices: ['Under ₹ 10k', '₹ 10k - 20k', '₹ 20k - 30k', '₹ 30k - 50k', '₹ 50k - 75k', 'Above ₹ 75k'],
    promos: [
      { image: '/menu_switch.png', title: 'Switch' },
      { image: '/menu_hoops.png', title: 'Dancing Hoops' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
  },
  'Bracelets & Bangles': {
    featured: ['Latest Designs', 'Bestsellers', 'Fast Delivery', 'Special Deals'],
    styles: ['All Bracelets & Bangles', 'Adjustable Bracelets', 'Chain Bracelets', 'Flexible Bracelets', 'Tennis Bracelets', 'Bridal Bangles', 'Lightweight Bangles', 'Silver Bracelets', 'Oval Bracelets'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Gemstone', class: 'gemstone-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' },
      { name: 'Platinum', class: 'platinum-dot' },
      { name: 'Pearl', class: 'pearl-dot' },
      { name: 'Navratna', class: 'navratna-dot' },
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'White Gold', class: 'white-gold-dot' },
      { name: '22kt Gold', class: 'gold-22kt-dot' }
    ],
    prices: ['Under ₹ 10k', '₹ 10k - 20k', '₹ 20k - 30k', '₹ 30k - 50k', '₹ 50k - 75k', 'Above ₹ 75k'],
    promos: [
      { image: '/product_bracelet.png', title: 'Stretchable Bangles' },
      { image: '/product_mangalsutra.png', title: 'Watch Charms' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
  },
  'Solitaires': {
    featured: ['Latest Solitaires', 'Bestsellers', 'Hearts & Arrows', 'Special Deals'],
    styles: ['Solitaire Rings', 'Solitaire Pendants', 'Solitaire Earrings', "Men's Solitaires", 'Couple Solitaires'],
    metalStone: [
      { name: 'Platinum', class: 'platinum-dot' },
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'White Gold', class: 'white-gold-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' }
    ],
    prices: ['Under ₹ 50k', '₹ 50k - 1L', '₹ 1L - 2L', 'Above ₹ 2L'],
    promos: [
      { image: '/product_solitaire.png', title: 'Solitaire Rings' },
      { image: '/hero_banner_solitaires.png', title: 'Signature Solitaires' }
    ],
    filters: ['For Women', 'For Men']
  },
  'Mangalsutras': {
    featured: ['Modern Mangalsutras', 'Traditional Designs', 'Bestsellers', 'Fast Delivery'],
    styles: ['Chain Mangalsutras', 'Bracelet Mangalsutras', 'Pendant Mangalsutras', 'Short Mangalsutras', 'Gemstone Mangalsutras'],
    metalStone: [
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' },
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Gemstone', class: 'gemstone-dot' }
    ],
    prices: ['Under ₹ 20k', '₹ 20k - 40k', '₹ 40k - 60k', 'Above ₹ 60k'],
    promos: [
      { image: '/product_mangalsutra.png', title: 'Gold Bead' },
      { image: '/cat_pendant.png', title: 'Dailywear' }
    ],
    filters: ['For Women']
  },
  'Necklaces & Pendants': {
    featured: ['Everyday Pendants', 'Festive Necklaces', 'Bestsellers', 'Fast Delivery'],
    styles: ['All Necklaces & Pendants', 'Pendants', 'Lockets', 'Collar Necklaces', 'Chokers', 'Pearl Necklaces', 'Gold Chains'],
    metalStone: [
      { name: 'Diamond', class: 'diamond-dot' },
      { name: 'Gemstone', class: 'gemstone-dot' },
      { name: 'Yellow Gold', class: 'yellow-gold-dot' },
      { name: 'Rose Gold', class: 'rose-gold-dot' },
      { name: 'White Gold', class: 'white-gold-dot' }
    ],
    prices: ['Under ₹ 15k', '₹ 15k - 30k', '₹ 30k - 50k', 'Above ₹ 50k'],
    promos: [
      { image: '/cat_pendant.png', title: 'Daily Pendants' },
      { image: '/polki_banner.png', title: 'Bridal Chokers' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
  },
  'Silver by Shaya': {
    featured: ['Oxidised Silver', 'Fine Silver', 'Minimalist Shaya', 'Bestsellers'],
    styles: ['Shaya Rings', 'Shaya Earrings', 'Shaya Necklaces', 'Shaya Bracelets', 'Anklets', 'Silver Cuffs'],
    metalStone: [
      { name: 'Sterling Silver', class: 'white-gold-dot' },
      { name: 'Gold-plated Silver', class: 'yellow-gold-dot' },
      { name: 'Rose-plated Silver', class: 'rose-gold-dot' }
    ],
    prices: ['Under ₹ 2k', '₹ 2k - 5k', '₹ 5k - 10k', 'Above ₹ 10k'],
    promos: [
      { image: '/cat_hoops.png', title: 'Shaya Hoops' },
      { image: '/product_bracelet.png', title: 'Silver Cuffs' }
    ],
    filters: ['For Women', 'For Men']
  },
  'Gifting': {
    featured: ['Gifts for Her', 'Gifts for Him', 'Kids Gifts', 'Corporate Gifts'],
    styles: ['Anniversary Gifts', 'Birthday Gifts', "Valentine's Gifts", 'Wedding Gifts', 'Baby Shower', 'Gifts for Mother', 'Gifts for Wife'],
    metalStone: [
      { name: 'Diamond Gifts', class: 'diamond-dot' },
      { name: 'Gold Gifts', class: 'yellow-gold-dot' },
      { name: 'Silver Gifts', class: 'white-gold-dot' }
    ],
    prices: ['Gifts Under ₹ 5k', '₹ 5k - 10k', '₹ 10k - 20k', 'Above ₹ 20k'],
    promos: [
      { image: '/cat_wedding.png', title: 'Anniversary Rings' },
      { image: '/polki_prod2.png', title: 'Bestselling Gifts' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
  },
  'Collections': {
    featured: ['Kaashika Collection', 'Leher Collection', 'Adaa Collection', 'Polki Collection'],
    styles: ['Everyday Minimalist', 'Office Wear', 'Bridal Collections', 'Festive Edit', 'Modern Western', 'Traditional Indian'],
    metalStone: [
      { name: 'Gold Collections', class: 'yellow-gold-dot' },
      { name: 'Diamond Collections', class: 'diamond-dot' },
      { name: 'Platinum Collections', class: 'platinum-dot' }
    ],
    prices: ['Under ₹ 20k', '₹ 20k - 50k', '₹ 50k - 1L', 'Above ₹ 1L'],
    promos: [
      { image: '/col_kaashika.png', title: 'Kaashika' },
      { image: '/col_adaa.png', title: 'Adaa' }
    ],
    filters: ['For Women', 'For Men', 'For Kids']
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
  const [pinCode]                                   = useState('682303');
  const [isMenuOpen, setIsMenuOpen]                 = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [activeCategory, setActiveCategory]         = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen]     = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery]   = useState('');
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Timer ref — used to delay closing so mouse can travel into megamenu
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

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
    { name: 'Solitaires',           href: '/solitaires',    hasMenu: true  },
    { name: 'Mangalsutras',         href: '/mangalsutras',  hasMenu: true  },
    { name: 'Necklaces & Pendants', href: '/necklaces',     hasMenu: true  },
    { name: 'Silver by Shaya',      href: '/silver',        hasMenu: true  },
    { name: 'Gifting',              href: '/gifting',        hasMenu: true  },
    { name: 'Collections',          href: '/collections',   hasMenu: true  },
    { name: 'Trending',             href: '/trending',       hasMenu: false },
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

          {/* Logo */}
          <Link href="/" className="logo-container">
            <Image src="/logo.png" alt="Nakshathra Gold & Diamonds" width={100} height={85} className="logo-image" priority />
          </Link>

          {/* Search */}
          <div className="search-bar-container hide-md">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search Rings, Earrings, Solitaires, Gold Coins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">
                <Search size={18} color="#ffffff" />
              </button>
            </div>
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

            {/* Mobile Search Icon — only visible on mobile */}
            <button
              className="icon-btn flex-center mobile-search-trigger hide-lg"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Open search"
            >
              <Search size={20} color="#C9A96E" />
            </button>

            <div className="account-wrapper flex-center">
              <User size={20} color="#C9A96E" />
              <span className="hide-md">Login/Signup</span>
            </div>

            <Link href="#wishlist" className="icon-btn flex-center">
              <Heart size={20} color="#C9A96E" />
            </Link>

            <Link href="#cart" className="icon-btn flex-center cart-btn">
              <ShoppingCart size={20} color="#C9A96E" />
              <span className="cart-count-badge">1</span>
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

          <div className="nav-services hide-md">
            <Link href="#services" className="services-link">Free Try At Home</Link>
          </div>
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
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
              />
              {mobileSearchQuery && (
                <button className="mobile-search-clear" onClick={() => setMobileSearchQuery('')} aria-label="Clear">
                  <X size={16} />
                </button>
              )}
            </div>

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
                    onClick={() => setMobileSearchQuery(term)}
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
    </header>
  );
}
