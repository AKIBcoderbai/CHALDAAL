import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
//import './App.css'; // Make sure you have basic styles for this

function Footer({ user, handleLogout }) {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="footer-col brand-col">
          <h2 className="footer-logo">Chaldal<span>Clone</span></h2>
          <p>Your one-stop destination for daily essentials, fresh groceries, and electronics. Fast delivery, trusted service.</p>
          <div className="social-links">
            <a href="https://www.facebook.com/chaldalcom/" target="_blank" ><FaFacebook /></a>
            <a href="https://x.com/chaldal" target="_blank" ><FaTwitter /></a>
            <a href="https://www.instagram.com/chaldal_bd/" target="_blank" ><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/chaldalcom" target="_blank" ><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/offers">Special Offers</Link></li>
            <li><Link to="/">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/returns">Returns & Refunds</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Partner With Us</h3>
          <ul>
            {!user && <li><Link to="/seller-login">Become a Seller</Link></li>}
            <li><Link to="/signup">Delivery Rider Jobs</Link></li>
            <li><Link to="/affiliate">Affiliate Program</Link></li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Chaldal Clone Project. Developed by SAMI & MUNTASIR</p>
        <div className="payment-methods">
          {/* You can add tiny payment icons here */}
          <span>bKash</span> | <span>Nagad</span> | <span>Visa</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;