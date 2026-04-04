import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

const ROLE_LABELS = {
  user: 'Customer',
  seller: 'Seller',
  rider: 'Rider',
  admin: 'Administrator',
};

const ROLE_DESTINATIONS = {
  seller: { label: 'Seller Dashboard', path: '/seller-dashboard' },
  rider:  { label: 'Rider Dashboard',  path: '/rider-dashboard' },
  admin:  { label: 'Admin Panel',       path: '/admin' },
  user:   { label: 'Home',              path: '/' },
};

export default function RequireRole({ user, allowedRoles, children }) {
  const navigate = useNavigate();

  // Not logged in
  if (!user) {
    return (
      <div className="ad-page">
        <div className="ad-card">
          <div className="ad-icon">🔒</div>
          <h1 className="ad-title">Login Required</h1>
          <p className="ad-desc">
            You need to be logged in to access this page.
          </p>
          <div className="ad-actions">
            <button className="ad-btn-primary" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="ad-btn-secondary" onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but wrong role
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!allowed.includes(user.role)) {
    const dest = ROLE_DESTINATIONS[user.role] || { label: 'Home', path: '/' };
    return (
      <div className="ad-page">
        <div className="ad-card">
          <div className="ad-icon">🚫</div>
          <h1 className="ad-title">Access Denied</h1>
          <p className="ad-desc">
            This page is not available for <strong>{ROLE_LABELS[user.role] || user.role}</strong> accounts.
          </p>
          <p className="ad-hint">
            Only {allowed.map(r => ROLE_LABELS[r] || r).join(' / ')} accounts can access this page.
          </p>
          <div className="ad-actions">
            <button className="ad-btn-primary" onClick={() => navigate(dest.path)}>
              Go to {dest.label}
            </button>
            <button className="ad-btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
