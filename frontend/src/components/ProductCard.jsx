import React, { useEffect, useRef, useState } from 'react';

// Now receiving 'cart' prop to check quantities
const ProductCard = ({ product, cart, onAddToCart, onUpdateQty }) => {
  const hoverTimerRef = useRef(null);
  const touchTimerRef = useRef(null);
  const shellRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState("right");
  const [isTouched, setIsTouched] = useState(false);

  // Check if item is already in cart
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.qty : 0;

  // Calculate Discount %
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    hoverTimerRef.current = setTimeout(() => {
      if (!shellRef.current) return;
      const rect = shellRef.current.getBoundingClientRect();
      const previewWidth = 320;
      const gap = 14;
      const shouldOpenLeft = window.innerWidth - rect.right < previewWidth + gap;
      setPreviewSide(shouldOpenLeft ? "left" : "right");
      setShowPreview(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowPreview(false);
  };

  const handleTouchFeedback = () => {
    setIsTouched(true);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => setIsTouched(false), 220);
  };

  return (
    <div
      ref={shellRef}
      className="product-card-shell"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`product-card ${isTouched ? "soft-touch" : ""}`}
        onMouseDown={handleTouchFeedback}
      >
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
                onClick={() => {
                  onAddToCart(product);
                }}
              >
                Add to Bag
              </button>
            ) : (
              <div className="qty-counter">
                <button onClick={() =>{ onUpdateQty(product.id, -1); }}>−</button>
                <span>{quantity}</span>
                <button onClick={() => onUpdateQty(product.id, 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`product-preview ${showPreview ? "visible" : ""} ${previewSide}`}>
        <div className="preview-image-wrap">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="preview-content">
          <h4>{product.name}</h4>
          <p className="preview-unit">{product.unit}</p>
          <p className="preview-price">৳ {product.price}</p>
          {discount > 0 && (
            <p className="preview-discount">{discount}% OFF from ৳ {product.originalPrice}</p>
          )}
          {product.category && <p className="preview-meta">Category: {product.category}</p>}
          {typeof product.stock === "number" && (
            <p className="preview-meta">In stock: {product.stock}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
