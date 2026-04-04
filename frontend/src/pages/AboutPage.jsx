import React from 'react';
import StaticPage from './StaticPage';

export default function AboutPage() {
  return (
    <StaticPage title="About ChaldalClone" breadcrumb="About Us">
      <p>
        <strong>ChaldalClone</strong> is an academic project built as part of CSE216 (Database Management Systems) to demonstrate a real-world e-commerce grocery delivery platform. The project replicates the core features of the original Chaldal.com, serving as a practical exercise in full-stack development.
      </p>

      <h2>Our Mission</h2>
      <p>
        To make grocery shopping fast, easy, and accessible. We believe that your time is valuable, and that essential goods should be delivered to your doorstep efficiently and reliably.
      </p>

      <h2>What We Offer</h2>
      <ul>
        <li>🛒 Thousands of products across categories — Grocery, Pharmacy, Electronics, Beverages, and more</li>
        <li>⚡ Fast 30-45 minute delivery in metropolitan areas</li>
        <li>💰 Competitive pricing and loyalty-based discount coupons</li>
        <li>🔒 Secure payments via bKash, Nagad, and Card</li>
        <li>📦 Transparent order tracking from placement to delivery</li>
      </ul>

      <h2>Built With</h2>
      <ul>
        <li> <strong>React</strong> (Frontend)</li>
        <li> <strong>Node.js + Express</strong> (Backend)</li>
        <li> <strong>PostgreSQL on Supabase</strong> (Database)</li>
        <li> <strong>Cloudinary</strong> (Image Storage)</li>
      </ul>

      <h2>The Team</h2>
      <div className="highlight-box">
        <strong>
          <li>Made By :</li> 
         <p>Shamsul Haque Sami & Muntasir Bin Rafique</p> 
         <li>Supervisor :</li> 
          Kowshic Roy Sir
          <p>CSE, BUET</p>
          </strong><br />
      </div>
    </StaticPage>
  );
}
