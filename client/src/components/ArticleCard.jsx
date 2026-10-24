import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Clock, ArrowUpRight, Share2, MessageSquare } from 'lucide-react';

export default function ArticleCard({
  article,
  variant = 'standard',
  index,
  isBookmarked,
  onToggleBookmark,
  onOpenShare
}) {
  const navigate = useNavigate();

  if (!article) return null;

  const identifier = article.slug || article.id || article._id;
  const articleUrl = `/news/${identifier}`;
  const commentCount = typeof article.commentsCount === 'number'
    ? article.commentsCount
    : (Array.isArray(article.comments) ? article.comments.length : 3);

  const handleCardClick = (e) => {
    // If the click is on an interactive button or already a link, let the child handle it
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(articleUrl);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.target.closest('button') && !e.target.closest('a')) {
      navigate(articleUrl);
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`${articleUrl}#comments`);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (variant === 'hero') {
    return (
      <article
        className="article-hero"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <Link to={articleUrl} className="hero-image-wrapper" tabIndex={-1}>
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="hero-image"
          />
          <span className="hero-category-badge">{article.category}</span>
        </Link>

        <div className="hero-content">
          <div className="article-meta-row">
            <span className="meta-author">By {article.author}</span>
            <span className="meta-dot">•</span>
            <span className="meta-date">{formatDate(article.publishedAt)}</span>
            <span className="meta-dot">•</span>
            <span className="meta-read-time">
              <Clock size={12} className="inline-icon" />
              {article.readTime}
            </span>
          </div>

          <h2 className="hero-title">
            <Link to={articleUrl} className="article-title-link">
              {article.title}
            </Link>
          </h2>

          <p className="hero-summary">{article.summary}</p>

          <div className="hero-actions">
            <Link to={articleUrl} className="read-more-link">
              Continue Reading <ArrowUpRight size={15} />
            </Link>

            <div className="card-btn-cluster">
              <button
                type="button"
                className="hero-comment-action-btn"
                title={`Join the discussion (${commentCount} comments)`}
                onClick={handleCommentClick}
              >
                <MessageSquare size={15} />
                <span>{commentCount}</span>
              </button>

              <button
                type="button"
                className="hero-share-action-btn"
                title="Share this story (WhatsApp, Facebook, Twitter, Instagram)"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenShare && onOpenShare(article);
                }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>

              <button
                type="button"
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                title={isBookmarked ? 'Remove bookmark' : 'Save article'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleBookmark(article.id || article._id);
                }}
              >
                <Bookmark size={16} fill={isBookmarked ? '#0f2b5c' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        className="article-compact"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {typeof index === 'number' && (
          <span className="compact-number">0{index + 1}</span>
        )}
        <div className="compact-body">
          <div className="compact-category">{article.category}</div>
          <h4 className="compact-title">
            <Link to={articleUrl} className="article-title-link">
              {article.title}
            </Link>
          </h4>
          <div className="compact-meta">
            <span>{article.author}</span>
            <span className="meta-dot">•</span>
            <span>{article.readTime}</span>
            <button
              type="button"
              className="compact-comment-btn"
              title={`Discussions (${commentCount})`}
              onClick={handleCommentClick}
            >
              <MessageSquare size={13} />
              <span>{commentCount}</span>
            </button>
            <button
              type="button"
              className="compact-share-btn"
              title="Share story"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare && onOpenShare(article);
              }}
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Standard Editorial Card
  return (
    <article
      className="article-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <Link to={articleUrl} className="card-image-box" tabIndex={-1}>
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          className="card-image"
        />
        <span className="card-category-badge">{article.category}</span>
      </Link>

      <div className="card-content">
        <div className="card-meta">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="meta-dot">•</span>
          <span>{article.readTime}</span>
        </div>

        <h3 className="card-title">
          <Link to={articleUrl} className="article-title-link">
            {article.title}
          </Link>
        </h3>

        <p className="card-summary">{article.summary}</p>

        <div className="card-footer">
          <Link to={articleUrl} className="read-more-link card-read-more">
            Read More <ArrowUpRight size={14} />
          </Link>

          <div className="card-btn-cluster">
            <button
              type="button"
              className="card-comment-action-btn"
              title={`Join the discussion (${commentCount} comments)`}
              onClick={handleCommentClick}
            >
              <MessageSquare size={14} />
              <span>{commentCount}</span>
            </button>

            <button
              type="button"
              className="card-share-action-btn"
              title="Share story (WhatsApp, Facebook, Twitter, Instagram)"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare && onOpenShare(article);
              }}
            >
              <Share2 size={15} />
            </button>

            <button
              type="button"
              className={`card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              title={isBookmarked ? 'Remove from saved' : 'Save article'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBookmark(article.id || article._id);
              }}
            >
              <Bookmark size={15} fill={isBookmarked ? '#0f2b5c' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
