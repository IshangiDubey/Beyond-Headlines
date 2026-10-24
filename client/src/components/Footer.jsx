import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';

const TOPICS = [
  'Politics',
  'Agriculture',
  'Education',
  'Economy',
  'Technology',
  'Health',
  'World',
  'Environment'
];

export default function Footer({ onSelectCategory }) {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="site-footer border-single-top">
      <div className="container footer-content">
        <div className="footer-top-row">
          <div className="footer-brand">
            <h3 className="footer-logo">BEYOND HEADLINES</h3>
            <p className="footer-tagline">
              Dedicated to objective, verified, and uncompromising reportage across domestic policy, agriculture, education, markets, scientific research, and civic healthcare.
            </p>
            <div className="footer-standards">
              <span>MEMBER OF THE INDEPENDENT PRESS STANDARDS ACCORD</span>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4 className="footer-heading">The Morning Briefing</h4>
            <p className="newsletter-desc">
              Receive the editors' curated analysis of crucial policy shifts and market developments every weekday at 6:00 AM.
            </p>
            {subscribed ? (
              <div className="newsletter-success">
                <Check size={16} className="icon-navy" />
                <span>You are subscribed to the Morning Briefing.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit-btn">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer-topics-section border-single-top border-single-bottom">
          <span className="footer-topics-label">DESKS & COVERAGE:</span>
          <div className="footer-topics-grid">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                className="footer-topic-link"
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onSelectCategory(topic);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-meta-links">
            <a href="#about">About the Journal</a>
            <span className="dot">•</span>
            <a href="#ethics">Editorial Code & Fact-Checking</a>
            <span className="dot">•</span>
            <a href="#corrections">Corrections Policy</a>
            <span className="dot">•</span>
            <a href="#archives">Archival Records (1884–2026)</a>
            <span className="dot">•</span>
            <a href="#privacy">Privacy & Terms</a>
            <span className="dot">•</span>
            <Link to="/admin/login" className="footer-admin-link">Staff & Editorial Console</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Beyond Headlines Publishing Group. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
