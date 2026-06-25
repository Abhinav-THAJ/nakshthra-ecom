'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/hero_banner.png',
      isPromo: true,
      bgPosition: 'right center',
      topBarText: '0%* DEDUCTION ON OLD GOLD EXCHANGE',
      title: 'All Shine. No Regrets!',
      footnote: '*TCA Old Gold Exchange valid on plain & studded jewellery of 9KT & onwards',
      link: '#necklaces'
    },
    {
      image: '/hero_ashlesha.png',
      isAshlesha: true,
      bgPosition: 'center top',
      title: 'Ashlesha Thakur',
      subtitle: 'Our newest sparkle for',
      highlightGold: '9KT Gold',
      highlightSilver: ' & Silver Diamonds',
      link: '#rings'
    },
    {
      image: '/hero_banner_solitaires.png',
      isAshlesha: false,
      bgPosition: 'center',
      title: 'Luxury Solitaires',
      subtitle: 'For the moments that last a lifetime.',
      highlightGold: 'Certified',
      highlightSilver: ' Diamonds',
      link: '#solitaires'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 8000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="hero-slider-container">
      <div 
        className="slides-wrapper" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div 
            key={idx} 
            className={`slide-item slide-item-blend ${currentSlide === idx ? 'active' : ''}`}
          >
            <div 
              className="slide-image-bg" 
              style={{ 
                backgroundImage: `url(${slide.image})`,
                backgroundPosition: slide.bgPosition || 'center'
              }}
            />
            <div className="slide-blend-overlay" />
            {slide.isPromo && (
              <div className="slide-top-promo-bar">
                {slide.topBarText}
              </div>
            )}
            <div className="slide-overlay">
              <div className="slide-content container">
                {slide.isPromo ? (
                  <div className="promo-slide-layout">
                    <span className="promo-title">{slide.title}</span>
                    <div className="promo-badge-box">
                      <span className="promo-flat">FLAT</span>
                      <span className="promo-percentage">100%<sup>*</sup> Off</span>
                      <span className="promo-desc">On Making Charges</span>
                      <span className="promo-subdesc">of All Diamond Designs</span>
                    </div>
                    <p className="promo-footnote">{slide.footnote}</p>
                    <a href={slide.link} className="read-more-btn promo-shop-btn">SHOP NOW <span>▶</span></a>
                  </div>
                ) : slide.isAshlesha ? (
                  <div className="ashlesha-style">
                    <h2 className="script-title">{slide.title}</h2>
                    <p className="subtitle-regular">{slide.subtitle}</p>
                    <div className="highlight-banner-text">
                      <span className="gold-text">{slide.highlightGold}</span>
                      <span className="white-text">{slide.highlightSilver}</span>
                    </div>
                    <a href={slide.link} className="read-more-btn">READ MORE <span>▶</span></a>
                  </div>
                ) : (
                  <div className="ashlesha-style">
                    <span className="slide-badge">Exclusive Collection</span>
                    <h2 className="normal-title">{slide.title}</h2>
                    <p className="subtitle-regular">{slide.subtitle}</p>
                    <div className="highlight-banner-text">
                      <span className="gold-text">{slide.highlightGold}</span>
                      <span className="white-text">{slide.highlightSilver}</span>
                    </div>
                    <a href={slide.link} className="read-more-btn">EXPLORE NOW <span>▶</span></a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation - Circle pills centered on the edges */}
      <button className="slider-edge-nav-btn prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={28} color="#555555" />
      </button>
      <button className="slider-edge-nav-btn next" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={28} color="#555555" />
      </button>



      {/* Floating WhatsApp/Call button on bottom right */}
      <div className="floating-phone-btn flex-center">
        <PhoneCall size={22} color="#ffffff" />
      </div>
    </div>
  );
}
