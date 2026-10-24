import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2,
  Check
} from 'lucide-react';

export default function AdminLoginPage({ apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'), onAdminLoginSuccess }) {
  const navigate = useNavigate();
  const showcaseRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Prevent any mousewheel or touch scrolling on the left sidebar
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
      setError('Please provide your administrative credentials.');
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
      }, 1000);
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
            LEFT COLUMN: CLEAN NEWSROOM BRANDING
            ======================================================== */}
        <div className="admin-showcase-panel" ref={showcaseRef}>
          <div className="admin-showcase-content">
            <div className="admin-brand-lockup">
              <img
                src="/beyond-headlines-logo.png"
                alt="Beyond Headlines"
                className="admin-brand-img"
              />
            </div>

            <h2 className="admin-showcase-headline">
              Editorial Console
            </h2>

            <p className="admin-showcase-subtext">
              Authorized publishing console for Beyond Headlines editors, bureau correspondents, and newsroom administrators.
            </p>

            <ul className="admin-showcase-feature-list">
              <li>
                <Check size={16} className="feature-check-icon" />
                <span>Publish and edit news dispatches</span>
              </li>
              <li>
                <Check size={16} className="feature-check-icon" />
                <span>Manage editorial desks and breaking alerts</span>
              </li>
              <li>
                <Check size={16} className="feature-check-icon" />
                <span>Moderate reader discussions and community</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: FOCUSED SIGN-IN FORM
            ======================================================== */}
        <div className="admin-auth-panel">
          <div className="admin-auth-inner">
            {/* Back link */}
            <div className="admin-return-bar">
              <Link to="/" className="admin-return-link">
                <ArrowLeft size={14} /> Back to public site
              </Link>
            </div>

            {/* Title Lockup */}
            <div className="admin-form-header">
              <h1 className="admin-portal-title">Admin Sign In</h1>
              <p className="admin-portal-desc">
                Enter your administrative credentials to continue.
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
                  <span>Redirecting to Publishing Console...</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="admin-login-form">
              {/* Username or Email Address */}
              <div className="admin-input-group">
                <label className="admin-field-label">
                  Username or Email
                </label>
                <div className="admin-input-shell">
                  <Mail size={16} className="admin-input-icon" />
                  <input
                    type="text"
                    className="admin-text-input"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="admin-input-group">
                <label className="admin-field-label">
                  Password
                </label>
                <div className="admin-input-shell">
                  <Lock size={16} className="admin-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-text-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="admin-options-row">
                <label className="admin-remember-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this device</span>
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
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="admin-btn-label-content">
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
