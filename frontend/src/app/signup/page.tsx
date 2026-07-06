'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <main className="main-content">
      <Header />
      
      <div className="signup-simple-container">
        <div className="signup-simple-card">
          <div className="signup-header">
            <h2>Sign Up</h2>
            <p>Please fill in this form to create an account!</p>
          </div>
          <hr className="signup-divider" />
          
          <form className="signup-simple-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <input 
                type="text" 
                name="firstName" 
                placeholder="First Name" 
                className="simple-input" 
                value={formData.firstName}
                onChange={handleChange}
                required 
              />
              <input 
                type="text" 
                name="lastName" 
                placeholder="Last Name" 
                className="simple-input" 
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </div>
            
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number" 
              className="simple-input" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
            
            <input 
              type="text" 
              name="city" 
              placeholder="Place / City" 
              className="simple-input" 
              value={formData.city}
              onChange={handleChange}
              required 
            />

            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              className="simple-input" 
              value={formData.email}
              onChange={handleChange}
              required 
            />

            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              className="simple-input" 
              value={formData.password}
              onChange={handleChange}
              required 
            />

            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              className="simple-input" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />

            <label className="terms-label">
              <input 
                type="checkbox" 
                name="acceptTerms" 
                checked={formData.acceptTerms}
                onChange={handleChange}
                required 
              />
              <span>I accept the Terms of Use & Privacy Policy</span>
            </label>

            <button type="submit" className="signup-simple-btn">
              Sign Up
            </button>
          </form>
        </div>
        
        <div className="signup-simple-footer">
          Already have an account? <Link href="/">Login here.</Link>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
