import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Bookmark, LogOut, Radio, X, LogIn, UserPlus, Settings } from 'lucide-react';

const TOPICS = [
  'Home',
  'Politics',
  'Agriculture',
  'Education',
  'Economy',
  'Technology',
  'Health',
  'World',
  'Environment'
];

export default function Header({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
  currentUser,
  onOpenAuth,
  onLogout,
  savedCount,
  onOpenBookmarks,
  onOpenSettings
}) {
  const navigate = useNavigate();
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDateStr(now.toLocaleDateString('en-US', options));
  }, []);

  // Click outside to dismiss user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const userInitial = currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  const handleTopicClick = (topic) => {
    navigate('/');
    onSelectCategory(topic === 'Home' ? 'All' : topic);
  };

  return (
    <div className="site-header-wrapper">
      {/* SECTION 1: TOP MAIN HEADER (Logo on Left, Date/Search/Account on Right) */}
      <div className="main-top-header">
        <div className="container header-top-inner">
          {/* Top Left: BEYOND HEADLINES Logo (Static Image) */}
          <div className="header-logo-lockup">
            <img
              src="/beyond-headlines-logo.png"
              alt="BEYOND HEADLINES — Truth. Depth. Perspective."
              className="header-brand-logo-img"
            />
          </div>

          {/* Top Right: Date, Weather, Search, Saved, Account */}
          <div className="header-top-right">
            <div className="header-date-weather">
              <span className="header-date">{currentDateStr}</span>
              <span className="header-meta-sep">•</span>
              <span className="header-weather">68°F Partly Cloudy</span>
            </div>

            <div className="header-actions-group">
              {/* Search Toggle / Inline Input */}
              {isSearchOpen ? (
                <div className="header-search-inline">
                  <Search size={15} className="search-icon-navy" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="header-search-input"
                    id="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="header-search-clear"
                      onClick={() => onSearchChange('')}
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="header-search-close"
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    title="Close search"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="header-search-btn"
                  onClick={() => setIsSearchOpen(true)}
                  title="Search Articles"
                  id="search-toggle-btn"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Saved Articles Shortcut */}
              <button
                type="button"
                className="header-saved-btn"
                onClick={onOpenBookmarks}
                title="View Saved Articles"
              >
                <Bookmark size={15} />
                <span>Saved ({savedCount})</span>
              </button>

              {/* User Account / Profile Dropdown */}
              <div className="header-user-wrapper" ref={userDropdownRef}>
                <button
                  type="button"
                  className={`header-avatar-circle ${currentUser ? 'has-user' : 'guest-user'}`}
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  title={currentUser ? `${currentUser.name} (Account Menu)` : 'Reader Profile (Login / Register)'}
                  id="user-avatar-btn"
                  aria-expanded={userDropdownOpen}
                >
                  {currentUser ? (
                    currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="header-avatar-img"
                      />
                    ) : (
                      <span className="header-avatar-initial">{userInitial}</span>
                    )
                  ) : (
                    <User size={18} className="guest-profile-icon" />
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="header-user-dropdown" role="menu">
                    {!currentUser ? (
                      /* Guest User: ONLY TWO OPTIONS (Login & Register) */
                      <div className="dropdown-guest-panel">
                        <div className="dropdown-prompt-box">
                          <span className="dropdown-prompt-title">Reader Account</span>
                          <span className="dropdown-prompt-desc">
                            Sign in to access your dispatches, bookmarks, and account settings.
                          </span>
                        </div>
                        <button
                          type="button"
                          className="dropdown-item dropdown-item-primary"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAuth('login');
                          }}
                          id="dropdown-login-btn"
                        >
                          <LogIn size={15} />
                          <span>Log In</span>
                        </button>

                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAuth('register');
                          }}
                          id="dropdown-register-btn"
                        >
                          <UserPlus size={15} />
                          <span>Register</span>
                        </button>
                      </div>
                    ) : (
                      /* Logged In User: Profile, Settings, Bookmarks, Logout */
                      <div className="dropdown-logged-panel">
                        <div className="dropdown-header">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar}
                              alt=""
                              className="dropdown-avatar-thumb"
                            />
                          ) : (
                            <div className="dropdown-avatar-circle">
                              <span>{userInitial}</span>
                            </div>
                          )}
                          <div className="dropdown-user-info">
                            <strong className="dropdown-user-name">{currentUser.name}</strong>
                            <span className="dropdown-email">{currentUser.email}</span>
                          </div>
                        </div>

                        <div className="dropdown-menu-list">
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              navigate('/settings');
                            }}
                            id="dropdown-settings-btn"
                          >
                            <Settings size={15} />
                            <span>Settings</span>
                          </button>

                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenBookmarks && onOpenBookmarks();
                            }}
                            id="dropdown-saved-btn"
                          >
                            <Bookmark size={15} />
                            <span>Saved Articles ({savedCount})</span>
                          </button>

                          <div className="dropdown-divider"></div>

                          <button
                            type="button"
                            className="dropdown-item text-danger"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onLogout && onLogout();
                            }}
                            id="dropdown-logout-btn"
                          >
                            <LogOut size={15} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DISTINCT NAVBAR SECTION BELOW HEADER */}
      <nav className="distinct-navbar-section border-single-top border-single-bottom" aria-label="News Desks">
        <div className="container navbar-inner">
          <ul className="navbar-links-list">
            {TOPICS.map((topic) => {
              const isActive =
                (activeCategory === 'All' && topic === 'Home') ||
                activeCategory.toLowerCase() === topic.toLowerCase();

              return (
                <li key={topic} className="navbar-item">
                  <button
                    type="button"
                    className={`navbar-topic-link ${isActive ? 'active-navbar-link' : ''}`}
                    onClick={() => handleTopicClick(topic)}
                    id={`nav-${topic.toLowerCase()}`}
                  >
                    {topic}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
