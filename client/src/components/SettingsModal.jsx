import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Camera, Check, Sparkles, Bell, Shield, ArrowRight, Upload, Trash2 } from 'lucide-react';

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

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  apiBaseUrl
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('All');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'security'
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setAvatar(currentUser.avatar || '');
      setBio(currentUser.bio || 'In-depth longform reader & investigative journalism follower');
      setPreferredCategory(currentUser.preferredCategory || 'All');
      setNotificationsEnabled(currentUser.notificationsEnabled !== false);
      setSuccessMessage('');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [currentUser, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

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
      // 1. If backend token exists, sync with server
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
          console.warn('Backend sync warning (offline/in-memory mode):', apiErr.message);
        }
      }

      // 2. Update local state and storage
      onUpdateUser(updatedUser);
      setSuccessMessage('Profile and settings updated successfully!');

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className="settings-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
    >
      <div className="settings-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <h3 id="settings-heading" className="settings-main-title">
              Account Settings & Preferences
            </h3>
            <p className="settings-subtitle">
              Manage your personal identity, Gmail address, avatar, and reading experience.
            </p>
          </div>
          <button
            type="button"
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-nav-tabs">
          <button
            type="button"
            className={`settings-nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} />
            <span>Profile & Photo</span>
          </button>
          <button
            type="button"
            className={`settings-nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Bell size={15} />
            <span>Reading Preferences</span>
          </button>
          <button
            type="button"
            className={`settings-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={15} />
            <span>Security & Gmail</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="settings-form">
          {errorMessage && (
            <div className="settings-alert alert-error">
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="settings-alert alert-success">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: Profile & Photo */}
          {activeTab === 'profile' && (
            <div className="settings-tab-pane">
              {/* Profile Avatar Showcase */}
              <div className="settings-avatar-section">
                <div className="avatar-preview-container">
                  {avatar ? (
                    <img src={avatar} alt={name} className="avatar-preview-img" />
                  ) : (
                    <div className="avatar-preview-fallback">
                      <span>{userInitial}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="avatar-upload-trigger"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    title="Upload custom image"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="avatar-info-box">
                  <h4 className="avatar-section-title">Profile Picture</h4>
                  <p className="avatar-section-desc">
                    Choose from our curated editorial avatars, upload an image from your device, or paste a direct image URL.
                  </p>

                  <div className="avatar-action-row">
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
                      <Upload size={14} /> Upload Image
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
                </div>
              </div>

              {/* Preset Avatars Selector */}
              <div className="preset-avatars-group">
                <span className="preset-avatars-label">OR CHOOSE A CURATED EDITORIAL AVATAR:</span>
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

              {/* Direct Image URL input */}
              <div className="settings-field">
                <label className="settings-label" htmlFor="avatar-url-input">
                  Custom Image URL (Optional)
                </label>
                <input
                  id="avatar-url-input"
                  type="url"
                  className="settings-input"
                  placeholder="https://images.unsplash.com/... or direct web link"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              {/* Name & Bio */}
              <div className="settings-fields-grid">
                <div className="settings-field">
                  <label className="settings-label" htmlFor="user-name-input">
                    Full Name <span className="text-required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      id="user-name-input"
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
                  <label className="settings-label" htmlFor="user-email-input">
                    Gmail / Email Address <span className="text-required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="user-email-input"
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
                <label className="settings-label" htmlFor="user-bio-input">
                  Reader Bio & Focus
                </label>
                <textarea
                  id="user-bio-input"
                  className="settings-textarea"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell our editorial board about your areas of research or reading interest..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: Reading Preferences */}
          {activeTab === 'preferences' && (
            <div className="settings-tab-pane">
              <div className="settings-field">
                <label className="settings-label">Primary News Desk & Topic Preference</label>
                <p className="settings-help-text">
                  Choose your default topic desk. Stories from this category will be highlighted in your personal dispatches.
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
                  <h4 className="toggle-title">Breaking News Marquee Alerts</h4>
                  <p className="toggle-subtitle">
                    Display continuous investigative flashes and urgent dispatches right below the header.
                  </p>
                </div>
                <label className="switch-toggle" htmlFor="alerts-toggle">
                  <input
                    id="alerts-toggle"
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Gmail */}
          {activeTab === 'security' && (
            <div className="settings-tab-pane">
              <div className="security-notice-box">
                <Shield size={20} className="security-icon" />
                <div>
                  <strong>Account Security & Verification</strong>
                  <p>Your Beyond Headlines account is secured. You can update your Gmail login or set a new password below.</p>
                </div>
              </div>

              <div className="settings-field">
                <label className="settings-label" htmlFor="security-email-input">
                  Verified Gmail / Primary Login
                </label>
                <input
                  id="security-email-input"
                  type="email"
                  className="settings-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="settings-fields-grid">
                <div className="settings-field">
                  <label className="settings-label" htmlFor="curr-password-input">
                    Current Password
                  </label>
                  <input
                    id="curr-password-input"
                    type="password"
                    className="settings-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label" htmlFor="new-password-input">
                    New Password (Optional)
                  </label>
                  <input
                    id="new-password-input"
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

          {/* Bottom Actions Footer */}
          <div className="settings-footer">
            <button
              type="button"
              className="btn-settings-cancel"
              onClick={onClose}
              disabled={loading}
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
      </div>
    </div>
  );
}
