import React from 'react';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose, cartItems, onUpdateQty, onCheckout }) => {
  // Calculate total price
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);


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
        <div className="total-row">
          <span>Total:</span>
          <span>৳ {total}</span>
        </div>
<button className="checkout-btn" onClick={onCheckout}>
        Place Order
     </button>
      </div>
    </div>
  );
};

export default CartSidebar;
//hi