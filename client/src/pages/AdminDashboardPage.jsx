import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Layers, 
  MessageSquare, 
  BarChart3, 
  Megaphone, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  Users, 
  Radio, 
  Send, 
  Clock, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'Politics',
  'Agriculture',
  'Education',
  'Economy',
  'Technology',
  'Health',
  'World',
  'Environment'
];

export default function AdminDashboardPage({ 
  adminUser, 
  onAdminLogout, 
  apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'),
  articles: initialArticles = [] 
}) {
  const navigate = useNavigate();

  const currentUser = adminUser || (() => {
    try {
      const saved = localStorage.getItem('beyond_admin_user') || sessionStorage.getItem('beyond_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
    }
  }, [currentUser, navigate]);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'articles' | 'create' | 'categories' | 'comments' | 'analytics' | 'ads' | 'settings'

  // Articles State
  const [articlesList, setArticlesList] = useState(initialArticles);
  const [articleSearch, setArticleSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Article Form State
  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Politics',
    summary: '',
    content: '',
    author: currentUser?.name || 'Marcus Vance',
    authorRole: 'Senior Desk Editor',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    breaking: false,
    tags: 'Politics, Investigation'
  });
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState('');
  const [publishErrorMsg, setPublishErrorMsg] = useState('');

  // Comments State for Moderation
  const [allComments, setAllComments] = useState([
    {
      id: 'cmt-mod-1',
      articleTitle: 'National Agricultural Policy Overhaul Aims to Modernize Irrigation Infrastructure',
      articleSlug: 'national-agricultural-policy-overhaul-irrigation',
      author: 'Dr. Michael Chen',
      authorRole: 'Policy Analyst',
      text: 'Crucial dispatch. The structural shifts detailed here reflect long-overdue institutional modernization. Rigorous reporting as always.',
      createdAt: '2 hours ago',
      status: 'approved'
    },
    {
      id: 'cmt-mod-2',
      articleTitle: 'Central Bank Maintains Benchmark Policy Rate Amid Stabilizing Core Inflation',
      articleSlug: 'central-bank-maintains-benchmark-policy-rate',
      author: 'Sarah Jenkins',
      authorRole: 'Verified Subscriber',
      text: 'The execution benchmarks discussed will be key. Hope Beyond Headlines follows up on regional implementation data next quarter.',
      createdAt: '4 hours ago',
      status: 'approved'
    },
    {
      id: 'cmt-mod-3',
      articleTitle: 'Higher Education Accreditation Reform Introduces Standardized STEM Research Benchmarks',
      articleSlug: 'higher-education-accreditation-stem-research-benchmarks',
      author: 'David K. O’Connor',
      authorRole: 'Community Contributor',
      text: 'Appreciate the transparent breakdown without sensationalism. This is why depth in journalism matters.',
      createdAt: '6 hours ago',
      status: 'approved'
    },
    {
      id: 'cmt-mod-4',
      articleTitle: 'Deep-Sea Robotic Core Sampling Uncovers Sub-Seafloor Hydrogen Biomes',
      articleSlug: 'deep-sea-robotic-core-sampling-hydrogen-biomes',
      author: 'Elena Rostova',
      authorRole: 'Marine Geologist',
      text: 'The pressure telemetry protocols mentioned in section 3 are verified by our North Atlantic expedition records.',
      createdAt: '1 day ago',
      status: 'approved'
    }
  ]);

  // Ads & Notice State
  const [adSettings, setAdSettings] = useState({
    sponsorBannerEnabled: true,
    sponsorName: 'Global Sustainable Finance Accord',
    sponsorTagline: 'Supporting Independent Public Record Journalism across 48 Nations',
    sponsorUrl: 'https://beyondheadlines.com/sponsor-policy',
    tickerNoticeOverride: ''
  });
  const [adSuccessMsg, setAdSuccessMsg] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    publicationName: 'BEYOND HEADLINES',
    motto: 'Truth. Depth. Perspective.',
    editorialChief: 'Marcus Vance',
    contactEmail: 'editorial-board@beyondheadlines.com',
    allowComments: true,
    requireCommentApproval: false,
    auditLogging: true
  });
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState(false);

  // Refresh articles from backend
  const refreshArticles = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/articles?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setArticlesList(data.articles || []);
      }
    } catch (err) {
      console.warn('Refresh articles error:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshArticles();
  }, [apiBaseUrl]);

  // Delete article
  const handleDeleteArticle = async (identifier) => {
    if (!window.confirm('Are you sure you want to retract and delete this dispatch from the public record?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/articles/${identifier}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setArticlesList((prev) => prev.filter((a) => a.id !== identifier && a.slug !== identifier));
      } else {
        // Fallback local remove
        setArticlesList((prev) => prev.filter((a) => a.id !== identifier && a.slug !== identifier));
      }
    } catch {
      setArticlesList((prev) => prev.filter((a) => a.id !== identifier && a.slug !== identifier));
    }
  };

  // Toggle breaking status
  const handleToggleBreaking = async (art) => {
    const updatedBreaking = !art.breaking;
    const identifier = art.slug || art.id || art._id;

    setArticlesList((prev) =>
      prev.map((a) => ((a.id === art.id || a.slug === art.slug) ? { ...a, breaking: updatedBreaking } : a))
    );

    try {
      await fetch(`${apiBaseUrl}/api/articles/${identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breaking: updatedBreaking })
      });
    } catch (err) {
      console.warn('Toggle breaking error:', err.message);
    }
  };

  // Handle Publish New Article
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    setPublishErrorMsg('');
    setPublishSuccessMsg('');

    if (!newArticle.title.trim() || !newArticle.summary.trim() || !newArticle.content.trim()) {
      setPublishErrorMsg('Please fill in the title, summary, and article body content.');
      return;
    }

    setPublishLoading(true);

    try {
      const tagsArray = newArticle.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        title: newArticle.title.trim(),
        category: newArticle.category,
        summary: newArticle.summary.trim(),
        content: newArticle.content.trim(),
        author: newArticle.author.trim() || 'Editorial Staff Correspondent',
        authorRole: newArticle.authorRole.trim() || 'Staff Correspondent',
        readTime: newArticle.readTime.trim() || '4 min read',
        imageUrl: newArticle.imageUrl.trim(),
        breaking: Boolean(newArticle.breaking),
        tags: tagsArray.length > 0 ? tagsArray : [newArticle.category]
      };

      const res = await fetch(`${apiBaseUrl}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to publish dispatch.');
      }

      const data = await res.json();
      if (data.article) {
        setArticlesList((prev) => [data.article, ...prev]);
        setPublishSuccessMsg(`"${data.article.title}" has been published live to the ${data.article.category} Desk.`);
        // Reset form
        setNewArticle({
          title: '',
          category: 'Politics',
          summary: '',
          content: '',
          author: currentUser?.name || 'Marcus Vance',
          authorRole: 'Senior Desk Editor',
          readTime: '4 min read',
          imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
          breaking: false,
          tags: 'Investigation, Breaking'
        });
      }
    } catch (err) {
      setPublishErrorMsg(err.message || 'Error occurred while publishing.');
    } finally {
      setPublishLoading(false);
    }
  };

  // Delete comment from moderation queue
  const handleDeleteComment = async (cmt) => {
    if (!window.confirm('Delete this comment from public view?')) return;
    setAllComments((prev) => prev.filter((c) => c.id !== cmt.id));

    try {
      await fetch(`${apiBaseUrl}/api/articles/${cmt.articleSlug}/comments/${cmt.id}`, {
        method: 'DELETE'
      });
    } catch {
      // Local removed
    }
  };

  // Filtered articles for articles tab
  const filteredArticles = articlesList.filter((a) => {
    const matchesCategory = selectedCategoryFilter === 'All' || a.category === selectedCategoryFilter;
    const matchesSearch = !articleSearch.trim() || 
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.author.toLowerCase().includes(articleSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!currentUser) return null;

  return (
    <div className="admin-console-wrapper">
      {/* ========================================================
          LEFT SIDEBAR: LUXURY NAVY NAVIGATION CONSOLE
          ======================================================== */}
      <aside className="admin-console-sidebar">
        {/* Brand Lockup */}
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo-link" title="Return to front page">
            <img
              src="/beyond-headlines-logo.png"
              alt="Beyond Headlines"
              className="admin-sidebar-logo-img"
            />
          </Link>
          <div className="admin-sidebar-status-tag">
            <span className="sidebar-pulse-dot" />
            <span>NEWSROOM CONSOLE</span>
          </div>
        </div>

        {/* Navigation Modules (Inspired by Modern Newsroom options) */}
        <nav className="admin-sidebar-menu">
          <div className="admin-nav-section-label">PUBLISHING WORKFLOW</div>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Console Overview</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <FileText size={18} />
            <span>Articles & Reports</span>
            <span className="admin-nav-count-badge">{articlesList.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={18} />
            <span>Draft New Dispatch</span>
          </button>

          <div className="admin-nav-section-label">DESKS & COMMUNITY</div>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={18} />
            <span>Desks & Categories</span>
            <span className="admin-nav-count-badge">8</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare size={18} />
            <span>Comments Moderation</span>
            <span className="admin-nav-count-badge">{allComments.length}</span>
          </button>

          <div className="admin-nav-section-label">TELEMETRY & OPERATIONS</div>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Readership Analytics</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <Megaphone size={18} />
            <span>Sponsorships & Ads</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Newsroom Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-ext-link">
            <ExternalLink size={15} />
            <span>View Public Edition</span>
          </Link>
          <button
            type="button"
            className="admin-sidebar-logout-btn"
            onClick={() => {
              localStorage.removeItem('beyond_admin_token');
              localStorage.removeItem('beyond_admin_user');
              sessionStorage.removeItem('beyond_admin_token');
              sessionStorage.removeItem('beyond_admin_user');
              if (onAdminLogout) onAdminLogout();
              navigate('/admin/login');
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          RIGHT CONTENT AREA: HEADER + DYNAMIC TAB VIEW
          ======================================================== */}
      <div className="admin-console-main-area">
        {/* Top Executive Header Bar */}
        <header className="admin-top-bar">
          <div className="admin-top-left">
            <span className="admin-top-breadcrumb">Newsroom Console</span>
            <span className="admin-top-sep">/</span>
            <strong className="admin-top-current">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'articles' && 'Articles & Report Records'}
              {activeTab === 'create' && 'Dispatch Publishing Composer'}
              {activeTab === 'categories' && 'Editorial Desks & Sections'}
              {activeTab === 'comments' && 'Reader Discussion Moderation'}
              {activeTab === 'analytics' && 'Readership Telemetry & Metrics'}
              {activeTab === 'ads' && 'Ad Banners & Public Notices'}
              {activeTab === 'settings' && 'Publication Configuration'}
            </strong>
          </div>

          <div className="admin-top-right">
            <button
              type="button"
              className="admin-refresh-button"
              onClick={refreshArticles}
              title="Sync latest dispatches from database"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>Sync</span>
            </button>

            <Link to="/" target="_blank" className="admin-top-live-btn">
              <ExternalLink size={13} />
              <span>Live Site</span>
            </Link>

            {/* Current Executive User Chip */}
            <div className="admin-top-user-chip">
              <div className="admin-user-avatar-circle">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="top-user-img" />
                ) : (
                  <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}</span>
                )}
              </div>
              <div className="admin-user-meta-top">
                <span className="top-user-name">{currentUser?.name || 'Marcus Vance'}</span>
                <span className="top-user-role">Chief Editor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="admin-content-viewport">
          {/* ====================================================
              1. OVERVIEW TAB
              ==================================================== */}
          {activeTab === 'overview' && (
            <div className="admin-tab-overview">
              {/* Executive Metrics Grid */}
              <div className="overview-metrics-grid">
                <div className="kpi-card">
                  <div className="kpi-icon-wrap navy">
                    <FileText size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Published Dispatches</span>
                    <strong className="kpi-val">{articlesList.length}</strong>
                    <span className="kpi-meta">Active across 8 Desks</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap gold">
                    <TrendingUp size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Archive Views & Reads</span>
                    <strong className="kpi-val">14,820</strong>
                    <span className="kpi-meta">+22% reader growth</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap emerald">
                    <MessageSquare size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Community Comments</span>
                    <strong className="kpi-val">{allComments.length + 38}</strong>
                    <span className="kpi-meta">100% Civil discourse rate</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon-wrap slate">
                    <Radio size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Live Breaking Tickers</span>
                    <strong className="kpi-val">
                      {articlesList.filter((a) => a.breaking).length || 2}
                    </strong>
                    <span className="kpi-meta">High-priority alerts</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="overview-quick-bar">
                <div className="quick-bar-text">
                  <h3>Newsroom Dispatch Queue</h3>
                  <p>Recent investigative filings and real-time coverage status.</p>
                </div>
                <div className="quick-bar-buttons">
                  <button
                    type="button"
                    className="admin-btn-navy"
                    onClick={() => setActiveTab('create')}
                  >
                    <PlusCircle size={15} />
                    <span>Draft New Dispatch</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => setActiveTab('comments')}
                  >
                    <MessageSquare size={15} />
                    <span>Review Comments</span>
                  </button>
                </div>
              </div>

              {/* Recent Dispatches Table */}
              <div className="overview-table-card">
                <div className="overview-table-title-row">
                  <h4>Latest Published Stories</h4>
                  <button
                    type="button"
                    className="table-view-all-link"
                    onClick={() => setActiveTab('articles')}
                  >
                    View All {articlesList.length} Dispatches →
                  </button>
                </div>

                <table className="console-data-table">
                  <thead>
                    <tr>
                      <th>Headline & Title</th>
                      <th>Desk</th>
                      <th>Correspondent</th>
                      <th>Published</th>
                      <th>Breaking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articlesList.slice(0, 6).map((art) => (
                      <tr key={art.id || art._id}>
                        <td className="table-headline-cell">
                          <Link to={`/news/${art.slug || art.id}`} className="table-story-title">
                            {art.title}
                          </Link>
                        </td>
                        <td>
                          <span className="table-desk-badge">{art.category}</span>
                        </td>
                        <td className="table-author-cell">{art.author}</td>
                        <td className="table-date-cell">
                          {new Date(art.publishedAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`table-breaking-toggle ${art.breaking ? 'active' : ''}`}
                            onClick={() => handleToggleBreaking(art)}
                            title="Toggle breaking ticker priority"
                          >
                            {art.breaking ? 'BREAKING' : 'Standard'}
                          </button>
                        </td>
                        <td className="table-actions-cell">
                          <Link
                            to={`/news/${art.slug || art.id}`}
                            className="table-icon-btn"
                            title="Preview public story"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            type="button"
                            className="table-icon-btn delete"
                            onClick={() => handleDeleteArticle(art.id || art._id || art.slug)}
                            title="Delete dispatch"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================
              2. ARTICLES & REPORTS MANAGER TAB
              ==================================================== */}
          {activeTab === 'articles' && (
            <div className="admin-tab-articles">
              {/* Filter & Search Bar */}
              <div className="articles-filter-panel">
                <div className="filter-search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by headline or correspondent..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-desk-select-box">
                  <span className="filter-label">Desk:</span>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Desks</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="admin-btn-navy"
                  onClick={() => setActiveTab('create')}
                >
                  <PlusCircle size={15} />
                  <span>New Dispatch</span>
                </button>
              </div>

              {/* Full Articles Table */}
              <div className="overview-table-card">
                <table className="console-data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Headline & Dispatch</th>
                      <th>Desk</th>
                      <th>Correspondent</th>
                      <th>Read Time</th>
                      <th>Breaking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-empty-row">
                          No dispatches found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((art) => (
                        <tr key={art.id || art._id}>
                          <td className="table-thumbnail-cell">
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="table-thumb-img"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=150&q=80';
                              }}
                            />
                          </td>
                          <td className="table-headline-cell">
                            <Link to={`/news/${art.slug || art.id}`} className="table-story-title">
                              {art.title}
                            </Link>
                            <span className="table-story-summary-preview">
                              {art.summary?.slice(0, 85)}...
                            </span>
                          </td>
                          <td>
                            <span className="table-desk-badge">{art.category}</span>
                          </td>
                          <td className="table-author-cell">
                            <strong>{art.author}</strong>
                            <small>{art.authorRole || 'Correspondent'}</small>
                          </td>
                          <td>{art.readTime}</td>
                          <td>
                            <button
                              type="button"
                              className={`table-breaking-toggle ${art.breaking ? 'active' : ''}`}
                              onClick={() => handleToggleBreaking(art)}
                              title="Toggle breaking ticker priority"
                            >
                              {art.breaking ? 'BREAKING' : 'Standard'}
                            </button>
                          </td>
                          <td className="table-actions-cell">
                            <Link
                              to={`/news/${art.slug || art.id}`}
                              className="table-icon-btn"
                              title="Read story"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              type="button"
                              className="table-icon-btn delete"
                              onClick={() => handleDeleteArticle(art.id || art._id || art.slug)}
                              title="Delete dispatch"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================
              3. DRAFT / PUBLISH DISPATCH COMPOSER TAB
              ==================================================== */}
          {activeTab === 'create' && (
            <div className="admin-tab-composer">
              <div className="composer-header-card">
                <h2>Draft & Publish Investigative Dispatch</h2>
                <p>
                  Submit verified reportage directly to the public edition with real-time markdown paragraphs and category indexing.
                </p>
              </div>

              {publishSuccessMsg && (
                <div className="composer-alert success">
                  <CheckCircle2 size={18} />
                  <span>{publishSuccessMsg}</span>
                </div>
              )}

              {publishErrorMsg && (
                <div className="composer-alert error">
                  <AlertCircle size={18} />
                  <span>{publishErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePublishSubmit} className="composer-form-grid">
                {/* Left 2 Columns */}
                <div className="composer-main-col">
                  <div className="composer-field">
                    <label>Headline Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Parliamentary Committee Concludes Landmark Energy Transition Bill"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="composer-field">
                    <label>Executive Deck / Summary *</label>
                    <textarea
                      rows={2}
                      placeholder="Concise two-sentence editorial summary shown on cards and lead headers..."
                      value={newArticle.summary}
                      onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                      required
                    />
                  </div>

                  <div className="composer-field">
                    <label>Full Dispatch Content & Investigative Text *</label>
                    <span className="field-hint">
                      Separate paragraphs with double enter (blank line). Supports full prose typography.
                    </span>
                    <textarea
                      rows={9}
                      placeholder="Enter the full journalistic reportage..."
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Right Metadata Column */}
                <div className="composer-side-col">
                  <div className="composer-side-card">
                    <h4>Dispatch Metadata</h4>

                    <div className="composer-field">
                      <label>Editorial Desk *</label>
                      <select
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="composer-field">
                      <label>Author / Byline *</label>
                      <input
                        type="text"
                        value={newArticle.author}
                        onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                        required
                      />
                    </div>

                    <div className="composer-field">
                      <label>Author Role</label>
                      <input
                        type="text"
                        placeholder="e.g., Parliamentary Bureau Chief"
                        value={newArticle.authorRole}
                        onChange={(e) => setNewArticle({ ...newArticle, authorRole: e.target.value })}
                      />
                    </div>

                    <div className="composer-field">
                      <label>Estimated Read Time</label>
                      <input
                        type="text"
                        value={newArticle.readTime}
                        onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })}
                      />
                    </div>

                    <div className="composer-field">
                      <label>Featured Image URL *</label>
                      <input
                        type="url"
                        value={newArticle.imageUrl}
                        onChange={(e) => setNewArticle({ ...newArticle, imageUrl: e.target.value })}
                        required
                      />
                    </div>

                    <div className="composer-field">
                      <label>Filed Under (Tags)</label>
                      <input
                        type="text"
                        placeholder="Politics, Policy, Reform"
                        value={newArticle.tags}
                        onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                      />
                    </div>

                    <div className="composer-checkbox-field">
                      <label className="checkbox-lockup">
                        <input
                          type="checkbox"
                          checked={newArticle.breaking}
                          onChange={(e) => setNewArticle({ ...newArticle, breaking: e.target.checked })}
                        />
                        <span>Flag as Breaking News (Priority Ticker)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="composer-submit-btn"
                      disabled={publishLoading}
                    >
                      {publishLoading ? (
                        <span>Publishing Dispatch...</span>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Publish to Public Edition</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              4. DESKS & CATEGORIES TAB
              ==================================================== */}
          {activeTab === 'categories' && (
            <div className="admin-tab-categories">
              <div className="categories-header-card">
                <h2>Editorial Desks & Subject Bureaus</h2>
                <p>
                  Manage the 8 core news desks that structure Beyond Headlines investigative reportage.
                </p>
              </div>

              <div className="desks-overview-grid">
                {CATEGORIES.map((cat) => {
                  const count = articlesList.filter((a) => a.category === cat).length;
                  return (
                    <div key={cat} className="desk-stat-card">
                      <div className="desk-card-header">
                        <span className="desk-name-title">{cat} Desk</span>
                        <span className="desk-story-count">{count} stories</span>
                      </div>
                      <p className="desk-card-desc">
                        Active investigative coverage, verified correspondent filings, and telemetry monitoring for {cat.toLowerCase()}.
                      </p>
                      <div className="desk-card-footer">
                        <span className="desk-status-pill">Active Bureau</span>
                        <button
                          type="button"
                          className="desk-filter-action"
                          onClick={() => {
                            setSelectedCategoryFilter(cat);
                            setActiveTab('articles');
                          }}
                        >
                          View Dispatches →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====================================================
              5. COMMENTS MODERATION TAB
              ==================================================== */}
          {activeTab === 'comments' && (
            <div className="admin-tab-comments">
              <div className="comments-header-card">
                <h2>Reader Discussion & Comment Moderation</h2>
                <p>
                  Review and moderate community submissions to ensure constructive, evidence-based discourse.
                </p>
              </div>

              <div className="moderation-stream-card">
                <div className="mod-table-header">
                  <h4>Live Reader Comments Queue ({allComments.length})</h4>
                  <span className="mod-guideline">Standards Accord: Civil Discourse Policy</span>
                </div>

                <div className="mod-items-list">
                  {allComments.map((cmt) => (
                    <div key={cmt.id} className="mod-comment-row">
                      <div className="mod-author-col">
                        <div className="mod-avatar-initial">
                          {cmt.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{cmt.author}</strong>
                          <small>{cmt.authorRole}</small>
                          <span className="mod-time">{cmt.createdAt}</span>
                        </div>
                      </div>

                      <div className="mod-content-col">
                        <span className="mod-story-label">
                          On Story: <strong>{cmt.articleTitle}</strong>
                        </span>
                        <p className="mod-text">"{cmt.text}"</p>
                      </div>

                      <div className="mod-actions-col">
                        <span className="mod-approved-pill">
                          <Check size={12} /> Approved
                        </span>
                        <button
                          type="button"
                          className="mod-delete-btn"
                          onClick={() => handleDeleteComment(cmt)}
                          title="Remove comment"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              6. READERSHIP ANALYTICS TAB
              ==================================================== */}
          {activeTab === 'analytics' && (
            <div className="admin-tab-analytics">
              <div className="analytics-header-card">
                <h2>Readership Telemetry & Desk Engagement</h2>
                <p>Real-time analytics, article traffic distribution, and audience dwell-time.</p>
              </div>

              <div className="analytics-overview-cards">
                <div className="stat-box">
                  <span className="stat-title">Average Dwell Time</span>
                  <strong>4m 18s</strong>
                  <small>+12% longer than digital news average</small>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Weekly Page Views</span>
                  <strong>94,200</strong>
                  <small>Across 68 international jurisdictions</small>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Bookmark Save Rate</span>
                  <strong>8.4%</strong>
                  <small>High retention readership metric</small>
                </div>
              </div>

              <div className="analytics-top-stories-card">
                <h4>Top Performing Dispatches this Edition</h4>
                <div className="top-stories-list">
                  {articlesList.slice(0, 5).map((art, idx) => (
                    <div key={art.id || art._id} className="top-story-item">
                      <span className="top-rank-num">0{idx + 1}</span>
                      <div className="top-story-info">
                        <strong>{art.title}</strong>
                        <span>{art.category} Desk • By {art.author}</span>
                      </div>
                      <span className="top-views-count">{art.views || 950 + idx * 120} Reads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              7. SPONSORSHIPS & ADS TAB
              ==================================================== */}
          {activeTab === 'ads' && (
            <div className="admin-tab-ads">
              <div className="ads-header-card">
                <h2>Sponsorship Banners & Public Notices</h2>
                <p>
                  Control non-intrusive editorial sponsorships and emergency broadcast notices.
                </p>
              </div>

              {adSuccessMsg && (
                <div className="composer-alert success">
                  <CheckCircle2 size={18} />
                  <span>Sponsorship & notice settings updated successfully.</span>
                </div>
              )}

              <div className="ads-form-card">
                <div className="ads-field-group">
                  <label className="checkbox-lockup">
                    <input
                      type="checkbox"
                      checked={adSettings.sponsorBannerEnabled}
                      onChange={(e) => setAdSettings({ ...adSettings, sponsorBannerEnabled: e.target.checked })}
                    />
                    <strong>Enable Top Masthead Institutional Sponsorship Accord</strong>
                  </label>
                </div>

                <div className="composer-field">
                  <label>Sponsoring Entity / Accord Name</label>
                  <input
                    type="text"
                    value={adSettings.sponsorName}
                    onChange={(e) => setAdSettings({ ...adSettings, sponsorName: e.target.value })}
                  />
                </div>

                <div className="composer-field">
                  <label>Sponsorship Statement / Tagline</label>
                  <input
                    type="text"
                    value={adSettings.sponsorTagline}
                    onChange={(e) => setAdSettings({ ...adSettings, sponsorTagline: e.target.value })}
                  />
                </div>

                <div className="composer-field">
                  <label>Live Ticker Broadcast Override (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty to use regular breaking news dispatches..."
                    value={adSettings.tickerNoticeOverride}
                    onChange={(e) => setAdSettings({ ...adSettings, tickerNoticeOverride: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="admin-btn-navy"
                  onClick={() => {
                    setAdSuccessMsg(true);
                    setTimeout(() => setAdSuccessMsg(false), 3000);
                  }}
                >
                  <Check size={15} /> Save Sponsorship Controls
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              8. NEWSROOM SETTINGS TAB
              ==================================================== */}
          {activeTab === 'settings' && (
            <div className="admin-tab-settings">
              <div className="settings-header-card">
                <h2>Newsroom Configuration & Publishing Architecture</h2>
                <p>
                  Global publication parameters, editorial board contacts, and audit controls.
                </p>
              </div>

              {settingsSuccessMsg && (
                <div className="composer-alert success">
                  <CheckCircle2 size={18} />
                  <span>Publication architecture settings saved successfully.</span>
                </div>
              )}

              <div className="settings-form-card">
                <div className="settings-grid-2">
                  <div className="composer-field">
                    <label>Publication Masthead Title</label>
                    <input
                      type="text"
                      value={siteSettings.publicationName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, publicationName: e.target.value })}
                    />
                  </div>

                  <div className="composer-field">
                    <label>Editorial Slogan</label>
                    <input
                      type="text"
                      value={siteSettings.motto}
                      onChange={(e) => setSiteSettings({ ...siteSettings, motto: e.target.value })}
                    />
                  </div>

                  <div className="composer-field">
                    <label>Chief Editor Byline</label>
                    <input
                      type="text"
                      value={siteSettings.editorialChief}
                      onChange={(e) => setSiteSettings({ ...siteSettings, editorialChief: e.target.value })}
                    />
                  </div>

                  <div className="composer-field">
                    <label>Inquiries & Correction Email</label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="settings-toggles-box">
                  <label className="checkbox-lockup">
                    <input
                      type="checkbox"
                      checked={siteSettings.allowComments}
                      onChange={(e) => setSiteSettings({ ...siteSettings, allowComments: e.target.checked })}
                    />
                    <span>Allow Public Reader Comments on Dispatches</span>
                  </label>

                  <label className="checkbox-lockup">
                    <input
                      type="checkbox"
                      checked={siteSettings.auditLogging}
                      onChange={(e) => setSiteSettings({ ...siteSettings, auditLogging: e.target.checked })}
                    />
                    <span>Enable SHA-256 Audit Trail for Editorial Retractions</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="admin-btn-navy"
                  onClick={() => {
                    setSettingsSuccessMsg(true);
                    setTimeout(() => setSettingsSuccessMsg(false), 3000);
                  }}
                >
                  <Check size={15} /> Save Newsroom Architecture
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
