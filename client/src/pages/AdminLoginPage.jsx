import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Shield, 
  Clock, 
  Radio,
  Newspaper,
  MessageSquare
} from 'lucide-react';

export default function AdminLoginPage({ apiBaseUrl = 'http://localhost:5000', onAdminLoginSuccess }) {
  const navigate = useNavigate();
  const showcaseRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  // Strictly prevent any mousewheel or touch scrolling on the executive showcase sidebar
  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) return;
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('wheel', preventScroll, { passive: false });
    el.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      el.removeEventListener('wheel', preventScroll);
      el.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your editorial administrator credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      // Success
      setSuccess(true);
      if (rememberMe) {
        localStorage.setItem('beyond_admin_token', data.token);
        localStorage.setItem('beyond_admin_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('beyond_admin_token', data.token);
        sessionStorage.setItem('beyond_admin_user', JSON.stringify(data.user));
      }

      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(data.user, data.token);
      }

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-viewport">
      <div className="admin-login-layout-card">
        {/* ========================================================
            LEFT COLUMN: EXECUTIVE SHOWCASE & MASTHEAD BRANDING
            ======================================================== */}
        <div className="admin-showcase-panel" ref={showcaseRef}>
          <div className="admin-showcase-top">
            {/* Logo Badge */}
            <div className="admin-brand-lockup">
              <img
                src="/beyond-headlines-logo.png"
                alt="Beyond Headlines"
                className="admin-brand-img"
              />
            </div>

            <div className="admin-masthead-pill">
              <Shield size={12} className="admin-masthead-icon" />
              <span>EDITORIAL CONSOLE • SECURE GATEWAY</span>
            </div>

            <h2 className="admin-showcase-headline">
              Your newsroom, under complete control.
            </h2>

            <p className="admin-showcase-subtext">
              Unified command center for Senior Desk Editors, Bureau Chiefs, and System Administrators. 
              Manage dispatches, desks, comments, ad banners, and publication architecture — all from one place.
            </p>
          </div>

          {/* Core Modules Grid (Inspired by Modern Newsroom CMS) */}
          <div className="admin-modules-grid">
            <div className="module-feature-chip">
              <Newspaper size={14} className="module-icon" />
              <span>Articles & Dispatches</span>
            </div>
            <div className="module-feature-chip">
              <Radio size={14} className="module-icon" />
              <span>8 Editorial Desks</span>
            </div>
            <div className="module-feature-chip">
              <MessageSquare size={14} className="module-icon" />
              <span>Comments Moderation</span>
            </div>
            <div className="module-feature-chip">
              <Clock size={14} className="module-icon" />
              <span>Traffic & Analytics</span>
            </div>
          </div>

          {/* Telemetry Status Badges */}
          <div className="admin-telemetry-grid">
            <div className="telemetry-badge-card">
              <div className="telemetry-header">
                <span className="telemetry-pulse-dot" />
                <span className="telemetry-label">Newsroom CMS</span>
              </div>
              <span className="telemetry-value">Operational • v4.8.2</span>
            </div>

            <div className="telemetry-badge-card">
              <div className="telemetry-header">
                <Lock size={12} className="telemetry-icon-gold" />
                <span className="telemetry-label">Session Protocol</span>
              </div>
              <span className="telemetry-value">256-Bit Encrypted</span>
            </div>
          </div>

          {/* Editorial Code Quote */}
          <div className="admin-quote-card">
            <p className="admin-quote-text">
              "Depth in journalism requires both intellectual fearlessness and procedural rigor. 
              Every published word carries public accountability."
            </p>
            <span className="admin-quote-author">— Office of the Editor-in-Chief</span>
          </div>

          {/* Bottom Security Assurance */}
          <div className="admin-showcase-footer">
            <span>© {new Date().getFullYear()} Beyond Headlines Media Group</span>
            <span>All administrative access logged & monitored</span>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: PREMIUM AUTHENTICATION FORM
            ======================================================== */}
        <div className="admin-auth-panel">
          <div className="admin-auth-inner">
            {/* Back to main site */}
            <div className="admin-return-bar">
              <Link to="/" className="admin-return-link">
                <ArrowLeft size={14} /> Back to public site
              </Link>
              <div className="admin-badge-secure">
                <ShieldCheck size={13} />
                <span>RESTRICTED ACCESS</span>
              </div>
            </div>

            {/* Title Lockup */}
            <div className="admin-form-header">
              <div className="admin-auth-icon-circle">
                <Key size={22} className="admin-key-icon" />
              </div>
              <h1 className="admin-portal-title">Admin Sign In</h1>
              <p className="admin-portal-desc">
                Enter your credentials to access the editorial management dashboard.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="admin-alert-box admin-alert-error">
                <AlertCircle size={16} className="alert-icon-error" />
                <div className="alert-text-body">
                  <strong>Access Denied</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="admin-alert-box admin-alert-success">
                <CheckCircle2 size={16} className="alert-icon-success" />
                <div className="alert-text-body">
                  <strong>Access Granted</strong>
                  <span>Credentials verified. Redirecting to Publishing Console...</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="admin-login-form">
              {/* Username or Email Address */}
              <div className="admin-input-group">
                <label className="admin-field-label">
                  Username or Administrative Email
                </label>
                <div className="admin-input-shell">
                  <Mail size={16} className="admin-input-icon" />
                  <input
                    type="text"
                    className="admin-text-input"
                    placeholder="Enter username or email (e.g. admin or editor@beyondheadlines.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="admin-input-group">
                <div className="admin-label-flex">
                  <label className="admin-field-label">
                    Password / Access Key
                  </label>
                  <button
                    type="button"
                    className="admin-forgot-btn"
                    onClick={() => alert('For security protocol or administrative access resets, please contact security-ops@beyondheadlines.com.')}
                  >
                    Forgot key?
                  </button>
                </div>
                <div className="admin-input-shell">
                  <Lock size={16} className="admin-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-text-input"
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide security key' : 'Show security key'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Optional 2FA PIN toggle */}
              <div className="admin-two-factor-row">
                <button
                  type="button"
                  className="admin-toggle-pin-btn"
                  onClick={() => setShowPinInput(!showPinInput)}
                >
                  <Key size={13} />
                  <span>{showPinInput ? 'Hide Hardware Token Field' : '+ Enter Hardware Token / 2FA PIN (Optional)'}</span>
                </button>
              </div>

              {showPinInput && (
                <div className="admin-input-group admin-pin-input-group">
                  <label className="admin-field-label">
                    Hardware Authenticator PIN (Optional)
                  </label>
                  <div className="admin-input-shell">
                    <ShieldCheck size={16} className="admin-input-icon" />
                    <input
                      type="text"
                      className="admin-text-input"
                      placeholder="e.g., 849-201"
                      value={twoFactorPin}
                      onChange={(e) => setTwoFactorPin(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                </div>
              )}

              {/* Workstation Options */}
              <div className="admin-options-row">
                <label className="admin-remember-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this workstation for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="admin-submit-btn"
                disabled={loading || success}
              >
                {loading ? (
                  <span className="admin-btn-spinner-content">
                    <span className="admin-spinner" />
                    <span>Verifying Security Protocol...</span>
                  </span>
                ) : (
                  <span className="admin-btn-label-content">
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>

            {/* Footer Credentials Note & Staff Registration */}
            <div className="admin-form-extra-actions">
              <button
                type="button"
                className="admin-register-link-btn"
                onClick={() => alert('Staff Onboarding: To request correspondent credentials or bureau editor access, please contact the publishing board at editorial-board@beyondheadlines.com.')}
              >
                Request Editorial / Bureau Account
              </button>
            </div>

            <div className="admin-security-audit-footer">
              <ShieldCheck size={14} className="audit-shield-icon" />
              <span>
                Restricted editorial system • Unauthorized access is monitored & strictly prohibited
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
