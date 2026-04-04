import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProductDetails.css';

const ProductDetails = ({ cart, onAddToCart, onUpdateQty, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const imageRef = useRef(null);

  const cartItem = cart.find((item) => item.id === parseInt(id));
  const quantity = cartItem ? cartItem.qty : 0;

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        alert("Product not found");
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPos({ ...zoomPos, show: false });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        alert("Review submitted!");
        setNewReview({ rating: 5, comment: '' });
        fetchReviews(); // refresh
        fetchProductDetails(); // refresh average rating
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Connection failed");
    }
  };

  if (loading) return <LoadingSpinner message="Loading Product..." />;
  if (!product) return <LoadingSpinner message="Product not found..." />;

  const isLowStock = product.stock > 0 && product.stock < 10;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="pd-top-section">
        {/* Left Side: Image with Zoom */}
        <div className="pd-image-section">
          <div 
            className="pd-image-wrapper"
            ref={imageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setZoomPos({ ...zoomPos, show: true })}
          >
            <img src={product.image} alt={product.name} className="pd-main-image" />
            {zoomPos.show && (
              <div 
                className="pd-zoom-lens"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Right Side: Product Info & Cart Action */}
        <div className="pd-info-section">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-rating">
            <span className="stars"><FaStar /> {Number(product.rating || 0).toFixed(1)}</span>
            <span className="review-count">({reviews.length} reviews)</span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">৳ {product.price}</span>
            <span className="pd-unit">/ {product.unit}</span>
          </div>

          <p className="pd-description">{product.description || "No description available for this item."}</p>

          <div className="pd-stock">
            {isOutOfStock ? (
              <span className="stock-out">Out of Stock</span>
            ) : isLowStock ? (
              <span className="stock-low">Only {product.stock} left in stock!</span>
            ) : (
              <span className="stock-in">In Stock</span>
            )}
            {product.seller_name && <span className="seller-name">Sold by: {product.seller_name}</span>}
          </div>

          <div className="pd-cart-action">
            {quantity === 0 ? (
              <button 
                className="pd-add-btn" 
                disabled={isOutOfStock}
                onClick={() => !isOutOfStock && onAddToCart(product)}
              >
                Add to Cart
              </button>
            ) : (
              <div className="pd-qty-control">
                <button onClick={() => onUpdateQty(product.id, -1)}>−</button>
                <span>{quantity}</span>
                <button onClick={() => onUpdateQty(product.id, 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Reviews */}
      <div className="pd-bottom-section">
        <div className="pd-reviews-container">
          <h2>Customer Reviews</h2>
          
          {user ? (
            <form className="pd-review-form" onSubmit={submitReview}>
              <h3>Write a Review</h3>
              <div className="form-group">
                <label>Rating:</label>
                <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}>
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment:</label>
                <textarea 
                  required
                  placeholder="What did you like or dislike?" 
                  rows="3"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="pd-submit-review">Submit Review</button>
            </form>
          ) : (
            <div className="login-prompt">
              Please <button onClick={() => navigate('/login')}>Login</button> to write a review.
            </div>
          )}

          <div className="pd-review-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(r => (
                <div key={r.review_id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img src={r.user_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={r.user_name} />
                      <span className="reviewer-name">{r.user_name}</span>
                    </div>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} color={i < r.rating ? "#ffaa00" : "#e0e0e0"} />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
