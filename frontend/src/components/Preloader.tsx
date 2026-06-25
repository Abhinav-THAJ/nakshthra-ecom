'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Keep the preloader visible for 1.5 seconds, then fade out
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setVisible(false), 800); // 800ms matches the CSS transition duration
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader-overlay ${loading ? '' : 'fade-out'}`}>
      <div className="preloader-content">
        <Image 
          src="/logo.png" 
          alt="Nakshathra Gold & Diamonds" 
          width={300} 
          height={150} 
          className="preloader-logo" 
          priority 
        />
        <div className="preloader-spinner"></div>
      </div>
    </div>
  );
}
