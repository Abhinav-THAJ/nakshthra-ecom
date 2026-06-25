'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  name: string;
  price: number;
  oldPrice: number;
  img: string;
}

interface CollectionsSectionProps {
  weddingProducts?: Product[];
}

export default function CollectionsSection({ weddingProducts = [] }: CollectionsSectionProps) {
  const [promoSlide, setPromoSlide] = useState(0);

  const collections = [
    {
      name: 'Kaashika',
      desc: 'Traditional Gold',
      image: '/col_kaashika.png',
    },
    {
      name: 'Leher',
      desc: 'The dance of waves',
      image: '/col_leher.png',
    },
    {
      name: 'Adaa',
      desc: 'By Nakshathra',
      image: '/col_adaa.png',
    },
    {
      name: 'anekā',
      desc: 'Many forms, one essence',
      image: '/polki_banner.png',
    },
    {
      name: 'Eternity',
      desc: 'Luxury, woven in brilliance',
      image: '/hero_banner.png',
    }
  ];

  const bottomPromos = [
    {
      title: 'Pretty in purple,',
      subtitle: 'powerful in shine',
      image: '/col_adaa.png',
      cta: 'SHOP NOW ▶'
    },
    {
      title: '9KT Gold',
      subtitle: 'Because everyday moments deserve gold',
      priceTag: 'STARTING AT ₹5000',
      image: '/hero_ashlesha.png',
      cta: 'SHOP NOW ▶'
    },
    {
      title: 'Golden Hour Styles',
      subtitle: 'The summer your style got prettier!',
      image: '/col_kaashika.png',
      cta: 'SHOP NOW ▶'
    }
  ];

  return (
    <div className="collection-group-wrapper">
      
      {/* 1. Nakshathra Collections Title & 5 Vertical Cards Grid */}
      <section className="collections-section">
        <div className="section-title text-center">
          <h2>Nakshathra Collections</h2>
        </div>

        <div className="collections-five-grid">
          {collections.map((col, idx) => (
            <div 
              key={idx} 
              className="collection-five-card" 
              style={{ backgroundImage: `url(${col.image})` }}
            >
              <div className="five-card-overlay">
                <div className="five-card-content text-center">
                  <h3>{col.name}</h3>
                  <p>{col.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-collections-row flex-center">
          <Link href="#collections" className="view-all-btn">
            VIEW ALL COLLECTIONS
          </Link>
        </div>
      </section>

      {/* 2. Wedding Split Section */}
      <section className="featured-split-section">
        <div className="split-layout flex">
          {/* Left Wedding Banner */}
          <div 
            className="split-banner wedding-split-bg"
            style={{ backgroundImage: `url('/polki_banner.png')` }}
          >
            <div className="wedding-banner-content">
              <h2>For the bride squad</h2>
              <h2>& all the wedding glam</h2>
              <Link href="#wedding" className="wedding-shop-link">
                SHOP NOW ▶
              </Link>
            </div>
          </div>

          {/* Right Wedding Bands Slider */}
          <div className="split-slider-container flex">
            <div className="slider-header-row space-between">
              <h3>Wedding Bands</h3>
            </div>
            
            <div className="split-products-grid">
              {weddingProducts.map((prod, idx) => (
                <div key={idx} className="split-product-card">
                  <div className="img-box flex-center">
                    <img src={prod.img} alt={prod.name} />
                  </div>
                  <div className="info-box">
                    <div className="price flex">
                      <span className="current">₹{prod.price.toLocaleString('en-IN')}</span>
                      <span className="old">₹{prod.oldPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <h4 className="title">{prod.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="slider-footer-row space-between">
              <div></div>
              <Link href="#wedding" className="shop-now-btn">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Banner Slider Carousel */}
      <section className="bottom-promo-carousel">
        <div className="promo-carousel-wrapper flex" style={{ transform: `translateX(-${promoSlide * 100}%)` }}>
          <div className="promo-slide-row flex">
            {bottomPromos.map((promo, idx) => (
              <div 
                key={idx} 
                className="promo-banner-slide-card"
                style={{ backgroundImage: `url(${promo.image})` }}
              >
                <div className="promo-slide-overlay flex">
                  <div className="promo-slide-text">
                    {promo.priceTag && <span className="price-tag">{promo.priceTag}</span>}
                    <h3>{promo.title}</h3>
                    <p>{promo.subtitle}</p>
                    <Link href="#promos" className="promo-cta-link">{promo.cta}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="carousel-nav-dots flex-center">
          <button className="nav-dot active"></button>
          <button className="nav-dot"></button>
        </div>
      </section>

    </div>
  );
}
