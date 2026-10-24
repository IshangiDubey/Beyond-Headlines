import React from 'react';
import { Link } from 'react-router-dom';

export default function BreakingTicker({ breakingArticles }) {
  if (!breakingArticles || breakingArticles.length === 0) return null;

  // Render a repeatable loop of headlines separated by dots
  const renderCrawlGroup = (keyPrefix) => (
    <div className="screenshot-ticker-group">
      {breakingArticles.map((art, idx) => {
        const identifier = art.slug || art.id || art._id;
        return (
          <Link
            to={`/news/${identifier}`}
            key={`${keyPrefix}-${art.id || art._id}-${idx}`}
            className="screenshot-ticker-item"
            title={`Read: ${art.title}`}
          >
            <span className="screenshot-headline-text">{art.title}</span>
            <span className="screenshot-ticker-dot">•</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="screenshot-ticker-card" aria-label="Breaking News">
      {/* Left Solid Badge */}
      <div className="screenshot-breaking-badge">
        <span>BREAKING</span>
      </div>

      {/* Continuous Marquee Crawl */}
      <div className="screenshot-marquee-track-container">
        <div className="screenshot-marquee-track">
          {renderCrawlGroup('g1')}
          {renderCrawlGroup('g2')}
        </div>
      </div>
    </div>
  );
}
