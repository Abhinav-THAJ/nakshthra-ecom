'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod'
  });

  const gst = Math.round(totalPrice * 0.03);
  const shipping = totalPrice > 10000 ? 0 : 199;
  const grandTotal = totalPrice + gst + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate order processing
    await new Promise(r => setTimeout(r, 1500));
    clearCart();
    setStep('success');
    setLoading(false);
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <>
        <Header />
        <div className="cart-empty-page">
          <h2>Your cart is empty</h2>
          <Link href="/rings" className="btn-buy-now" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
            Browse Collections
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (step === 'success') {
    return (
      <>
        <Header />
        <div className="checkout-success">
          <CheckCircle size={80} color="#4CAF50" strokeWidth={1.5} />
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. We'll send a confirmation to <strong>{form.email}</strong></p>
          <p className="order-id">Order ID: NAK-{Date.now().toString().slice(-8)}</p>
          <div className="success-actions">
            <Link href="/" className="btn-buy-now" style={{ textDecoration: 'none' }}>Back to Home</Link>
            <Link href="/rings" className="btn-add-cart" style={{ textDecoration: 'none' }}>Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="container checkout-container">
          <Link href="/cart" className="cart-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1 className="cart-title">Checkout</h1>

          {/* Steps */}
          <div className="checkout-steps">
            <div className={`step ${step === 'details' ? 'active' : 'done'}`}>1. Delivery Details</div>
            <div className="step-sep">›</div>
            <div className={`step ${step === 'payment' ? 'active' : ''}`}>2. Payment</div>
          </div>

          <div className="checkout-layout">
            {/* Left: Forms */}
            <div className="checkout-form-panel">
              {step === 'details' && (
                <form onSubmit={handleSubmitDetails} className="checkout-form">
                  <h3>Delivery Address</h3>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>First Name *</label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First Name" />
                    </div>
                    <div className="form-field">
                      <label>Last Name *</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last Name" />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email address" />
                    </div>
                    <div className="form-field">
                      <label>Phone *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" pattern="[0-9]{10}" />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Address *</label>
                    <textarea name="address" value={form.address} onChange={handleChange as any} required placeholder="House No., Street, Area" rows={3} />
                  </div>
                  <div className="form-row-3">
                    <div className="form-field">
                      <label>City *</label>
                      <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
                    </div>
                    <div className="form-field">
                      <label>State *</label>
                      <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
                    </div>
                    <div className="form-field">
                      <label>Pincode *</label>
                      <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode" pattern="[0-9]{6}" />
                    </div>
                  </div>
                  <button type="submit" className="btn-buy-now" style={{ width: '100%', marginTop: 16 }}>
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={handlePlaceOrder} className="checkout-form">
                  <h3>Payment Method</h3>
                  <div className="payment-options">
                    <label className={`payment-option ${form.paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} />
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </label>
                    <label className={`payment-option ${form.paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === 'upi'} onChange={handleChange} />
                      <div>
                        <strong>UPI / PhonePe / GPay</strong>
                        <p>Instant payment via UPI</p>
                      </div>
                    </label>
                    <label className={`payment-option ${form.paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={handleChange} />
                      <div>
                        <strong>Credit / Debit Card</strong>
                        <p>All major cards accepted</p>
                      </div>
                    </label>
                    <label className={`payment-option ${form.paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value="netbanking" checked={form.paymentMethod === 'netbanking'} onChange={handleChange} />
                      <div>
                        <strong>Net Banking</strong>
                        <p>All major banks supported</p>
                      </div>
                    </label>
                  </div>

                  <div className="delivery-summary">
                    <h4>Delivering to:</h4>
                    <p>{form.firstName} {form.lastName} • {form.phone}</p>
                    <p>{form.address}, {form.city}, {form.state} - {form.pincode}</p>
                    <button type="button" onClick={() => setStep('details')} className="change-address-btn">Change</button>
                  </div>

                  <button type="submit" className="btn-buy-now" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
                    {loading ? 'Placing Order...' : `Place Order • ₹${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>
              <div className="checkout-items-mini">
                {items.map(item => (
                  <div key={item.id} className="mini-cart-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className="mini-item-name">{item.name}</p>
                      <p className="mini-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="mini-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
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
                <div className="summary-divider" />
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="summary-secure">🔒 100% Secure & Insured Delivery</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
