import React from 'react';
import StaticPage from './StaticPage';

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" breadcrumb="Privacy Policy">
      <p>Last updated: April 2026. At ChaldalClone, your privacy is important to us.</p>

      <h2>Information We Collect</h2>
      <ul>
        <li><strong>Account Information:</strong> Name, email, phone number, and address when you register</li>
        <li><strong>Order Data:</strong> Your purchase history, delivery addresses, and payment methods</li>
        <li><strong>Device & Usage:</strong> Browser type, IP address, and pages visited (analytics only)</li>
      </ul>

      <h2>How We Use Your Data</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To send order confirmations and delivery updates</li>
        <li>To personalize your experience and recommendations</li>
        <li>To improve our platform and fix bugs</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        Your passwords are encrypted using <strong>bcrypt hashing</strong>. Payment information is never stored on our servers — it's processed through certified payment gateways.
      </p>

      <h2>Your Rights</h2>
      <ul>
        <li>Request a copy of your data at any time</li>
        <li>Request deletion of your account and associated data</li>
        <li>Opt out of marketing emails</li>
      </ul>

      <h2>Third Parties</h2>
      <p>We do not sell your data to third parties. We may share limited data with delivery partners and payment processors solely to fulfill your orders.</p>

      <div className="highlight-box">
        📧 For privacy-related requests, email us at <strong>privacy@chaldalclone.com</strong>
      </div>
    </StaticPage>
  );
}
