import React, { useMemo, useState } from 'react';
import './CartSidebar.css';

const API = 'http://localhost:3000';

const CartSidebar = ({ isOpen, onClose, cartItems, onUpdateQty, onCheckout }) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chaldal_coupon_data')) || null; } catch { return null; }
  });
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = subtotal > 0 ? 60 : 0;
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const taxableAmount = Math.max(subtotal - couponDiscount, 0);
  const vat = Math.round(taxableAmount * 0.03);
  const total = taxableAmount + deliveryCharge + vat;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) { setCouponError('Enter a coupon code.'); return; }

    const token = localStorage.getItem('token');
    if (!token) {
      setCouponError('Please log in to apply a coupon.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${API}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        localStorage.setItem('chaldal_coupon_data', JSON.stringify(data));
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon.');
      }
    } catch {
      setCouponError('Failed to validate coupon. Check connection.');
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    localStorage.removeItem('chaldal_coupon_data');
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h3>Shopping Bag ({cartItems.length})</h3>
        <button onClick={onClose} className="close-btn">✖</button>
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty-msg">Your bag is empty!</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>৳ {item.price} / {item.unit}</p>
              </div>
              <div className="qty-control">
                <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
              </div>
              <p className="item-total">৳ {item.price * item.qty}</p>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        {/* Coupon Row */}
        <div className="coupon-row">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
            placeholder="Coupon code (check Rewards tab)"
            disabled={!!appliedCoupon || couponLoading}
          />
          <button type="button" onClick={applyCoupon} disabled={!!appliedCoupon || couponLoading}>
            {couponLoading ? '...' : 'Apply'}
          </button>
        </div>
        {couponError && <p className="coupon-error">{couponError}</p>}
        {appliedCoupon && (
          <div className="coupon-applied-banner">
            <span>🎟 <strong>{appliedCoupon.code}</strong> — {appliedCoupon.message}</span>
            <button type="button" onClick={clearCoupon} className="remove-coupon-btn">✕ Remove</button>
          </div>
        )}

        <div className="bill-row"><span>Subtotal</span><span>৳ {subtotal}</span></div>
        <div className="bill-row"><span>Delivery</span><span>৳ {deliveryCharge}</span></div>
        <div className="bill-row"><span>VAT (3%)</span><span>৳ {vat}</span></div>
        {couponDiscount > 0 && (
          <div className="bill-row discount"><span>Coupon Discount</span><span>- ৳ {couponDiscount}</span></div>
        )}
        <div className="total-row">
          <span>Payable:</span>
          <span>৳ {total}</span>
        </div>
        <button
          className="checkout-btn"
          onClick={() =>
            onCheckout({
              couponCode: appliedCoupon?.code || '',
              discount: couponDiscount,
              deliveryCharge,
              tax: vat,
              subtotal,
              total,
            })
          }
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
