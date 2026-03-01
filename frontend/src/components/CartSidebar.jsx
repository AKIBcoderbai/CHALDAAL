import React, { useMemo, useState } from 'react';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose, cartItems, onUpdateQty, onCheckout }) => {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(() => localStorage.getItem("chaldal_coupon") || "");
  const [couponError, setCouponError] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = subtotal > 0 ? 60 : 0;
  const couponDiscount = useMemo(() => {
    if (appliedCoupon === "SAVE10") return Math.min(Math.round(subtotal * 0.1), 150);
    if (appliedCoupon === "FREESHIP") return deliveryCharge;
    return 0;
  }, [appliedCoupon, subtotal, deliveryCharge]);
  const taxableAmount = Math.max(subtotal - couponDiscount, 0);
  const vat = Math.round(taxableAmount * 0.03);
  const total = taxableAmount + deliveryCharge + vat;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    if (code !== "SAVE10" && code !== "FREESHIP") {
      setCouponError("Invalid code. Try SAVE10 or FREESHIP.");
      return;
    }
    setAppliedCoupon(code);
    localStorage.setItem("chaldal_coupon", code);
    setCouponError("");
  };

  const clearCoupon = () => {
    setAppliedCoupon("");
    localStorage.removeItem("chaldal_coupon");
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
        <div className="coupon-row">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Coupon code"
          />
          <button type="button" onClick={applyCoupon}>Apply</button>
        </div>
        {couponError && <p className="coupon-error">{couponError}</p>}
        {appliedCoupon && (
          <p className="coupon-applied">
            {appliedCoupon} applied
            <button type="button" onClick={clearCoupon}>Remove</button>
          </p>
        )}

        <div className="bill-row"><span>Subtotal</span><span>৳ {subtotal}</span></div>
        <div className="bill-row"><span>Delivery</span><span>৳ {deliveryCharge}</span></div>
        <div className="bill-row"><span>VAT (3%)</span><span>৳ {vat}</span></div>
        {couponDiscount > 0 && (
          <div className="bill-row discount"><span>Discount</span><span>- ৳ {couponDiscount}</span></div>
        )}
        <div className="total-row">
          <span>Payable:</span>
          <span>৳ {total}</span>
        </div>
        <button
          className="checkout-btn"
          onClick={() =>
            onCheckout({
              couponCode: appliedCoupon,
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
