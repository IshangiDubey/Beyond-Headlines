import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  Check, 
  Eye, 
  ArrowUpRight,
  MessageSquare,
  Send,
  ThumbsUp,
  CornerDownRight
} from 'lucide-react';

export default function ArticleDetailPage({
  apiBaseUrl,
  allArticles = [],
  savedArticleIds,
  onToggleBookmark,
  onOpenShare,
  currentUser,
  onOpenAuth
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentTextareaRef = useRef(null);
  const commentsSectionRef = useRef(null);

  // Find if already present in allArticles
  const findCachedArticle = () => {
    if (!allArticles || allArticles.length === 0) return null;
    return allArticles.find((a) => a.slug === slug || a.id === slug || a._id === slug) || null;
  };

  const initialCached = findCachedArticle();
  const [article, setArticle] = useState(initialCached);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(!initialCached);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Comments State
  const [comments, setComments] = useState(() => {
    if (initialCached && Array.isArray(initialCached.comments)) {
      return initialCached.comments;
    }
    return [];
  });
  const [newCommentText, setNewCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState([]);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Scroll to comments helper
  const scrollToComments = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        if (commentTextareaRef.current) {
          commentTextareaRef.current.focus();
        }
      }, 400);
    }
  };

  // Check URL hash for #comments
  useEffect(() => {
    if (location.hash === '#comments' && !loading && article) {
      setTimeout(() => {
        scrollToComments();
      }, 250);
    }
  }, [location.hash, loading, article]);

  // Fetch article data whenever slug parameter changes
  useEffect(() => {
    let isMounted = true;
    if (location.hash !== '#comments') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Instantly sync from memory if available
    const cached = allArticles?.find((a) => a.slug === slug || a.id === slug || a._id === slug);
    if (cached) {
      setArticle(cached);
      setComments(cached.comments || []);
      setLoading(false);
      document.title = `${cached.title} — BEYOND HEADLINES`;
    } else if (!article) {
      setLoading(true);
    }
    setError(null);

    const fetchArticleDetails = async () => {
      try {
        let res = null;
        try {
          res = await fetch(`/api/articles/${slug}`);
        } catch {
          res = null;
        }

        if (!res || !res.ok) {
          res = await fetch(`${apiBaseUrl}/api/articles/${slug}`);
        }

        if (!res.ok) {
          throw new Error('Article could not be found.');
        }
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.article) {
            setArticle(data.article);
            setRelatedArticles(data.related || []);
            if (Array.isArray(data.article.comments)) {
              setComments(data.article.comments);
            }
            document.title = `${data.article.title} — BEYOND HEADLINES`;
          } else {
            throw new Error('Invalid article response.');
          }
        }
      } catch (err) {
        if (isMounted && !cached && !article) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticleDetails();

    return () => {
      isMounted = false;
      document.title = 'BEYOND HEADLINES | Journal of In-Depth Record';
    };
  }, [slug, apiBaseUrl, allArticles]);

  const isBookmarked = article ? savedArticleIds.includes(article.id || article._id) : false;

  const handleShare = (targetArticle = article) => {
    if (onOpenShare && targetArticle) {
      onOpenShare(targetArticle);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const authorName = currentUser?.name || guestName.trim() || 'Reader';
    const authorRole = currentUser ? 'Verified Subscriber' : 'Community Reader';
    const authorAvatar = currentUser?.avatar || '';

    const tempComment = {
      id: `cmt-${Date.now()}`,
      author: authorName,
      authorRole,
      avatar: authorAvatar,
      text: newCommentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString()
    };

    setIsSubmittingComment(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName,
          authorRole,
          avatar: authorAvatar,
          text: newCommentText.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [data.comment, ...prev]);
        } else {
          setComments((prev) => [tempComment, ...prev]);
        }
      } else {
        // Fallback local update
        setComments((prev) => [tempComment, ...prev]);
      }
    } catch {
      // Local fallback in case network has issues
      setComments((prev) => [tempComment, ...prev]);
    } finally {
      setIsSubmittingComment(false);
      setNewCommentText('');
      setCommentSuccessMsg(true);
      setTimeout(() => setCommentSuccessMsg(false), 3500);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (likedCommentIds.includes(commentId)) return;
    setLikedCommentIds((prev) => [...prev, commentId]);

    // Optimistically update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );

    try {
      await fetch(`${apiBaseUrl}/api/articles/${slug}/comments/${commentId}/like`, {
        method: 'POST'
      });
    } catch {
      // Optimistic already in place
    }
  };

  const handlePostReply = (parentComment) => {
    if (!replyText.trim()) return;
    const authorName = currentUser?.name || 'Reader';
    const newReply = {
      id: `reply-${Date.now()}`,
      author: authorName,
      authorRole: currentUser ? 'Verified Subscriber' : 'Community Reader',
      avatar: currentUser?.avatar || '',
      text: `@${parentComment.author} ${replyText.trim()}`,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [newReply, ...prev]);
    setReplyingToId(null);
    setReplyText('');
  };

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

  const formatCommentTime = (timeStr) => {
    try {
      const now = new Date();
      const past = new Date(timeStr);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--accent)' }}>
          Retrieving Full Dispatch...
        </p>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Loading investigative report from archives...
        </span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Dispatch Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {error || 'The requested story could not be retrieved or has been relocated.'}
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            padding: '0.6rem 1.25rem',
            borderRadius: '2px',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="article-detail-page-wrapper">
      {/* Top Breadcrumb Nav Bar */}
      <div className="detail-breadcrumb-bar">
        <div className="container breadcrumb-inner">
          <Link to="/" className="breadcrumb-link">
            Front Page
          </Link>
          <ChevronRight size={13} className="breadcrumb-arrow" />
          <Link to="/" className="breadcrumb-link">
            {article.category} Desk
          </Link>
          <ChevronRight size={13} className="breadcrumb-arrow" />
          <span className="breadcrumb-current">{article.title}</span>
        </div>
      </div>

      <div className="container detail-main-container">
        {/* Back Link to Front Page */}
        <div className="detail-back-row">
          <Link to="/" className="detail-back-btn">
            <ArrowLeft size={15} /> Back to Front Page
          </Link>
        </div>

        {/* Article Full Paper Layout */}
        <article className="detail-paper-surface">
          {/* Header Metadata & Title */}
          <header className="detail-article-header">
            <div className="detail-kicker-row">
              <span className="detail-kicker-badge">{article.category}</span>
              {article.breaking && <span className="detail-breaking-badge">DEVELOPING</span>}
            </div>

            <h1 className="detail-title">{article.title}</h1>

            <p className="detail-deck">{article.summary}</p>

            <div className="detail-byline-bar">
              <div className="detail-author-box">
                <div className="author-avatar-badge">
                  <User size={16} />
                </div>
                <div>
                  <span className="detail-author-name">{article.author}</span>
                  <span className="detail-author-role">{article.authorRole || 'Editorial Staff Correspondent'}</span>
                </div>
              </div>

              <div className="detail-meta-actions">
                <div className="detail-meta-group">
                  <span className="meta-item">
                    <Calendar size={14} className="meta-icon" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="meta-dot">•</span>
                  <span className="meta-item">
                    <Clock size={14} className="meta-icon" />
                    {article.readTime}
                  </span>
                  {typeof article.views === 'number' && (
                    <>
                      <span className="meta-dot">•</span>
                      <span className="meta-item">
                        <Eye size={14} className="meta-icon" />
                        {article.views} reads
                      </span>
                    </>
                  )}
                </div>

                <div className="detail-buttons-group">
                  <button
                    type="button"
                    className="detail-action-btn"
                    onClick={scrollToComments}
                    title="Jump to reader discussion and comments"
                  >
                    <MessageSquare size={16} />
                    <span>Comments ({comments.length})</span>
                  </button>

                  <button
                    type="button"
                    className={`detail-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => onToggleBookmark(article.id || article._id)}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                  >
                    <Bookmark size={16} fill={isBookmarked ? '#0f2b5c' : 'none'} />
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    className="detail-action-btn"
                    onClick={() => handleShare(article)}
                    title="Share story (WhatsApp, Facebook, Twitter, Instagram, Copy Link)"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Editorial Photo */}
          <div className="detail-featured-media">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="detail-featured-image"
            />
            <figcaption className="detail-caption">
              Documentary reportage for BEYOND HEADLINES. Investigative archives & telemetry records.
            </figcaption>
          </div>

          {/* Full Report Typography & Text */}
          <div className="detail-prose-body">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={idx === 0 ? 'detail-lead-dropcap' : ''}>
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="detail-lead-dropcap">{article.summary}</p>
            )}
          </div>

          {/* Filed Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="detail-tags-section">
              <span className="detail-tags-label">FILED UNDER:</span>
              <div className="detail-tags-chips">
                {article.tags.map((tag) => (
                  <span key={tag} className="detail-tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation Return */}
          <div className="detail-bottom-nav-bar">
            <Link to="/" className="detail-return-home-btn">
              <ArrowLeft size={16} /> Return to Edition Front Page
            </Link>
            <button
              type="button"
              className="detail-jump-comment-btn"
              onClick={scrollToComments}
            >
              <MessageSquare size={15} /> Join Reader Discussion ({comments.length})
            </button>
          </div>

          {/* ============================================================ */}
          {/* COMPLETE READER DISCUSSION & COMMENT SECTION */}
          {/* ============================================================ */}
          <section id="comments" ref={commentsSectionRef} className="comments-section-container">
            <div className="comments-section-header">
              <div className="comments-title-lockup">
                <div className="comments-header-icon-badge">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="comments-section-title">
                    Reader Discussion & Perspectives
                  </h3>
                  <span className="comments-count-pill">{comments.length} Comments</span>
                </div>
              </div>
              <span className="comments-standards-note">
                Moderated for civil, evidence-grounded discourse
              </span>
            </div>

            {/* Comment Submission Form */}
            <form className="comment-compose-card" onSubmit={handlePostComment}>
              <div className="comment-compose-user-bar">
                <div className="compose-avatar-box">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="compose-avatar-img" />
                  ) : (
                    <div className="compose-avatar-placeholder">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                  )}
                </div>
                <div className="compose-user-info">
                  {currentUser ? (
                    <div className="compose-user-logged">
                      <span className="compose-user-name">{currentUser.name}</span>
                      <span className="compose-user-badge">Verified Member</span>
                    </div>
                  ) : (
                    <div className="compose-guest-prompt">
                      <span>Commenting as Guest</span>
                      {onOpenAuth && (
                        <button
                          type="button"
                          className="compose-signin-link"
                          onClick={() => onOpenAuth('login')}
                        >
                          Sign in for subscriber badge
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!currentUser && (
                <div className="compose-guest-fields">
                  <input
                    type="text"
                    className="compose-name-input"
                    placeholder="Your name or affiliation (e.g., Alex Reed, Urban Planner)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
              )}

              <div className="compose-textarea-wrapper">
                <textarea
                  ref={commentTextareaRef}
                  className="comment-textarea"
                  rows={3}
                  placeholder="Contribute constructive analysis, field context, or question on this dispatch..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  maxLength={1200}
                />
              </div>

              <div className="compose-bottom-bar">
                <span className="compose-char-counter">
                  {newCommentText.length} / 1200 characters
                </span>
                <button
                  type="submit"
                  className="compose-submit-btn"
                  disabled={!newCommentText.trim() || isSubmittingComment}
                >
                  <Send size={14} />
                  <span>{isSubmittingComment ? 'Submitting...' : 'Post Comment'}</span>
                </button>
              </div>

              {commentSuccessMsg && (
                <div className="comment-success-alert">
                  <Check size={14} />
                  <span>Your comment has been published to the reader discussion.</span>
                </div>
              )}
            </form>

            {/* List of Reader Comments */}
            <div className="comments-stream-list">
              {comments.length === 0 ? (
                <div className="comments-empty-state">
                  <MessageSquare size={36} className="empty-chat-icon" />
                  <h4>Be the first to contribute to this story</h4>
                  <p>
                    Share your perspective, on-the-ground observations, or queries regarding this dispatch.
                  </p>
                </div>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="comment-item-card">
                    <div className="comment-item-avatar">
                      {cmt.avatar ? (
                        <img src={cmt.avatar} alt={cmt.author} className="comment-author-photo" />
                      ) : (
                        <div className="comment-author-initial">
                          {cmt.author ? cmt.author.charAt(0).toUpperCase() : 'R'}
                        </div>
                      )}
                    </div>

                    <div className="comment-item-body">
                      <div className="comment-item-header">
                        <div className="comment-author-lockup">
                          <strong className="comment-author-name">{cmt.author}</strong>
                          <span className="comment-author-role">
                            {cmt.authorRole || 'Verified Reader'}
                          </span>
                        </div>
                        <span className="comment-timestamp">
                          {formatCommentTime(cmt.createdAt)}
                        </span>
                      </div>

                      <p className="comment-text-content">{cmt.text}</p>

                      <div className="comment-item-actions">
                        <button
                          type="button"
                          className={`comment-like-action ${likedCommentIds.includes(cmt.id) ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(cmt.id)}
                          title="Agree or appreciate this comment"
                        >
                          <ThumbsUp size={13} />
                          <span>{cmt.likes || 0}</span>
                        </button>

                        <button
                          type="button"
                          className="comment-reply-action"
                          onClick={() => setReplyingToId(replyingToId === cmt.id ? null : cmt.id)}
                        >
                          <CornerDownRight size={13} />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Inline Reply Form */}
                      {replyingToId === cmt.id && (
                        <div className="comment-reply-box">
                          <input
                            type="text"
                            className="comment-reply-input"
                            placeholder={`Reply to @${cmt.author}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handlePostReply(cmt);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="comment-reply-send-btn"
                            onClick={() => handlePostReply(cmt)}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>

        {/* Related Category Stories Section */}
        {relatedArticles.length > 0 && (
          <section className="detail-related-section">
            <h3 className="detail-related-title">MORE FROM THE {article.category.toUpperCase()} DESK</h3>
            <div className="detail-related-grid">
              {relatedArticles.map((rel) => (
                <article
                  key={rel.id || rel._id}
                  className="related-story-card"
                  onClick={() => navigate(`/news/${rel.slug || rel.id || rel._id}`)}
                >
                  <div className="related-image-box">
                    <img src={rel.imageUrl} alt={rel.title} className="related-card-image" />
                    <span className="related-badge">{rel.category}</span>
                  </div>
                  <div className="related-card-body">
                    <span className="related-read-time">{rel.readTime}</span>
                    <h4 className="related-card-title">{rel.title}</h4>
                    <div className="related-card-footer">
                      <span className="related-card-author">By {rel.author}</span>
                      <div className="related-actions-group">
                        <button
                          type="button"
                          className="related-comment-btn"
                          title="View comments"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/news/${rel.slug || rel.id || rel._id}#comments`);
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>{rel.commentsCount || 3}</span>
                        </button>

                        <button
                          type="button"
                          className="related-share-btn"
                          title="Share story"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(rel);
                          }}
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
