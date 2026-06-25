'use client';

import React from 'react';
import Link from 'next/link';
import { Award, RefreshCw, Milestone, ShieldCheck, Gift } from 'lucide-react';

export default function CategoriesGrid() {
  const categories = [
    { name: 'WEDDING BANDS', img: '/cat_wedding.png', href: '#wedding' },
    { name: 'EVERYDAY PENDANTS', img: '/cat_pendant.png', href: '#pendants' },
    { name: 'BESTSELLING STYLES', img: '/product_ring.png', href: '#bestsellers' },
    { name: 'NEW STYLES FOR KIDS', img: '/product_bracelet.png', href: '#kids' },
    { name: 'DAILYWEAR HOOPS', img: '/cat_hoops.png', href: '#hoops' },
    { name: 'NOSE PINS', img: '/product_solitaire.png', href: '#nosepins' }
  ];

  const trustItems = [
    { icon: <ShieldCheck size={18} />, text: '100% Certified' },
    { icon: <RefreshCw size={18} />, text: '15 Day Exchange' },
    { icon: <Milestone size={18} />, text: 'Lifetime Exchange' },
    { icon: <Award size={18} />, text: 'One Year Warranty' }
  ];

  return (
    <section className="categories-section container">
      {/* Category Panel with "Wrapped with love" on Left */}
      <div className="wrapped-love-panel flex">
        {/* Left gift card */}
        <div className="love-left-block flex-center">
          <div className="gift-icon-box flex-center">
            <Gift size={32} color="#a88a48" />
          </div>
          <p className="love-text">Wrapped with love</p>
        </div>

        {/* Right categories grid */}
        <div className="categories-cards-grid">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className="ref-category-card">
              <div className="ref-img-wrapper flex-center">
                <img src={cat.img} alt={cat.name} />
              </div>
              <span className="ref-cat-title">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust horizontal indicators below Category Panel */}
      <div className="trust-horizontal-bar flex-center">
        {trustItems.map((item, idx) => (
          <div key={idx} className="trust-horizontal-item flex-center">
            <span className="icon flex-center">{item.icon}</span>
            <span className="text">{item.text}</span>
            {idx < trustItems.length - 1 && <span className="divider"></span>}
          </div>
        ))}
      </div>
    </section>
  );
}
