"use client";

import React from 'react';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  deliveryTime?: string;
  isNew?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  rating = 4.8,
  reviews = 12,
  deliveryTime = 'Tomorrow',
  isNew = false
}: ProductCardProps) {
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="product-card-wrapper">
      <Link href={`/product/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Product Image Box */}
        <div className="product-image-box">
          {isNew && <span className="badge new-badge">NEW</span>}
          {discount > 0 && <span className="badge discount-badge">Flat {discount}% Off</span>}
          
          <button className="wishlist-btn-card" onClick={(e) => e.preventDefault()}>
            <Heart size={18} color="#888888" />
          </button>

          <img src={image} alt={name} className="product-image" />
        </div>

        {/* Product Information */}
        <div className="product-info">
          <div className="rating-row flex">
            <div className="rating-box flex-center">
              <span>{rating}</span>
              <Star size={12} fill="#ffb300" color="#ffb300" />
            </div>
            <span className="reviews-text">({reviews} reviews)</span>
          </div>

          <h3 className="product-title">{name}</h3>

          <div className="price-row flex">
            <span className="current-price">₹{price.toLocaleString('en-IN')}</span>
            {oldPrice && <span className="old-price">₹{oldPrice.toLocaleString('en-IN')}</span>}
          </div>

          <div className="delivery-row">
            <p>Express Delivery: <span>{deliveryTime}</span></p>
          </div>

          <button className="add-to-cart-btn-card" onClick={(e) => { e.preventDefault(); console.log('Add to cart clicked'); }}>
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
}
