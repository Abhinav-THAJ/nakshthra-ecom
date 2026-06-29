import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      {/* Newsletter / Upper Row */}
      <div className="footer-newsletter">
        <div className="container space-between newsletter-container">
          <div className="newsletter-text">
            <h3>Know First, Wear First</h3>
            <p>Subscribe to receive updates on collections, events, and special offers.</p>
          </div>
          <div className="newsletter-form flex">
            <input type="email" placeholder="Enter your email address" />
            <button className="subscribe-btn flex-center">
              <Mail size={18} />
              <span>Subscribe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="footer-directory container">
        <div className="footer-column">
          <h4>Pendants</h4>
          <ul>
            <li><Link href="#pendants">Gold Pendants</Link></li>
            <li><Link href="#pendants">Diamond Pendants</Link></li>
            <li><Link href="#pendants">Solitaire Pendants</Link></li>
            <li><Link href="#pendants">Evil Eye Pendants</Link></li>
            <li><Link href="#pendants">Chain Pendants</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Mangalsutras</h4>
          <ul>
            <li><Link href="#mangalsutras">Gold Mangalsutras</Link></li>
            <li><Link href="#mangalsutras">Diamond Mangalsutras</Link></li>
            <li><Link href="#mangalsutras">Modern Mangalsutras</Link></li>
            <li><Link href="#mangalsutras">Traditional Designs</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Useful Links</h4>
          <ul>
            <li><Link href="#services">Free Try At Home</Link></li>
            <li><Link href="#rates">Local Gold Rates</Link></li>
            <li><Link href="#stores">Find a Store</Link></li>
            <li><Link href="#points">xCLusive Points</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact & Help</h4>
          <div className="contact-info">
            <div className="contact-item flex">
              <Phone size={16} />
              <span>1800-102-0103 (Toll Free)</span>
            </div>
            <div className="contact-item flex">
              <MessageSquare size={16} />
              <span>Chat on WhatsApp</span>
            </div>
            <div className="social-links flex">
              <Link href="#fb" className="social-icon flex-center" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </Link>
              <Link href="#insta" className="social-icon flex-center" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </Link>
              <Link href="#tw" className="social-icon flex-center" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright / Tata connection */}
      <div className="footer-bottom">
        <div className="container space-between bottom-container">
          <p>© 2026 Nakshathra Gold and Diamonds. All Rights Reserved.</p>

        </div>
      </div>
    </footer>
  );
}
