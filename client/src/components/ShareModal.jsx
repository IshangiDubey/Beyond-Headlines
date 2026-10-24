import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';

export default function ShareModal({
  isOpen,
  onClose,
  article
}) {
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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

  if (!isOpen || !article) return null;

  const identifier = article.slug || article.id || article._id;
  const shareUrl = `${window.location.origin}/news/${identifier}`;
  const shareTitle = article.title || 'Breaking Dispatch from Beyond Headlines';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setStatusMessage('Story link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setStatusMessage('');
      }, 3000);
    } catch {
      setStatusMessage('Failed to copy. Please copy the URL manually.');
    }
  };

  const handleWhatsApp = () => {
    const text = `${shareTitle}\n\nRead full report on Beyond Headlines:\n${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=640,height=580,noopener,noreferrer');
  };

  const handleTwitter = () => {
    const text = `${shareTitle} | Beyond Headlines`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=520,noopener,noreferrer');
  };

  const handleInstagram = async () => {
    // Copy the link first so the user can easily paste in IG Direct or Story
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setStatusMessage('Link copied! Opening Instagram to share...');
      setTimeout(() => {
        setCopied(false);
        setStatusMessage('');
      }, 4000);
    } catch {
      setStatusMessage('Opening Instagram...');
    }
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="share-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-heading"
    >
      <div className="share-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title-box">
            <div className="share-icon-circle">
              <Share2 size={18} />
            </div>
            <div>
              <h3 id="share-modal-heading" className="share-modal-title">
                Share this Dispatch
              </h3>
              <span className="share-modal-subtitle">Beyond Headlines Editorial Wire</span>
            </div>
          </div>
          <button
            type="button"
            className="share-modal-close-btn"
            onClick={onClose}
            aria-label="Close share options"
          >
            <X size={18} />
          </button>
        </div>

        {/* Article Summary Snippet */}
        <div className="share-article-preview">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              className="share-preview-thumb"
              loading="lazy"
            />
          )}
          <div className="share-preview-content">
            <span className="share-preview-cat">{article.category}</span>
            <h4 className="share-preview-title">{article.title}</h4>
            <span className="share-preview-author">By {article.author}</span>
          </div>
        </div>

        {/* Channel Grid */}
        <div className="share-channels-grid">
          {/* WhatsApp */}
          <button
            type="button"
            className="share-channel-btn share-whatsapp"
            onClick={handleWhatsApp}
            title="Share on WhatsApp"
          >
            <div className="channel-icon-wrap whatsapp-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="channel-label">WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            className="share-channel-btn share-facebook"
            onClick={handleFacebook}
            title="Share on Facebook"
          >
            <div className="channel-icon-wrap facebook-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="channel-label">Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            className="share-channel-btn share-twitter"
            onClick={handleTwitter}
            title="Share on Twitter / X"
          >
            <div className="channel-icon-wrap twitter-bg">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="channel-label">Twitter (X)</span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            className="share-channel-btn share-instagram"
            onClick={handleInstagram}
            title="Share on Instagram"
          >
            <div className="channel-icon-wrap instagram-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="channel-label">Instagram</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            className="share-channel-btn share-copylink"
            onClick={handleCopyLink}
            title="Copy Direct Link"
          >
            <div className={`channel-icon-wrap copylink-bg ${copied ? 'copied-state' : ''}`}>
              {copied ? <Check size={20} color="#ffffff" /> : <Copy size={20} color="#ffffff" />}
            </div>
            <span className="channel-label">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Link Input Row */}
        <div className="share-url-row">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="share-url-input"
            onClick={(e) => e.target.select()}
            aria-label="Article Web Link"
          />
          <button
            type="button"
            className={`share-copy-button ${copied ? 'copied-btn' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Link
              </>
            )}
          </button>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div className="share-status-toast">
            <Check size={14} className="toast-icon" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
