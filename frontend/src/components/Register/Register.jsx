import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import './Register.css';

// Pairs of curated Unsplash images for the premium e-commerce lookbook
const ECOMMERCE_IMAGE_PAIRS = [
  {
    left: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    right: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
  },
  {
    left: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    right: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80'
  },
  {
    left: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=600&q=80',
    right: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=600&q=80'
  }
];

export default function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '', // Added phone number state
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Image lookbook rotation states
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-change editorial images every 4 seconds with crossfade tracking buffer
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentPairIndex((prevIndex) => (prevIndex + 1) % ECOMMERCE_IMAGE_PAIRS.length);
        setFade(true);
      }, 300); 
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Evaluates password strength value out of 4
  const getPasswordScore = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthMeta = (score) => {
    switch (score) {
      case 1:
        return { label: 'Weak', colorClass: 'strength-weak' };
      case 2:
        return { label: 'Good', colorClass: 'strength-good' };
      case 3:
        return { label: 'Strong', colorClass: 'strength-strong' };
      case 4:
        return { label: 'Very Strong', colorClass: 'strength-very-strong' };
      default:
        return { label: '', colorClass: '' };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Optional phone validation: checks length/digits if populated
    if (formData.phoneNumber.trim() && !/^[0-9+\s-]{7,15}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    
    const score = getPasswordScore(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Must be at least 8 characters';
    } else if (score <= 1) {
      newErrors.password = 'Password structural strength insufficient';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please accept the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // 1. Split the premium fullName into firstName and lastName for the backend
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || ""; // Handles multi-word last names

      // 2. Format the exact payload the backend controller expects
      const payload = {
        firstName,
        lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber.trim(), // Active phone number included
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // 3. Send the formatted payload to your backend service
      const res = await api.post("/register", payload);
      
      alert(res.data.message || 'Welcome to The Heritage Collective!');
      navigate("/login");
    } catch (error) {
      setErrors({ 
        apiError: error.response?.data?.message || 'Registration configuration error. Try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordScore = getPasswordScore(formData.password);
  const strengthMeta = getStrengthMeta(passwordScore);

  return (
    <div className="register-container">
      {/* Left Column: Form Processing Interface */}
      <div className="form-section">
        <div className="form-wrapper">
          <header className="brand-header">
            <h1 className="brand-logo">THE HERITAGE COLLECTIVE</h1>
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">
              Join us to discover timeless craftsmanship.{' '}
              <Link to="/login" className="accent-link">Sign In</Link>
            </p>
          </header>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.apiError && <div className="alert-error">{errors.apiError}</div>}

            {/* Name Field */}
            <div className="input-group">
              <label htmlFor="fullName" className="input-label">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'input-invalid' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-invalid' : ''}`}
                placeholder="name@example.com"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Phone Number Field */}
            <div className="input-group">
              <label htmlFor="phoneNumber" className="input-label">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`form-input ${errors.phoneNumber ? 'input-invalid' : ''}`}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>

            {/* Advanced Luxury Password Field */}
            <div className="input-group luxury-password-group">
              <div className="label-row">
                <label htmlFor="password" className="input-label">Password</label>
                {formData.password && (
                  <span className={`premium-badge-text ${strengthMeta.colorClass}-text`}>
                    {strengthMeta.label}
                  </span>
                )}
              </div>
              
              <div className="password-wrapper premium-input-wrapper luxury-eye-combination">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input premium-input ${errors.password ? 'input-invalid' : ''}`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`password-toggle-premium luxury-eye-btn ${showPassword ? 'eye-active' : ''}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="eye-icon-svg">
                      <path 
                        className="eye-outer-black" 
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" 
                      />
                      <circle 
                        className="eye-iris-blue" 
                        cx="12" 
                        cy="12" 
                        r="3" 
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="eye-icon-svg">
                      <path 
                        className="eye-outer-black" 
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.95 2.95c1.43-1.38 2.52-3.05 3.16-4.97-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.42 2.42c.48-.35 1.07-.59 1.81-.59zM2.27 3.16L1.00 4.43l2.83 2.83C2.42 8.7 1.43 10.42 1 12c1.73 4.39 6 7.5 11 7.5 1.57 0 3.08-.3 4.48-.84l4.13 4.14 1.27-1.27L2.27 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.74.24-1.42.64-1.99l5.35 5.35c-.57.4-1.25.64-1.99.64z" 
                      />
                      <path 
                        className="eye-slash-blue" 
                        d="M12.18 8.18l3.64 3.64c-.04-.27-.14-.52-.3-.74-.42-.6-.94-1.12-1.54-1.54-.22-.16-.47-.26-.74-.3l-1.06-1.06z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Luxury Smooth Tracking Strip Layout */}
              {formData.password && (
                <div className="luxury-tracker-panel">
                  <div className="luxury-progress-track">
                    <div 
                      className={`luxury-progress-fluid ${strengthMeta.colorClass}`} 
                      style={{ width: `${(passwordScore / 4) * 100}%` }}
                    />
                  </div>
                  
                  {/* Micro Indicators */}
                  <div className="luxury-checklist">
                    <span className={`check-node ${formData.password.length >= 8 ? 'active' : ''}`}>Min 8 Chars</span>
                    <span className={`check-node ${/[A-Z]/.test(formData.password) ? 'active' : ''}`}>Uppercase</span>
                    <span className={`check-node ${/[0-9]/.test(formData.password) ? 'active' : ''}`}>Number</span>
                  </div>
                </div>
              )}
              
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'input-invalid' : ''}`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>

            {/* Policy Consent Option */}
            <div className="checkbox-container">
              <div className="checkbox-row">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <label htmlFor="agreeToTerms" className="checkbox-label">
                  I agree to the <a href="#terms" className="accent-link">Terms of Service</a> & <a href="#privacy" className="accent-link">Privacy Policy</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="error-text">{errors.agreeToTerms}</p>}
            </div>

            {/* Submission Mechanism */}
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? <span className="loader-text">CREATING ACCOUNT...</span> : 'REGISTER NOW'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: E-Commerce Catalog Display Loop */}
      <div className="lookbook-pane">
        <div className="lookbook-grid">
          <div className={`lookbook-image-frame ${fade ? 'fade-in' : 'fade-out'}`}>
            <img src={ECOMMERCE_IMAGE_PAIRS[currentPairIndex].left} alt="Lookbook L" className="lookbook-img" />
          </div>
          <div className={`lookbook-image-frame dynamic-offset ${fade ? 'fade-in' : 'fade-out'}`}>
            <img src={ECOMMERCE_IMAGE_PAIRS[currentPairIndex].right} alt="Lookbook R" className="lookbook-img" />
          </div>
        </div>
        <div className="lookbook-footer">
          <p className="collection-title">THE BEAUTY OF HANDLOOMS</p>
          <p className="collection-sub">Curated stories told through threads.</p>
        </div>
      </div>
    </div>
  );
}