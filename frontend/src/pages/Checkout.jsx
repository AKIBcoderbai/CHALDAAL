import React, { useState, useEffect } from 'react'; // Import useEffect
import './Checkout.css';

// 1. Receive 'shippingAddress' prop
const Checkout = ({ cart, placeOrder, shippingAddress }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: shippingAddress || '', // 2. Set default value from prop
    paymentMethod: 'cod' 
  });

  // 3. Optional: specific effect to update address if the user changes it in the header while on this page
  useEffect(() => {
    if(shippingAddress) {
        setFormData(prev => ({ ...prev, address: shippingAddress }));
    }
  }, [shippingAddress]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = 60;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    placeOrder(formData); 
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>📍 Delivery Address</h3>
          
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="Ex: Sami" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" required placeholder="017..." onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Full Address</label>
            {/* The textarea now uses 'value={formData.address}' 
               so it displays the auto-filled location but remains editable.
            */}
            <textarea 
                name="address" 
                required 
                placeholder="House, Road, Area..." 
                value={formData.address}
                onChange={handleChange}
            ></textarea>
            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                * Pre-filled from your selected delivery location
            </small>
          </div>

          <h3>💳 Payment Method</h3>
           {/* ... (Payment options remain same) ... */}
           <div className="payment-options">
            <label className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="cod" checked onChange={handleChange} />
              <span>💵 Cash on Delivery</span>
            </label>
            <label className={`payment-card ${formData.paymentMethod === 'bkash' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="bkash" onChange={handleChange} />
              <span>🚀 bKash (Not available)</span>
            </label>
          </div>

          <button type="submit" className="confirm-btn">Confirm Order</button>
        </form>

        {/* ... (Order Summary remains same) ... */}
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
          <div className="summary-row"><span>Subtotal:</span> <span>৳ {total}</span></div>
          <div className="summary-row"><span>Delivery Fee:</span> <span>৳ {deliveryCharge}</span></div>
          <div className="summary-total">
            <span>Total:</span> <span>৳ {total + deliveryCharge}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;