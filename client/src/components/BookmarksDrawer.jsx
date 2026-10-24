import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bookmark, Trash2 } from 'lucide-react';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  savedArticles,
  onRemoveBookmark
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (art) => {
    onClose();
    const identifier = art.slug || art.id || art._id;
    navigate(`/news/${identifier}`);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-box">
            <Bookmark size={18} className="icon-navy" />
            <h3 className="drawer-title">Saved Reading List</h3>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {savedArticles.length === 0 ? (
            <div className="drawer-empty-state">
              <Bookmark size={32} className="empty-icon" />
              <h4>No Saved Articles Yet</h4>
              <p>
                Click the bookmark icon on any dispatch or report to keep it in your reading queue.
              </p>
            </div>
          ) : (
            <div className="drawer-items">
              {savedArticles.map((art) => (
                <div key={art.id || art._id} className="drawer-item">
                  <div className="drawer-item-content" onClick={() => handleSelect(art)}>
                    <span className="drawer-item-cat">{art.category}</span>
                    <h5 className="drawer-item-title">{art.title}</h5>
                    <span className="drawer-item-meta">{art.author} • {art.readTime}</span>
                  </div>
                  <button
                    type="button"
                    className="drawer-remove-btn"
                    title="Remove from saved"
                    onClick={() => onRemoveBookmark(art.id || art._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <span>{savedArticles.length} item{savedArticles.length === 1 ? '' : 's'} stored</span>
          <button type="button" className="drawer-dismiss-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
