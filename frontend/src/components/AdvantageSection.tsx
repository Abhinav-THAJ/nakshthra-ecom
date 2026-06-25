import React from 'react';
import { Home, RefreshCw, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function AdvantageSection() {
  const items = [
    {
      icon: <Home size={32} color="#a88a48" />,
      title: 'Free Try at Home',
      desc: 'Book a free appointment. Our jewelry experts will visit you at home.'
    },
    {
      icon: <RefreshCw size={32} color="#a88a48" />,
      title: '15-Day Money Back',
      desc: 'Love it or return it. 100% refund within 15 days, no questions asked.'
    },
    {
      icon: <Award size={32} color="#a88a48" />,
      title: 'Lifetime Exchange',
      desc: 'Upgrade your design anytime. Get market value for gold & diamonds.'
    },
    {
      icon: <ShieldCheck size={32} color="#a88a48" />,
      title: '100% Certified',
      desc: 'Every piece is certified by international labs (SGL, IGI, BIS Hallmarked).'
    }
  ];

  return (
    <section className="advantage-section-wrapper">
      <div className="container">
        <div className="section-title text-center">
          <h2>The Nakshathra Advantage</h2>
          <p>Why shop with us? We ensure absolute security and quality at every step.</p>
        </div>

        <div className="advantage-grid">
          {items.map((item, idx) => (
            <div key={idx} className="advantage-card flex-center">
              <div className="icon-wrapper flex-center">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
