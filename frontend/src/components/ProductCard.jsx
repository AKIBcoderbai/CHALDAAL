import React from 'react';

// Now receiving 'cart' prop to check quantities
const ProductCard = ({ product, cart, onAddToCart, onUpdateQty }) => {
  
  // Check if item is already in cart
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.qty : 0;

  // Calculate Discount %
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="discount-badge">{discount}% OFF</div>
      )}

      <div className="image-container">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="unit">{product.unit}</p>
        
        <div className="price-row">
          <span className="price">৳ {product.price}</span>
          {discount > 0 && (
             <span className="old-price">৳ {product.originalPrice}</span>
          )}
        </div>

        {/* Smart Button Logic */}
        <div className="action-area">
          {quantity === 0 ? (
            <button 
              className="add-btn"
              onClick={() => {onAddToCart(product);
                 console.log(product.id);}
              }
            >
              Add to Bag
            </button>
          ) : (
            <div className="qty-counter">
              <button onClick={() =>{ onUpdateQty(product.id, -1)
              }}>−</button>
              <span>{quantity}</span>
              <button onClick={() => onUpdateQty(product.id, 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;