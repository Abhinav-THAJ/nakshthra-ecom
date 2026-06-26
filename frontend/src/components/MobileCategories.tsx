'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface MobileCategoriesProps {
  categories: any[];
  menuConfigs: Record<string, any>;
  categoryRoutes: Record<string, string>;
}

export default function MobileCategories({ categories, menuConfigs, categoryRoutes }: MobileCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (catName: string, hasMenu: boolean) => {
    if (hasMenu && menuConfigs[catName]) {
      setActiveCategory(catName);
    }
  };

  const closeMenu = () => {
    setActiveCategory(null);
  };

  // Define images for categories to match the screenshot
  const categoryImages: Record<string, string> = {
    'Rings': '/cat_pendant.png', // Fallbacks to existing public images
    'Earrings': '/cat_hoops.png',
    'Silver by Shaya': '/cat_wedding.png',
    'Gifting': '/polki_prod2.png',
    'Mangalsutras': '/product_mangalsutra.png',
    'Bracelets & Bangles': '/product_bracelet.png',
    'Solitaires': '/product_solitaire.png',
    'Necklaces & Pendants': '/cat_pendant.png',
    'Collections': '/col_kaashika.png',
    'Trending': '/hero_banner_solitaires.png',
  };

  return (
    <>
      {/* Horizontal Scrollable Categories for Mobile */}
      <div className="mobile-categories-scroll hide-lg">
        {categories.map((cat, idx) => (
          <div 
            key={idx} 
            className="mobile-category-item"
            onClick={() => handleCategoryClick(cat.name, cat.hasMenu)}
          >
            <div className="mobile-category-image">
               <div className="img-placeholder" style={{backgroundImage: `url(${categoryImages[cat.name] || '/cat_hoops.png'})`}}></div>
            </div>
            <span className="mobile-category-name">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Slide-in Subcategory Menu */}
      <div className={`mobile-submenu-overlay ${activeCategory ? 'open' : ''} hide-lg`}>
        {activeCategory && menuConfigs[activeCategory] && (
          <div className="mobile-submenu-content">
            <div className="mobile-submenu-header">
              <button className="back-btn" onClick={closeMenu}>
                <ArrowLeft size={24} color="#2D2416" />
              </button>
              <h3>{activeCategory}</h3>
            </div>

            <div className="mobile-submenu-body">
              {/* Featured */}
              {menuConfigs[activeCategory].featured && (
                <div className="submenu-section">
                  <h4 className="submenu-title">Featured</h4>
                  <div className="submenu-pills">
                    {menuConfigs[activeCategory].featured.map((item: string, i: number) => (
                      <Link key={i} href={categoryRoutes[activeCategory] || '#'} className="submenu-pill" onClick={closeMenu}>
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* By Style */}
              {menuConfigs[activeCategory].styles && (
                <div className="submenu-section">
                  <h4 className="submenu-title">By Style</h4>
                  <div className="submenu-grid">
                    {menuConfigs[activeCategory].styles.map((item: string, i: number) => (
                      <Link key={i} href={categoryRoutes[activeCategory] || '#'} className="submenu-grid-item" onClick={closeMenu}>
                        <div className="submenu-icon-placeholder">
                          <Image src="/logo.png" alt="icon" width={24} height={24} style={{objectFit: 'contain', opacity: 0.5}} />
                        </div>
                        <span>{item}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* By Metal & Stone */}
              {menuConfigs[activeCategory].metalStone && (
                <div className="submenu-section">
                  <h4 className="submenu-title">By Metal & Stone</h4>
                  <div className="submenu-grid">
                    {menuConfigs[activeCategory].metalStone.map((item: any, i: number) => (
                      <Link key={i} href={categoryRoutes[activeCategory] || '#'} className="submenu-grid-item" onClick={closeMenu}>
                        <div className={`submenu-stone-dot-large ${item.class}`}></div>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* By Price */}
              {menuConfigs[activeCategory].prices && (
                <div className="submenu-section">
                  <h4 className="submenu-title">By Price</h4>
                  <div className="submenu-pills">
                    {menuConfigs[activeCategory].prices.map((item: string, i: number) => (
                      <Link key={i} href={categoryRoutes[activeCategory] || '#'} className="submenu-pill" onClick={closeMenu}>
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
