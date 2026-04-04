import React from 'react';
import StaticPage from './StaticPage';

export default function AffiliatePage() {
  return (
    <StaticPage title="Affiliate Program" breadcrumb="Affiliate Program">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="coming-soon-badge">🚀 Coming Soon</span>
      </div>

      <p>
        We're building an exciting affiliate program that rewards you for sharing ChaldalClone with your friends, family, and followers. Be the first to know when we launch!
      </p>

      <h2>How It Will Work</h2>
      <ul>
        <li>🔗 Get a unique referral link after signing up</li>
        <li>📨 Share it with anyone who might love our grocery delivery</li>
        <li>💰 Earn commission (%) for every purchase your referrals make</li>
        <li>🏦 Withdraw earnings directly to bKash or Nagad</li>
      </ul>

      <h2>Who Can Join?</h2>
      <ul>
        <li>Content creators & food bloggers</li>
        <li>Students & community groups</li>
        <li>Any registered ChaldalClone user!</li>
      </ul>

      <div className="highlight-box">
        📧 Interested in early access? Email us at <strong>affiliate@chaldalclone.com</strong> and we'll notify you at launch!
      </div>
    </StaticPage>
  );
}
