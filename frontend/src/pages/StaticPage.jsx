import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StaticPage.css';

export default function StaticPage({ title, children, breadcrumb }) {
  const navigate = useNavigate();
  return (
    <div className="static-page-wrapper">
      <div className="static-page-container">
        <button className="static-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <nav className="static-breadcrumb">
          <Link to="/">Home</Link>
          {breadcrumb && <><span> / </span><span>{breadcrumb}</span></>}
        </nav>
        <h1 className="static-page-title">{title}</h1>
        <div className="static-page-body">{children}</div>
      </div>
    </div>
  );
}
