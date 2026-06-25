import React from 'react';
import { Heart, Star } from 'lucide-react';

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
      {/* Product Image Box */}
      <div className="product-image-box">
        {isNew && <span className="badge new-badge">NEW</span>}
        {discount > 0 && <span className="badge discount-badge">Flat {discount}% Off</span>}
        
        <button className="wishlist-btn-card">
          <Heart size={18} color="#888888" />
        </button>

        <img src={image} alt={name} className="product-image" />
        
        <div className="try-at-home-bar">
          <span>Book Try At Home</span>
        </div>
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

        <button className="add-to-cart-btn-card">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
