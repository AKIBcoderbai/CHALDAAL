import React, { useState, useEffect } from 'react';
import './BannerCarousel.css';

const BannerCarousel = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/advertisements');
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (err) {
        console.error('Failed to load advertisements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleAdClick = (adId) => {
    window.open(`/ad/${adId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="banner-carousel-container">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="banner-item banner-skeleton" />
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return null; // no ads, don't show an empty row
  }

  return (
    <div className="banner-carousel-container">
      {ads.map((ad) => (
        <div
          key={ad.ad_id}
          className="banner-item"
          style={{ background: ad.gradient }}
          onClick={() => handleAdClick(ad.ad_id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick(ad.ad_id)}
          aria-label={`View advertisement: ${ad.title}`}
        >
          {/* Ad badge */}
          <div className="banner-ad-badge">Ad</div>

          {/* Product image */}
          <img
            src={ad.product_image}
            alt={ad.product_name}
            className="banner-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          {/* Text overlay */}
          <div className="banner-content">
            <div className="banner-title">{ad.title}</div>
            {ad.tagline && (
              <div className="banner-tagline">{ad.tagline}</div>
            )}
            <div className="banner-price">৳ {parseFloat(ad.price).toFixed(0)}</div>
            <div className="banner-shop-now">Shop Now →</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerCarousel;