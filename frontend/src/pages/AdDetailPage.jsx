import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdDetailPage.css';

const StarRating = ({ rating }) => {
  const stars = [];
  const r = parseFloat(rating) || 0;
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(r)) stars.push('★');
    else if (i === Math.ceil(r) && r % 1 >= 0.5) stars.push('½');
    else stars.push('☆');
  }
  return (
    <span className="ad-stars" aria-label={`Rating: ${r.toFixed(1)} out of 5`}>
      {stars.map((s, i) => (
        <span key={i} className={s !== '☆' ? 'star filled' : 'star'}>{s === '½' ? '★' : s}</span>
      ))}
      <span className="ad-rating-num">{r.toFixed(1)}</span>
    </span>
  );
};

export default function AdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/advertisements/${id}`);
        if (!res.ok) {
          setError('Advertisement not found or has expired.');
          return;
        }
        const data = await res.json();
        setAd(data);
        // Set page title
        document.title = `${data.title} — Chaldaal Ad`;
      } catch (err) {
        setError('Failed to load advertisement. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  if (loading) {
    return (
      <div className="ad-page-wrapper">
        <div className="ad-loading-screen">
          <div className="ad-loading-spinner" />
          <p>Loading Advertisement...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="ad-page-wrapper">
        <div className="ad-error-screen">
          <div className="ad-error-icon">📭</div>
          <h2>Ad Not Available</h2>
          <p>{error || 'This advertisement is no longer available.'}</p>
          <button className="ad-btn-primary" onClick={() => window.close()}>Close Tab</button>
        </div>
      </div>
    );
  }

  const expiresDate = ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : null;

  const isExpired = ad.expires_at && new Date(ad.expires_at) < new Date();

  return (
    <div className="ad-page-wrapper" style={{ '--ad-gradient': ad.gradient }}>
      {/* Gradient Hero Background */}
      <div className="ad-hero-bg" style={{ background: ad.gradient }} />

      {/* Floating header bar */}
      <header className="ad-topbar">
        <div className="ad-topbar-logo">🛒 Chaldaal</div>
        <span className="ad-sponsored-label">Sponsored · Advertisement</span>
        <a href="/" className="ad-topbar-home" target="_self">Go to Store →</a>
      </header>

      <main className="ad-main-content">
        {/* Left: Product Image Panel */}
        <section className="ad-image-panel">
          <div className="ad-image-frame" style={{ background: ad.gradient }}>
            {!imgLoaded && <div className="ad-img-skeleton" />}
            <img
              src={ad.product_image}
              alt={ad.product_name}
              className={`ad-product-img ${imgLoaded ? 'visible' : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Product'; setImgLoaded(true); }}
            />
            {isExpired && (
              <div className="ad-expired-overlay">
                <span>This ad has expired</span>
              </div>
            )}
          </div>

          {/* Seller chip below image */}
          <div className="ad-seller-chip">
            <div className="ad-seller-avatar">
              {(ad.seller_name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <div className="ad-seller-chip-name">{ad.company_name || ad.seller_name}</div>
              <div className="ad-seller-chip-label">Verified Seller</div>
            </div>
          </div>
        </section>

        {/* Right: Ad Details Panel */}
        <section className="ad-details-panel">
          {/* Sponsored badge */}
          <div className="ad-badge-row">
            <span className="ad-badge ad-badge--sponsored">📢 Sponsored</span>
            {ad.category && <span className="ad-badge ad-badge--category">{ad.category}</span>}
            {isExpired && <span className="ad-badge ad-badge--expired">Expired</span>}
          </div>

          {/* Ad Title */}
          <h1 className="ad-main-title">{ad.title}</h1>

          {/* Tagline */}
          {ad.tagline && (
            <p className="ad-tagline">"{ad.tagline}"</p>
          )}

          {/* Product name and price */}
          <div className="ad-product-info-card">
            <div className="ad-product-name">{ad.product_name}</div>
            <div className="ad-product-meta">
              {ad.unit && <span className="ad-meta-tag">{ad.unit}</span>}
              {ad.stock > 0 ? (
                <span className="ad-meta-tag ad-meta-tag--instock">✓ In Stock ({ad.stock})</span>
              ) : (
                <span className="ad-meta-tag ad-meta-tag--outstock">✗ Out of Stock</span>
              )}
            </div>
            <div className="ad-price-row">
              <span className="ad-price-label">Price</span>
              <span className="ad-price-value">৳ {parseFloat(ad.price).toFixed(0)}</span>
            </div>

            {/* Star rating */}
            {parseFloat(ad.rating) > 0 && (
              <div className="ad-rating-row">
                <StarRating rating={ad.rating} />
              </div>
            )}
          </div>

          {/* Product Description */}
          {ad.product_description && (
            <div className="ad-description">
              <h3>About this Product</h3>
              <p>{ad.product_description}</p>
            </div>
          )}

          {/* Seller Info Card */}
          <div className="ad-seller-info-card">
            <h3>Seller Information</h3>
            <div className="ad-seller-rows">
              <div className="ad-seller-row">
                <span className="ad-si-label">🏢 Company</span>
                <span className="ad-si-value">{ad.company_name || ad.seller_name}</span>
              </div>
              <div className="ad-seller-row">
                <span className="ad-si-label">👤 Seller</span>
                <span className="ad-si-value">{ad.seller_name}</span>
              </div>
              {ad.seller_email && (
                <div className="ad-seller-row">
                  <span className="ad-si-label">✉️ Email</span>
                  <span className="ad-si-value">{ad.seller_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad validity */}
          {expiresDate && (
            <div className="ad-validity">
              <span>🗓 Ad valid until: <strong>{expiresDate}</strong></span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="ad-cta-group">
            <a
              href={`/product/${ad.product_id}`}
              className="ad-btn-primary"
              target="_self"
            >
              🛒 View Product & Buy
            </a>
            <button className="ad-btn-secondary" onClick={() => window.close()}>
              ✕ Close Ad
            </button>
          </div>

          {/* Disclaimer */}
          <p className="ad-disclaimer">
            This is a paid advertisement by {ad.company_name || ad.seller_name}. Chaldaal is not responsible for the accuracy of ad content.
          </p>
        </section>
      </main>
    </div>
  );
}
