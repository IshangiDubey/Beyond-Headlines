import React, { useEffect } from 'react';
import { X, Bookmark, Share2, Clock, Calendar, ArrowLeft } from 'lucide-react';

export default function ArticleModal({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectRelated
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!article) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard.');
    }
  };

  return (
    <div className="article-modal-backdrop" onClick={onClose}>
      <div className="article-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Sticky Bar in Reader */}
        <div className="reader-top-bar">
          <button type="button" className="reader-back-btn" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Back to Edition</span>
          </button>

          <div className="reader-actions">
            <button
              type="button"
              className="reader-action-btn"
              onClick={handleShare}
              title="Copy Link"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              className={`reader-action-btn ${isBookmarked ? 'active' : ''}`}
              onClick={() => onToggleBookmark(article.id || article._id)}
              title={isBookmarked ? 'Saved to reading list' : 'Save article'}
            >
              <Bookmark size={16} fill={isBookmarked ? '#0f2b5c' : 'none'} />
            </button>
            <button
              type="button"
              className="reader-close-btn"
              onClick={onClose}
              title="Close reader"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Article Body Content */}
        <article className="reader-article">
          <div className="reader-header">
            <span className="reader-category-pill">{article.category}</span>
            <h1 className="reader-title">{article.title}</h1>
            <p className="reader-summary">{article.summary}</p>

            <div className="reader-byline">
              <div className="byline-details">
                <span className="byline-author">{article.author}</span>
                <span className="byline-role">{article.authorRole || 'Editorial Staff'}</span>
              </div>
              <div className="byline-meta">
                <span>
                  <Calendar size={13} className="inline-icon" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="meta-dot">•</span>
                <span>
                  <Clock size={13} className="inline-icon" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>

          <div className="reader-figure">
            <img src={article.imageUrl} alt={article.title} className="reader-image" />
            <figcaption className="reader-caption">
              Beyond Headlines Photo Archive. Documentary coverage on national affairs.
            </figcaption>
          </div>

          <div className="reader-prose">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={idx === 0 ? 'lead-paragraph' : ''}>
                  {paragraph}
                </p>
              ))
            ) : (
              <p>{article.summary}</p>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="reader-tags">
              <span className="tags-label">FILED UNDER:</span>
              <div className="tags-list">
                {article.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
