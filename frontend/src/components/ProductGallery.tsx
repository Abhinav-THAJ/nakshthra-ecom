'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="product-image-gallery">
      {/* Main large image */}
      <div className="main-image">
        <img
          src={images[activeIndex]}
          alt={`${name} - view ${activeIndex + 1}`}
          key={images[activeIndex]}
          className="main-product-img"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="thumbnail-list">
          {images.map((img, i) => (
            <button
              key={i}
              className={`thumb-btn ${i === activeIndex ? 'active-thumb' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt={`${name} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
