import React from 'react';
import ArticleCard from '../components/ArticleCard';

export default function HomePage({
  articles,
  trendingArticles,
  loading,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  savedArticleIds,
  onToggleBookmark,
  onOpenShare
}) {
  const heroArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <main className="container main-content-container">
      {/* Active Search / Category Indicator */}
      {searchQuery ? (
        <div className="search-results-banner">
          <div>
            Showing search dispatches matching: <strong>"{searchQuery}"</strong> ({articles.length} found)
          </div>
          <button
            type="button"
            className="clear-search-action"
            onClick={onClearSearch}
          >
            Clear Filter
          </button>
        </div>
      ) : activeCategory !== 'All' ? (
        <div className="category-heading-bar">
          <h2 className="category-main-title">{activeCategory} Desk</h2>
          <span className="category-articles-count">
            {articles.length} Reports & Investigations
          </span>
        </div>
      ) : null}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--accent)' }}>
            Retrieving Latest Dispatches...
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            No Dispatches Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            We could not find any stories matching your current criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              onClearSearch();
            }}
            style={{
              marginTop: '1rem',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '2px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Return to Front Page
          </button>
        </div>
      ) : (
        <div className="editorial-grid">
          {/* Left 2 Columns: Hero Lead + Secondary Grid */}
          <div className="main-editorial-col">
            {heroArticle && (
              <ArticleCard
                article={heroArticle}
                variant="hero"
                isBookmarked={savedArticleIds.includes(heroArticle.id || heroArticle._id)}
                onToggleBookmark={onToggleBookmark}
                onOpenShare={onOpenShare}
              />
            )}

            {secondaryArticles.length > 0 && (
              <div className="articles-subgrid">
                {secondaryArticles.map((art) => (
                  <ArticleCard
                    key={art.id || art._id}
                    article={art}
                    variant="standard"
                    isBookmarked={savedArticleIds.includes(art.id || art._id)}
                    onToggleBookmark={onToggleBookmark}
                    onOpenShare={onOpenShare}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Trending / Most Read + Editorial Quote */}
          <aside className="sidebar-section">
            <div className="sidebar-block">
              <h3 className="sidebar-title">MOST READ STORIES</h3>
              <div className="compact-list">
                {trendingArticles.slice(0, 5).map((art, idx) => (
                  <ArticleCard
                    key={art.id || art._id}
                    article={art}
                    variant="compact"
                    index={idx}
                    isBookmarked={savedArticleIds.includes(art.id || art._id)}
                    onToggleBookmark={onToggleBookmark}
                    onOpenShare={onOpenShare}
                  />
                ))}
              </div>
            </div>

            {/* Publisher Statement / Editorial Note */}
            <div className="editorial-quote-box">
              <span className="quote-label">EDITORIAL PRINCIPLE</span>
              <p className="quote-text">
                "Public accountability is not an occasional virtue; it is the constant pulse of an open democracy."
              </p>
              <span className="quote-byline">— Board of Editors, Beyond Headlines</span>
            </div>

            <div className="sidebar-block">
              <h3 className="sidebar-title">SPECIAL DISPATCHES</h3>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  <strong>Agriculture & Rural Food Security:</strong> In-depth investigative reportage on irrigation telemetry, grain markets, and sustainable farming policies.
                </p>
                <p>
                  <strong>Education & STEM Advancement:</strong> Tracking national curriculum standards, open-access university research benchmarks, and vocational literacy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
