'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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



      {/* Floating WhatsApp button on bottom right */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-phone-btn flex-center"
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="#ffffff">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.773L0 32l8.418-2.004A15.94 15.94 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.852l-.485-.288-5.004 1.191 1.215-4.872-.316-.5A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.878c-.398-.199-2.357-1.163-2.721-1.295-.365-.133-.63-.199-.896.199-.265.398-1.029 1.295-1.261 1.561-.232.265-.465.298-.863.1-.398-.2-1.681-.619-3.203-1.977-1.183-1.057-1.982-2.363-2.214-2.761-.232-.398-.025-.613.174-.811.178-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.896-2.162-1.228-2.96-.323-.777-.651-.672-.896-.684l-.764-.013c-.265 0-.697.1-.1063.498-.365.398-1.393 1.362-1.393 3.323s1.427 3.855 1.627 4.121c.199.265 2.808 4.286 6.802 6.013.951.411 1.693.656 2.271.84.954.304 1.823.261 2.51.158.766-.114 2.357-.963 2.689-1.894.332-.93.332-1.728.232-1.894-.099-.166-.365-.265-.763-.464z"/>
        </svg>
      </a>
    </div>
  );
}
