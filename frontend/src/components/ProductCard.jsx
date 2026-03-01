import React, { useEffect, useRef, useState } from 'react';
import { FaClock, FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';

// Now receiving 'cart' prop to check quantities
const ProductCard = ({ product, cart, onAddToCart, onUpdateQty, wishlisted, onToggleWishlist }) => {
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
  const rating = Number(product.rating || 4.6).toFixed(1);
  const etaLabel = product.eta || "25-35 min";
  const isLowStock = typeof product.stock === "number" && product.stock > 0 && product.stock < 10;
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const stockStatus = typeof product.stock === "number"
    ? product.stock <= 0
      ? "Out of stock"
      : isLowStock
        ? `Low stock: ${product.stock}`
        : "In stock"
    : "In stock";

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
        <button
          type="button"
          className={`wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={() => onToggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        <div className="image-container">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-info">
          <div className="product-meta-row">
            <span className="meta-rating"><FaStar /> {rating}</span>
            <span className="meta-eta"><FaClock /> {etaLabel}</span>
          </div>
          <h3>{product.name}</h3>
          <p className="unit">{product.unit}</p>
          <p className={`stock-pill ${isLowStock ? "low" : ""} ${stockStatus === "Out of stock" ? "out" : ""}`}>
            {stockStatus}
          </p>
          
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
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  onAddToCart(product);
                }}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Bag"}
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
          <p className="preview-meta">Rating: {rating} / 5</p>
          <p className="preview-meta">Delivery ETA: {etaLabel}</p>
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
