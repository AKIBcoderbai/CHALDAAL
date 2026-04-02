import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaMotorcycle, FaStar } from 'react-icons/fa';
import './OrderDetails.css';

export default function OrderDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [activeReviewProdId, setActiveReviewProdId] = useState(null);
  const [riderReviewVisible, setRiderReviewVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setOrder(await res.json());
      } else {
        alert("Order not found!");
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const submitProductReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/profile/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          product_id: activeReviewProdId,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        alert("Product review submitted!");
        setActiveReviewProdId(null);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  const submitRiderReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/rider/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          rider_id: order.rider_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        alert("Rider review submitted!");
        setRiderReviewVisible(false);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch (err) {
      alert("Failed to submit rider review");
    }
  };

  if (loading) return <div className="od-container">Loading...</div>;
  if (!order) return <div className="od-container">Not Found</div>;

  const odTime = new Date(order.order_time).toLocaleString();
  const arrivalTime = order.estimated_arrival ? new Date(order.estimated_arrival).toLocaleString() : "TBD";
  const pickupTime = order.pickup_time ? new Date(order.pickup_time).toLocaleString() : "Not picked up yet";
  
  const isDelivered = order.status.toLowerCase() === 'delivered';

  return (
    <div className="od-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Orders
      </button>

      <div className="od-header">
        <div className="od-header-left">
          <h1>Order #{order.order_id}</h1>
          <p className="order-date">Placed on {odTime}</p>
        </div>
        <div className={`od-status status-${order.status.toLowerCase()}`}>
          {order.status}
        </div>
      </div>

      <div className="od-grid">
        <div className="od-left-col">
          <div className="od-card">
            <h3><FaBox /> Order Items</h3>
            <div className="od-items-list">
              {order.items.map(item => (
                <div className="od-item-row" key={item.product_id}>
                  <img src={item.image} alt={item.name} className="od-item-img" />
                  <div className="od-item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.qty} &times; ৳ {item.price}</p>
                  </div>
                  {isDelivered && (
                    <button 
                      className="od-review-btn"
                      onClick={() => {
                        setActiveReviewProdId(item.product_id);
                        setRiderReviewVisible(false);
                      }}
                    >
                      Review Product
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="od-total">
               Total: ৳ {order.items.reduce((sum, i) => sum + (i.price * i.qty), 0)}
            </div>
          </div>
        </div>

        <div className="od-right-col">
          <div className="od-card">
            <h3>Delivery Info</h3>
            <div className="od-timeline">
              <div className="timeline-item">
                <strong>Ordered:</strong> {odTime}
              </div>
              <div className="timeline-item">
                <strong>Picked up:</strong> {pickupTime}
              </div>
              <div className="timeline-item">
                <strong>Arrival:</strong> {arrivalTime}
              </div>
            </div>
          </div>

          {order.rider_id && (
            <div className="od-card od-rider-card">
              <h3><FaMotorcycle /> Assigned Rider</h3>
              <div className="rider-info-box">
                <img 
                  src={order.rider_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt={order.rider_name} 
                  className="rider-avatar" 
                />
                <div className="rider-details">
                  <h4>{order.rider_name}</h4>
                  <p className="rider-rating"><FaStar color="#ffaa00"/> {Number(order.rider_rating||0).toFixed(1)} / 5.0</p>
                </div>
              </div>
              
              {isDelivered && (
                <button 
                  className="od-submit-btn" 
                  style={{marginTop: '15px'}}
                  onClick={() => {
                    setRiderReviewVisible(true);
                    setActiveReviewProdId(null);
                  }}
                >
                  Rate this Rider
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REVIEW MODAL OVERLAY */}
      {(activeReviewProdId !== null || riderReviewVisible) && (
        <div className="od-modal-backdrop">
          <div className="od-modal">
            <h3>
              {riderReviewVisible ? "Rate Your Delivery Rider" : "Review Product"}
            </h3>
            <form onSubmit={riderReviewVisible ? submitRiderReview : submitProductReview}>
              <div className="form-group">
                <label>Rating</label>
                <select 
                  value={reviewForm.rating} 
                  onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment / Feedback</label>
                <textarea 
                  rows="4" 
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  required
                  placeholder="Tell us about your experience..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="od-submit-btn">Submit Review</button>
                <button type="button" className="od-cancel-btn" onClick={() => {
                  setActiveReviewProdId(null);
                  setRiderReviewVisible(false);
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
