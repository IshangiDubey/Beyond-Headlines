import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Camera, 
  Upload, 
  Trash2, 
  Check, 
  Bell, 
  Shield, 
  Bookmark, 
  ChevronRight, 
  Lock, 
  Sliders, 
  Compass, 
  AlertCircle 
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Correspondent', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-2', label: 'Bureau Chief', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-3', label: 'Investigator', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-4', label: 'Economist', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-5', label: 'Scholar', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-6', label: 'Observer', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80' }
];

const CATEGORIES = [
  'All',
  'Politics',
  'Agriculture',
  'Education',
  'Economy',
  'Technology',
  'Health',
  'World',
  'Environment'
];

export default function SettingsPage({
  currentUser,
  onUpdateUser,
  apiBaseUrl,
  onOpenAuth
}) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('All');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'preferences' | 'security'
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Account Settings & Profile — BEYOND HEADLINES';
    return () => {
      document.title = 'BEYOND HEADLINES | Journal of In-Depth Record';
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAvatar(currentUser.avatar || '');
      setBio(currentUser.bio || 'In-depth longform reader & investigative journalism follower');
      setPreferredCategory(currentUser.preferredCategory || 'All');
      setNotificationsEnabled(currentUser.notificationsEnabled !== false);
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [currentUser]);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name cannot be blank.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }

    setLoading(true);

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: avatar.trim(),
      bio: bio.trim(),
      preferredCategory,
      notificationsEnabled
    };

    try {
      // Sync with server if token exists
      const token = localStorage.getItem('gazette_token');
      if (token) {
        try {
          await fetch(`${apiBaseUrl}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: updatedUser.name,
              email: updatedUser.email,
              avatar: updatedUser.avatar,
              bio: updatedUser.bio,
              preferredCategory: updatedUser.preferredCategory,
              notificationsEnabled: updatedUser.notificationsEnabled,
              currentPassword: currentPassword || undefined,
              newPassword: newPassword || undefined
            })
          });
        } catch (apiErr) {
          console.warn('Backend profile sync note:', apiErr.message);
        }
      }

      onUpdateUser(updatedUser);
      setSuccessMessage('Profile and settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';

  // If user is not logged in, show access required prompt
  if (!currentUser) {
    return (
      <div className="settings-page-wrapper">
        <div className="container" style={{ padding: '4.5rem 1.25rem', textAlign: 'center', maxWidth: '640px' }}>
          <div className="settings-logged-out-card">
            <div className="logged-out-icon-wrap">
              <User size={32} />
            </div>
            <h2 className="logged-out-title">Account Access Required</h2>
            <p className="logged-out-desc">
              Please sign in to your Beyond Headlines reader account to view and customize your profile picture, Gmail address, and reading preferences.
            </p>
            <div className="logged-out-actions">
              <button
                type="button"
                className="btn-settings-save"
                onClick={() => onOpenAuth && onOpenAuth('login')}
              >
                Sign In to Your Account
              </button>
              <Link to="/" className="btn-settings-cancel" style={{ textDecoration: 'none' }}>
                Return to Front Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page-wrapper">
      <div className="container settings-page-container">
        {/* Navigation Breadcrumb Bar */}
        <div className="detail-breadcrumb-bar settings-breadcrumb-bar">
          <button
            type="button"
            className="detail-back-button"
            onClick={() => navigate(-1)}
            title="Go back to previous page"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <nav className="detail-breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <ChevronRight size={13} className="breadcrumb-arrow" />
            <span className="breadcrumb-category">Reader Account</span>
            <ChevronRight size={13} className="breadcrumb-arrow" />
            <span className="breadcrumb-current">Settings & Profile</span>
          </nav>
        </div>

        {/* Page Main Header */}
        <div className="settings-page-header">
          <div>
            <h1 className="settings-page-title">Account Settings & Profile</h1>
            <p className="settings-page-subtitle">
              Manage your personal editorial credentials, profile picture, Gmail address, and news topic preferences.
            </p>
          </div>
          <button
            type="button"
            className="btn-settings-save"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="settings-page-alert alert-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="settings-page-alert alert-success">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main 2-Column Dashboard Layout */}
        <div className="settings-dashboard-grid">
          {/* Left Column: Account Card & Section Navigator */}
          <aside className="settings-sidebar-col">
            <div className="settings-account-card">
              <div className="sidebar-avatar-container">
                {avatar ? (
                  <img src={avatar} alt={name} className="sidebar-avatar-img" />
                ) : (
                  <div className="sidebar-avatar-fallback">
                    <span>{userInitial}</span>
                  </div>
                )}
              </div>
              <div className="sidebar-user-details">
                <h3 className="sidebar-user-name">{name || 'Reader'}</h3>
                <span className="sidebar-user-email">{email}</span>
                <span className="sidebar-role-badge">Verified Reader</span>
              </div>
            </div>

            <nav className="settings-section-nav" aria-label="Settings Sections">
              <button
                type="button"
                className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <User size={16} />
                <span>Profile & Picture</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveSection('preferences')}
              >
                <Compass size={16} />
                <span>Reading Preferences</span>
              </button>

              <button
                type="button"
                className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => setActiveSection('security')}
              >
                <Shield size={16} />
                <span>Security & Password</span>
              </button>
            </nav>

            <div className="settings-sidebar-tip">
              <strong>EDITORIAL PRIVACY NOTE</strong>
              <p>
                Beyond Headlines guarantees editorial privacy. Your reading telemetry and bookmarks are strictly protected.
              </p>
            </div>
          </aside>

          {/* Right Column: Form Sections */}
          <main className="settings-content-col">
            <form onSubmit={handleSubmit} className="settings-full-form">
              {/* SECTION 1: Profile & Photo */}
              {activeSection === 'profile' && (
                <div className="settings-card-block">
                  <div className="card-block-header">
                    <h2 className="card-block-title">Profile Picture & Identity</h2>
                    <p className="card-block-desc">
                      Customize how your profile appears across Beyond Headlines dispatches, comments, and navigation.
                    </p>
                  </div>

                  {/* Avatar Showcase */}
                  <div className="settings-avatar-showcase">
                    <div className="avatar-preview-container-lg">
                      {avatar ? (
                        <img src={avatar} alt={name} className="avatar-preview-img-lg" />
                      ) : (
                        <div className="avatar-preview-fallback-lg">
                          <span>{userInitial}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="avatar-upload-trigger-lg"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        title="Upload picture from device"
                      >
                        <Camera size={16} />
                      </button>
                    </div>

                    <div className="avatar-details-box">
                      <div className="avatar-upload-cta">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="btn-settings-secondary"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          <Upload size={14} /> Upload Custom Photo
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            className="btn-settings-ghost text-danger"
                            onClick={() => setAvatar('')}
                          >
                            <Trash2 size={14} /> Remove Photo
                          </button>
                        )}
                      </div>
                      <span className="avatar-spec-note">
                        Recommended: Square JPG, PNG, or WebP. Maximum file size: 2MB.
                      </span>
                    </div>
                  </div>

                  {/* Preset Avatars Selector */}
                  <div className="preset-avatars-section">
                    <span className="preset-avatars-label">CHOOSE FROM CURATED EDITORIAL AVATARS:</span>
                    <div className="preset-avatars-grid">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = avatar === preset.url;
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            className={`preset-avatar-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => setAvatar(preset.url)}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="preset-thumb" />
                            {isSelected && (
                              <div className="preset-check-badge">
                                <Check size={12} color="#ffffff" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Photo URL */}
                  <div className="settings-field">
                    <label className="settings-label" htmlFor="page-avatar-url">
                      Custom Image URL (Web Link)
                    </label>
                    <input
                      id="page-avatar-url"
                      type="url"
                      className="settings-input"
                      placeholder="https://images.unsplash.com/... or direct image link"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                  </div>

                  <div className="settings-divider"></div>

                  {/* Personal Details */}
                  <div className="settings-fields-grid">
                    <div className="settings-field">
                      <label className="settings-label" htmlFor="page-user-name">
                        Full Name <span className="text-required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <User size={16} className="input-icon" />
                        <input
                          id="page-user-name"
                          type="text"
                          className="settings-input has-icon"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Eleanor Vance"
                          required
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label" htmlFor="page-user-email">
                        Gmail / Email Address <span className="text-required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <Mail size={16} className="input-icon" />
                        <input
                          id="page-user-email"
                          type="email"
                          className="settings-input has-icon"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. reader@gmail.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label" htmlFor="page-user-bio">
                      Reader Bio & Editorial Focus
                    </label>
                    <textarea
                      id="page-user-bio"
                      className="settings-textarea"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about your professional background, research topics, or analytical interests..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: Reading Preferences */}
              {activeSection === 'preferences' && (
                <div className="settings-card-block">
                  <div className="card-block-header">
                    <h2 className="card-block-title">Reading & Focus Topic Preferences</h2>
                    <p className="card-block-desc">
                      Tailor your front page and daily dispatch hierarchy according to your areas of interest.
                    </p>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">Primary News Desk</label>
                    <p className="settings-help-text">
                      Stories from this category will take priority in your front-page highlights and reading recommendations.
                    </p>
                    <div className="category-chips-grid">
                      {CATEGORIES.map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          className={`pref-category-chip ${preferredCategory === cat ? 'active' : ''}`}
                          onClick={() => setPreferredCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="settings-divider"></div>

                  <div className="settings-toggle-row">
                    <div>
                      <h4 className="toggle-title">Continuous Breaking News Marquee</h4>
                      <p className="toggle-subtitle">
                        Stream real-time breaking news updates and flashes directly underneath the primary navigation bar.
                      </p>
                    </div>
                    <label className="switch-toggle" htmlFor="page-alerts-toggle">
                      <input
                        id="page-alerts-toggle"
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 3: Security & Password */}
              {activeSection === 'security' && (
                <div className="settings-card-block">
                  <div className="card-block-header">
                    <h2 className="card-block-title">Account Security & Credentials</h2>
                    <p className="card-block-desc">
                      Manage your primary authentication password and verified Gmail credentials.
                    </p>
                  </div>

                  <div className="security-notice-box">
                    <Shield size={20} className="security-icon" />
                    <div>
                      <strong>Encrypted Account Security</strong>
                      <p>
                        Your password is encrypted with cryptographic salting. We recommend using a unique password with at least 8 characters.
                      </p>
                    </div>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label" htmlFor="page-security-email">
                      Current Verified Gmail
                    </label>
                    <input
                      id="page-security-email"
                      type="email"
                      className="settings-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="settings-fields-grid">
                    <div className="settings-field">
                      <label className="settings-label" htmlFor="page-curr-pass">
                        Current Password
                      </label>
                      <input
                        id="page-curr-pass"
                        type="password"
                        className="settings-input"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label" htmlFor="page-new-pass">
                        New Password (Optional)
                      </label>
                      <input
                        id="page-new-pass"
                        type="password"
                        className="settings-input"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Save Action Bar */}
              <div className="settings-page-bottom-actions">
                <button
                  type="button"
                  className="btn-settings-cancel"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-settings-save"
                  disabled={loading}
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
