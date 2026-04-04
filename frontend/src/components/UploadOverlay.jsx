import React from 'react';
import './UploadOverlay.css';

export default function UploadOverlay({ isUploading }) {
  if (!isUploading) return null;

  return (
    <div className="uo-backdrop">
      <div className="uo-card">
        <div className="uo-icon-ring">
          <div className="uo-orbit"></div>
          <div className="uo-orbit uo-orbit-2"></div>
          <svg className="uo-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <p className="uo-title">Uploading Photo</p>
        <p className="uo-sub">Please wait, this may take a moment...</p>
        <div className="uo-progress">
          <div className="uo-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
