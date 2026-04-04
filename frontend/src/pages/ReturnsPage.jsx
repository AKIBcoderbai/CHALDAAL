import React from 'react';
import StaticPage from './StaticPage';
import { useNavigate } from 'react-router-dom';

export default function ReturnsPage() {
  const navigate = useNavigate();
  return (
    <StaticPage title="Returns & Refunds" breadcrumb="Returns & Refunds">
      <p>We want you to be fully satisfied with every order. If something's not right, here's how to make it right.</p>

      <h2>Return Eligibility</h2>
      <ul>
        <li>Items must be returned within <strong>24 hours</strong> of delivery</li>
        <li>Products must be <strong>unused and in original condition</strong></li>
        <li>Fresh produce, dairy, and perishable items can be returned to the delivery rider immediately upon receipt</li>
      </ul>

      <h2>How to Return</h2>
      <ul>
        <li>Go to your <strong>Order History</strong> in your profile</li>
        <li>Click the order and use the <strong>Request Return</strong> button on the order details page</li>
        <li>Select items and reason, then submit — our team reviews within 24 hours</li>
      </ul>

      <div className="highlight-box">
        ⚡ <strong>Tip:</strong> If the item is wrong or damaged, you can always hand it back to the delivery rider at the door for an immediate return.
      </div>

      <h2>Refund Process</h2>
      <ul>
        <li>Approved refunds are processed within <strong>3–5 business days</strong></li>
        <li>Refunds go back to the original payment method (bKash, Nagad, Card, or wallet credit)</li>
        <li>Cash on Delivery refunds are issued as <strong>wallet credit</strong> or via mobile banking</li>
      </ul>

      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Medicines and prescription drugs</li>
        <li>Personal hygiene products (once opened)</li>
        <li>Customized or made-to-order items</li>
      </ul>

      <button
        style={{ marginTop: '20px', background: '#ffd645', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
      >
        Go to My Orders →
      </button>
    </StaticPage>
  );
}
