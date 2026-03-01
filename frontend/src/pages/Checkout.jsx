import React, { useMemo, useState, useEffect } from 'react';
import './Checkout.css';

const Checkout = ({ cart, placeOrder, shippingAddress, checkoutMeta }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: shippingAddress || '',
    label:'Home',
    paymentMethod: localStorage.getItem("chaldal_payment_method") || 'cod'
  });
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const raw = localStorage.getItem("chaldal_saved_addresses");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    if(shippingAddress) {
        setFormData(prev => ({ ...prev, address: shippingAddress }));
    }
  }, [shippingAddress]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = checkoutMeta?.discount || 0;
  const deliveryCharge = checkoutMeta?.deliveryCharge ?? (subtotal > 0 ? 60 : 0);
  const tax = checkoutMeta?.tax ?? Math.round(Math.max(subtotal - discount, 0) * 0.03);
  const total = Math.max(subtotal - discount, 0) + deliveryCharge + tax;

  const validateField = (name, value) => {
    if (name === "name" && value.trim().length < 2) {
      return "Name should be at least 2 characters.";
    }
    if (name === "phone" && !/^01\d{9}$/.test(value.trim())) {
      return "Enter a valid 11-digit Bangladeshi number (01XXXXXXXXX).";
    }
    if (name === "address" && value.trim().length < 8) {
      return "Address looks too short.";
    }
    return "";
  };

  const completion = useMemo(() => {
    const infoDone =
      !validateField("name", formData.name) &&
      !validateField("phone", formData.phone) &&
      !validateField("address", formData.address);
    const paymentDone = !!formData.paymentMethod;
    const reviewDone = cart.length > 0;
    const value = [infoDone, paymentDone, reviewDone].filter(Boolean).length;
    return Math.round((value / 3) * 100);
  }, [formData, cart.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validateField("name", formData.name),
      phone: validateField("phone", formData.phone),
      address: validateField("address", formData.address),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (cart.length === 0) return;

    const saveAddress = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      label: formData.label,
    };
    const merged = [
      saveAddress,
      ...savedAddresses.filter((a) => a.address !== saveAddress.address),
    ].slice(0, 5);
    localStorage.setItem("chaldal_saved_addresses", JSON.stringify(merged));
    localStorage.setItem("chaldal_payment_method", formData.paymentMethod);
    setSavedAddresses(merged);

    placeOrder({
      ...formData,
      billing: {
        subtotal,
        discount,
        deliveryCharge,
        tax,
        total,
        couponCode: checkoutMeta?.couponCode || "",
      },
    }); 
  };

  return (
    <div className="checkout-container">
      <div className="checkout-topbar">
        <h2>Checkout</h2>
        <div className="progress-block">
          <div className="progress-line">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          <p>{completion}% completed</p>
        </div>
      </div>
      
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery Details</h3>
          {savedAddresses.length > 0 && (
            <div className="saved-addresses">
              {savedAddresses.map((saved, idx) => (
                <button
                  type="button"
                  key={`${saved.address}-${idx}`}
                  onClick={() => setFormData((prev) => ({ ...prev, ...saved }))}
                >
                  <strong>{saved.label}</strong> - {saved.address}
                </button>
              ))}
            </div>
          )}
          
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="Ex: Sami" value={formData.name} onChange={handleChange} />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" required placeholder="017..." value={formData.phone} onChange={handleChange} />
            {errors.phone && <small className="field-error">{errors.phone}</small>}
          </div>

          <div className="form-group">
            <label>Full Address</label>
            <textarea 
                name="address" 
                required 
                placeholder="House, Road, Area..." 
                value={formData.address}
                onChange={handleChange}
            ></textarea>
            {errors.address && <small className="field-error">{errors.address}</small>}
            <small className="field-note">Pre-filled from your selected delivery location.</small>
          </div>
            
          <div className="form-group">
            <label>Save Address As</label>
            <select name="label" value={formData.label} onChange={handleChange}>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Friend">Friend's House</option>
                <option value="Other">Other</option>
            </select>
          </div>

          
          <h3>Payment Method</h3>
           <div className="payment-options">
            <label className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
              <span>Cash on Delivery</span>
            </label>
            <label className={`payment-card ${formData.paymentMethod === 'bkash' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleChange} />
              <span>bKash</span>
            </label>
            <label className={`payment-card ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} />
              <span>Card</span>
            </label>
          </div>

          <button type="submit" className="confirm-btn" disabled={cart.length === 0}>Confirm Order</button>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.qty} x {item.name}</span>
                <span>৳ {item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="summary-row"><span>Subtotal:</span> <span>৳ {subtotal}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Discount:</span> <span>- ৳ {discount}</span></div>}
          <div className="summary-row"><span>Delivery Fee:</span> <span>৳ {deliveryCharge}</span></div>
          <div className="summary-row"><span>VAT (3%):</span> <span>৳ {tax}</span></div>
          {checkoutMeta?.couponCode && (
            <div className="summary-row"><span>Coupon:</span> <span>{checkoutMeta.couponCode}</span></div>
          )}
          <div className="summary-total">
            <span>Total:</span> <span>৳ {total}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
