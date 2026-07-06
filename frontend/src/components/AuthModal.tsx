import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="auth-modal-left">
          <Image src="/hero_banner_solitaires.png" alt="Luxury Jewelry" fill style={{ objectFit: 'cover' }} />
          <div className="auth-modal-image-overlay">
            <h2>Welcome Back</h2>
            <p>Discover our latest exclusive collections.</p>
          </div>
        </div>

        <div className="auth-modal-right">
          <div className="auth-form-container">
            <h3 className="auth-form-title">Sign In</h3>
            <p className="auth-form-subtitle">
              Please sign in to your account
            </p>

            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              <div className="auth-input-group">
                <Mail size={18} className="auth-input-icon" />
                <input type="email" placeholder="Email Address" required />
              </div>

              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" required />
                <button type="button" className="auth-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button type="submit" className="auth-submit-btn">
                Sign In
              </button>
            </form>

            <div className="auth-toggle-text">
              Don't have an account?{' '}
              <a href="/signup" onClick={onClose} style={{ cursor: 'pointer', color: 'var(--gold-rich)', textDecoration: 'underline' }}>
                Create one now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
