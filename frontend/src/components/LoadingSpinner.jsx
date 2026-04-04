import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="ls-overlay">
      <div className="ls-card">
        <div className="ls-spinner-ring">
          <div className="ls-ring-segment"></div>
          <div className="ls-ring-segment"></div>
          <div className="ls-ring-segment"></div>
          <div className="ls-center-dot"></div>
        </div>
        <p className="ls-message">{message}</p>
        <div className="ls-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}
