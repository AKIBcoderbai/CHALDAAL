import React from 'react';
import StaticPage from './StaticPage';

export default function ShippingPage() {
  return (
    <StaticPage title="Shipping Policy" breadcrumb="Shipping Policy">
      <p>Last updated: April 2026</p>

      <h2>Delivery Coverage</h2>
      <p>We currently deliver across major areas of Dhaka and Chittagong. Check your location at checkout to confirm availability.</p>

      <h2>Delivery Time</h2>
      <ul>
        <li>⚡ <strong>Express Delivery:</strong> 30–45 minutes (select areas)</li>
        <li>🕐 <strong>Scheduled Delivery:</strong> Choose a time slot at checkout</li>
        <li>📅 Same-day delivery available for orders placed before 8 PM</li>
      </ul>

      <h2>Delivery Charges</h2>
      <ul>
        <li>Standard delivery fee: <strong>৳60</strong> per order</li>
        <li>Free delivery on orders above <strong>৳1,000</strong> (promotional, varies)</li>
      </ul>

      <h2>Special Conditions</h2>
      <ul>
        <li>Delivery may be delayed during adverse weather or traffic conditions</li>
        <li>For remote areas, delivery charges may vary</li>
        <li>Fragile or perishable items are handled with priority care</li>
      </ul>

      <h2>Order Tracking</h2>
      <p>
        After placing your order, you can track its status in real-time from your <strong>Order History</strong> in the profile section. You'll see updates from "Pending" → "On the Way" → "Delivered".
      </p>

      <div className="highlight-box">
        📞 For urgent delivery issues, contact our support at <strong>09611-CHALDAL</strong> or live chat.
      </div>
    </StaticPage>
  );
}
