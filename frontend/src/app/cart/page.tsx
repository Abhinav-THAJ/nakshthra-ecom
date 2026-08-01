'use client';

import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  const gst = Math.round(totalPrice * 0.03);
  const shipping = totalPrice > 10000 ? 0 : 199;
  const grandTotal = totalPrice + gst + shipping;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="cart-empty-page">
          <ShoppingBag size={80} color="#C9A96E" strokeWidth={1} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any jewellery yet.</p>
          <Link href="/rings" className="btn-buy-now" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
            Browse Collections
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="container cart-container">
          <div className="cart-header">
            <Link href="/" className="cart-back-link"><ArrowLeft size={16} /> Continue Shopping</Link>
            <h1 className="cart-title">Shopping Cart <span>({totalItems} items)</span></h1>
          </div>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-list">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <Link href={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </Link>
                  <div className="cart-item-info">
                    <Link href={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <p className="cart-item-code">Code: {item.code}</p>
                    {item.weight && <p className="cart-item-meta">Weight: {item.weight}</p>}
                    {item.diamondCt && <p className="cart-item-meta">Diamond: {item.diamondCt} ct</p>}
                    <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <p className="cart-item-subtotal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>GST (3%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="free-shipping-msg">🎉 You qualify for free shipping!</p>
                )}
                <div className="summary-divider" />
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-checkout">
                Proceed to Checkout
              </Link>
              <p className="summary-secure">🔒 Secure checkout with SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
