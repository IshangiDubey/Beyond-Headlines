import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BreakingTicker from './components/BreakingTicker';
import AuthModal from './components/AuthModal';
import BookmarksDrawer from './components/BookmarksDrawer';
import ShareModal from './components/ShareModal';
import SettingsPage from './pages/SettingsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [sharingArticle, setSharingArticle] = useState(null);

  // Authentication State (Public Readers)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gazette_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin User State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('beyond_admin_user') || sessionStorage.getItem('beyond_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Bookmarks State
  const [savedArticleIds, setSavedArticleIds] = useState(() => {
    try {
      const saved = localStorage.getItem('gazette_bookmarks');
      return saved ? JSON.parse(saved) : ['art-1', 'art-4'];
    } catch {
      return ['art-1', 'art-4'];
    }
  });

  // Fetch articles based on category and search
  useEffect(() => {
    let isCancelled = false;
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== 'All') {
          params.append('category', activeCategory);
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        const res = await fetch(`${API_BASE_URL}/api/articles?${params.toString()}`);
        if (!res.ok) throw new Error('Could not load dispatches.');
        const data = await res.json();
        if (!isCancelled) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchArticles, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [activeCategory, searchQuery]);

  // Fetch Trending / Most Read Articles
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/articles/trending?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setTrendingArticles(data.articles || []);
        }
      } catch (err) {
        console.warn('Trending fetch warning:', err.message);
      }
    };
    fetchTrending();
  }, []);

  // Filter Breaking Articles for Ticker
  const breakingArticles = useMemo(() => {
    const flagged = articles.filter((a) => a.breaking);
    return flagged.length > 0 ? flagged : articles.slice(0, 3);
  }, [articles]);

  // Saved Articles List objects
  const savedArticlesList = useMemo(() => {
    return articles.filter((a) => savedArticleIds.includes(a.id || a._id));
  }, [articles, savedArticleIds]);

  const handleToggleBookmark = async (articleId) => {
    const nextSaved = savedArticleIds.includes(articleId)
      ? savedArticleIds.filter((id) => id !== articleId)
      : [...savedArticleIds, articleId];

    setSavedArticleIds(nextSaved);
    localStorage.setItem('gazette_bookmarks', JSON.stringify(nextSaved));

    const token = localStorage.getItem('gazette_token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ articleId })
        });
      } catch (err) {
        console.warn('Sync bookmark error:', err.message);
      }
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData, token) => {
    setCurrentUser(userData);
    localStorage.setItem('gazette_user', JSON.stringify(userData));
    localStorage.setItem('gazette_token', token);
    if (userData.savedArticles && Array.isArray(userData.savedArticles)) {
      setSavedArticleIds(userData.savedArticles);
      localStorage.setItem('gazette_bookmarks', JSON.stringify(userData.savedArticles));
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gazette_user');
    localStorage.removeItem('gazette_token');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('gazette_user', JSON.stringify(updatedUser));
  };

  return (
    <div className={`site-wrapper ${isAdminRoute ? 'admin-active-mode' : ''}`}>
      {/* 1. Public Top Header & Distinct Navbar Section (Hidden on Admin Routes) */}
      {!isAdminRoute && (
        <Header
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          savedCount={savedArticleIds.length}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
        />
      )}

      {/* 2. Space + Breaking News Card (Hidden on Admin Routes) */}
      {!isAdminRoute && (
        <div className="breaking-news-space-wrapper">
          <div className="container">
            <BreakingTicker breakingArticles={breakingArticles} />
          </div>
        </div>
      )}

      {/* 3. Dynamic Application Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              articles={articles}
              trendingArticles={trendingArticles}
              loading={loading}
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              savedArticleIds={savedArticleIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenShare={(art) => setSharingArticle(art)}
            />
          }
        />
        <Route
          path="/news/:slug"
          element={
            <ArticleDetailPage
              apiBaseUrl={API_BASE_URL}
              allArticles={articles}
              savedArticleIds={savedArticleIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenShare={(art) => setSharingArticle(art)}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              apiBaseUrl={API_BASE_URL}
              onOpenAuth={handleOpenAuth}
            />
          }
        />

        {/* ========================================================
            ADMIN EDITORIAL & PUBLISHING ROUTES
            ======================================================== */}
        <Route
          path="/admin/login"
          element={
            <AdminLoginPage
              apiBaseUrl={API_BASE_URL}
              onAdminLoginSuccess={(user) => setAdminUser(user)}
            />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboardPage
              adminUser={adminUser}
              onAdminLogout={() => setAdminUser(null)}
              apiBaseUrl={API_BASE_URL}
              articles={articles}
            />
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        apiBaseUrl={API_BASE_URL}
        initialMode={authModalMode}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedArticles={savedArticlesList}
        onRemoveBookmark={handleToggleBookmark}
      />

      {/* Share Modal (WhatsApp, Facebook, Twitter, Instagram, Copy Link) */}
      <ShareModal
        isOpen={Boolean(sharingArticle)}
        onClose={() => setSharingArticle(null)}
        article={sharingArticle}
      />

      {/* Public Editorial Footer (Hidden on Admin Routes) */}
      {!isAdminRoute && (
        <Footer
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}
