import React from 'react';
import StaticPage from './StaticPage';
import { useNavigate } from 'react-router-dom';

export default function OffersPage({ user }) {
  const navigate = useNavigate();
  const isCustomer = user?.role === 'user';

  return (
    <StaticPage title="Special Offers & Coupons" breadcrumb="Offers">
      <p>
        Earn loyalty points on every order and unlock exclusive discount coupons — automatically assigned to your account!
      </p>

      <h2>Loyalty Tiers</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '20px 0' }}>
        {[
          { icon: '🥉', tier: 'Bronze', points: 0, coupon: 'BRONZE10', discount: '10% off (up to ৳50)', min: '৳200' },
          { icon: '🥈', tier: 'Silver', points: 200, coupon: 'SILVER15', discount: '15% off (up to ৳100)', min: '৳400' },
          { icon: '🥇', tier: 'Gold', points: 500, coupon: 'GOLD20', discount: '20% off (up to ৳200)', min: '৳600' },
          { icon: '💎', tier: 'Platinum', points: 1000, coupon: 'PLAT30', discount: '30% off (up to ৳400)', min: '৳800' },
        ].map(t => (
          <div key={t.tier} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fafafa', textAlign: 'center' }}>
            <div style={{ fontSize: '36px' }}>{t.icon}</div>
            <h3 style={{ margin: '8px 0 4px', color: '#1a1a2e' }}>{t.tier}</h3>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>from {t.points} points</p>
            <code style={{ fontWeight: '800', fontSize: '14px', background: '#f0fff4', border: '1px dashed #68d391', padding: '4px 10px', borderRadius: '6px', color: '#276749' }}>{t.coupon}</code>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>{t.discount}<br />Min order {t.min}</p>
          </div>
        ))}
      </div>

      <div className="highlight-box">
        💡 You earn <strong>1 point for every ৳100 spent</strong>. Points accumulate automatically and unlock coupons instantly!
      </div>

      {/* Customer-only CTA — admins/sellers/riders see a notice instead */}
      {isCustomer ? (
        <button
          style={{ marginTop: '20px', background: '#ffd645', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        >
          View My Rewards →
        </button>
      ) : user ? (
        <div style={{ marginTop: '24px', padding: '16px 20px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '10px', color: '#856404', fontWeight: '600' }}>
          🚫 Special offers and loyalty rewards are only available for <strong>customer accounts</strong>. Admin, seller, and rider accounts do not earn loyalty points.
        </div>
      ) : (
        <button
          style={{ marginTop: '20px', background: '#ffd645', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        >
          Login to Access Your Coupons →
        </button>
      )}
    </StaticPage>
  );
}
