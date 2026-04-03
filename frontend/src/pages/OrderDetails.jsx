import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaMotorcycle, FaStar, FaUndo } from 'react-icons/fa';
import './OrderDetails.css';

const RETURN_REASONS = [
  { value: 'damaged',          label: 'Item arrived damaged' },
  { value: 'wrong_item',       label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described / Different from listing' },
  { value: 'changed_mind',     label: 'Changed my mind' },
  { value: 'other',            label: 'Other' },
];

const RETURN_CONDITIONS = [
  { value: 'unopened',      label: 'Unopened / Still sealed' },
  { value: 'opened_unused', label: 'Opened but unused' },
  { value: 'used_once',     label: 'Used once' },
  { value: 'defective',     label: 'Defective / Not working' },
];

const RETURN_STEPS = ['Select Items', 'Details', 'Photos', 'Review'];

export default function OrderDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [activeReviewProdId, setActiveReviewProdId] = useState(null);
  const [riderReviewVisible, setRiderReviewVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // Return states
  const [existingReturn, setExistingReturn] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnStep, setReturnStep] = useState(0);
  const [returnSelectedItems, setReturnSelectedItems] = useState({});
  const [returnForm, setReturnForm] = useState({ reason: '', description: '', condition: '' });
  const [returnImages, setReturnImages] = useState([]); // base64 previews only (no cloud upload)
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate('/login'); return; }
    try {
      const [orderRes, returnRes] = await Promise.all([
        fetch(`http://localhost:3000/api/orders/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`http://localhost:3000/api/returns/order/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
      ]);
      if (orderRes.ok) setOrder(await orderRes.json());
      else { alert("Order not found!"); navigate(-1); }
      if (returnRes.ok) setExistingReturn(await returnRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrderDetails(); }, [id]);

  const submitProductReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/profile/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ product_id: activeReviewProdId, rating: reviewForm.rating, comment: reviewForm.comment })
      });
      if (res.ok) { alert("Product review submitted!"); setActiveReviewProdId(null); setReviewForm({ rating: 5, comment: "" }); await fetchOrderDetails(); }
    } catch { alert("Failed to submit review"); }
  };

  const submitRiderReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/rider/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rider_id: order.rider_id, rating: reviewForm.rating, comment: reviewForm.comment })
      });
      if (res.ok) { alert("Rider review submitted!"); setRiderReviewVisible(false); setReviewForm({ rating: 5, comment: "" }); await fetchOrderDetails(); }
    } catch { alert("Failed to submit rider review"); }
  };

  // ---- Return helpers ----
  const toggleReturnItem = (product_id) => {
    setReturnSelectedItems(prev => {
      const next = { ...prev };
      if (next[product_id]) delete next[product_id];
      else next[product_id] = 1;
      return next;
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - returnImages.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setReturnImages(prev => [...prev, ev.target.result].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const submitReturn = async () => {
    const token = localStorage.getItem("token");
    const items = Object.entries(returnSelectedItems).map(([product_id, quantity]) => ({ product_id: parseInt(product_id), quantity }));
    setReturnSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          order_id: parseInt(id),
          reason: returnForm.reason,
          description: returnForm.description,
          condition: returnForm.condition,
          items,
          images: returnImages,
        })
      });
      if (res.ok) {
        alert('Return request submitted! We will review it and notify you.');
        setReturnModalOpen(false);
        setReturnStep(0);
        setReturnSelectedItems({});
        setReturnForm({ reason: '', description: '', condition: '' });
        setReturnImages([]);
        await fetchOrderDetails();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit return.');
      }
    } catch { alert('Network error.'); }
    finally { setReturnSubmitting(false); }
  };

  const canProceed = () => {
    if (returnStep === 0) return Object.keys(returnSelectedItems).length > 0;
    if (returnStep === 1) return returnForm.reason && returnForm.condition;
    return true;
  };

  if (loading) return <div className="od-container">Loading...</div>;
  if (!order) return <div className="od-container">Not Found</div>;

  const odTime = new Date(order.order_time).toLocaleString();
  const arrivalTime = order.estimated_arrival ? new Date(order.estimated_arrival).toLocaleString() : "TBD";
  const pickupTime = order.pickup_time ? new Date(order.pickup_time).toLocaleString() : "Not picked up yet";
  const isDelivered = order.status.toLowerCase() === 'delivered';

  const returnStatusMap = {
    pending:  { label: 'Return Requested — Pending Review', color: '#b8860b', bg: '#fff8e1', border: '#ffd645' },
    approved: { label: 'Return Approved', color: '#27ae60', bg: '#f0faf3', border: '#c8ebd5' },
    rejected: { label: 'Return Rejected', color: '#e74c3c', bg: '#fff0f0', border: '#fcc' },
  };

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

      {/* Return status banner */}
      {existingReturn && (
        <div className="od-return-banner" style={{
          background: returnStatusMap[existingReturn.status]?.bg || '#f5f5f5',
          border: `1px solid ${returnStatusMap[existingReturn.status]?.border || '#ddd'}`,
          color: returnStatusMap[existingReturn.status]?.color || '#555',
        }}>
          <FaUndo />
          <div>
            <strong>{returnStatusMap[existingReturn.status]?.label || `Return: ${existingReturn.status}`}</strong>
            {existingReturn.admin_note && <p className="od-return-note">{existingReturn.admin_note}</p>}
          </div>
        </div>
      )}

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
                      onClick={() => { setActiveReviewProdId(item.product_id); setRiderReviewVisible(false); }}
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

            {/* Return CTA */}
            {isDelivered && !existingReturn && (
              <button className="od-return-btn" onClick={() => { setReturnModalOpen(true); setReturnStep(0); }}>
                <FaUndo /> Request Return
              </button>
            )}
          </div>
        </div>

        <div className="od-right-col">
          <div className="od-card">
            <h3>Delivery Info</h3>
            <div className="od-timeline">
              <div className="timeline-item"><strong>Ordered:</strong> {odTime}</div>
              <div className="timeline-item"><strong>Picked up:</strong> {pickupTime}</div>
              <div className="timeline-item"><strong>Arrival:</strong> {arrivalTime}</div>
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
                <button className="od-submit-btn" style={{marginTop: '15px'}} onClick={() => { setRiderReviewVisible(true); setActiveReviewProdId(null); }}>
                  Rate this Rider
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {(activeReviewProdId !== null || riderReviewVisible) && (
        <div className="od-modal-backdrop">
          <div className="od-modal">
            <h3>{riderReviewVisible ? "Rate Your Delivery Rider" : "Review Product"}</h3>
            <form onSubmit={riderReviewVisible ? submitRiderReview : submitProductReview}>
              <div className="form-group">
                <label>Rating</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}>
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment / Feedback</label>
                <textarea rows="4" value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} required placeholder="Tell us about your experience..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="od-submit-btn">Submit Review</button>
                <button type="button" className="od-cancel-btn" onClick={() => { setActiveReviewProdId(null); setRiderReviewVisible(false); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN REQUEST MODAL */}
      {returnModalOpen && (
        <div className="od-modal-backdrop">
          <div className="od-modal od-return-modal">
            {/* Step indicator */}
            <div className="ret-step-header">
              <div className="ret-step-title">Request Return</div>
              <div className="ret-steps">
                {RETURN_STEPS.map((step, idx) => (
                  <div key={idx} className={`ret-step ${idx === returnStep ? 'active' : ''} ${idx < returnStep ? 'done' : ''}`}>
                    <div className="ret-step-dot">{idx < returnStep ? '✓' : idx + 1}</div>
                    <div className="ret-step-label">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 0: Select items */}
            {returnStep === 0 && (
              <div className="ret-form-section">
                <p className="ret-form-hint">Select the item(s) you want to return:</p>
                <div className="ret-item-select-list">
                  {order.items.map(item => (
                    <div
                      key={item.product_id}
                      className={`ret-select-item ${returnSelectedItems[item.product_id] ? 'selected' : ''}`}
                      onClick={() => toggleReturnItem(item.product_id)}
                    >
                      <img src={item.image} alt={item.name} />
                      <div>
                        <div className="ret-si-name">{item.name}</div>
                        <div className="ret-si-qty">Qty: {item.qty} · ৳{item.price}</div>
                      </div>
                      <div className={`ret-checkbox ${returnSelectedItems[item.product_id] ? 'checked' : ''}`}>
                        {returnSelectedItems[item.product_id] ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Return details */}
            {returnStep === 1 && (
              <div className="ret-form-section">
                <div className="form-group">
                  <label>Reason for Return *</label>
                  <select value={returnForm.reason} onChange={e => setReturnForm({...returnForm, reason: e.target.value})} required>
                    <option value="">Select a reason</option>
                    {RETURN_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition of Item *</label>
                  <select value={returnForm.condition} onChange={e => setReturnForm({...returnForm, condition: e.target.value})} required>
                    <option value="">Select condition</option>
                    {RETURN_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Additional Details (optional)</label>
                  <textarea
                    rows={3}
                    value={returnForm.description}
                    onChange={e => setReturnForm({...returnForm, description: e.target.value})}
                    placeholder="Describe the issue in more detail..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Photos */}
            {returnStep === 2 && (
              <div className="ret-form-section">
                <p className="ret-form-hint">Add up to 3 photos as evidence (optional).</p>
                <div className="ret-photo-upload">
                  {returnImages.map((src, idx) => (
                    <div key={idx} className="ret-photo-preview">
                      <img src={src} alt={`Evidence ${idx+1}`} />
                      <button className="ret-photo-remove" onClick={() => setReturnImages(prev => prev.filter((_, i) => i !== idx))}>×</button>
                    </div>
                  ))}
                  {returnImages.length < 3 && (
                    <label className="ret-photo-add">
                      <span>+ Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {returnStep === 3 && (
              <div className="ret-form-section">
                <div className="ret-review-summary">
                  <div className="ret-review-row"><span>Items:</span><strong>{Object.keys(returnSelectedItems).length} item(s)</strong></div>
                  <div className="ret-review-row"><span>Reason:</span><strong>{RETURN_REASONS.find(r => r.value === returnForm.reason)?.label || returnForm.reason}</strong></div>
                  <div className="ret-review-row"><span>Condition:</span><strong>{RETURN_CONDITIONS.find(c => c.value === returnForm.condition)?.label || returnForm.condition}</strong></div>
                  {returnForm.description && <div className="ret-review-row"><span>Notes:</span><strong>{returnForm.description}</strong></div>}
                  <div className="ret-review-row"><span>Photos:</span><strong>{returnImages.length} attached</strong></div>
                </div>
                <p className="ret-form-hint" style={{ marginTop: 12 }}>Once submitted, our team will review your request within 2–3 business days.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              {returnStep > 0 && (
                <button type="button" className="od-cancel-btn" onClick={() => setReturnStep(s => s - 1)}>Back</button>
              )}
              {returnStep < 3 ? (
                <button type="button" className="od-submit-btn" onClick={() => setReturnStep(s => s + 1)} disabled={!canProceed()}>
                  Next
                </button>
              ) : (
                <button type="button" className="od-submit-btn" onClick={submitReturn} disabled={returnSubmitting}>
                  {returnSubmitting ? 'Submitting...' : 'Submit Return'}
                </button>
              )}
              <button type="button" className="od-cancel-btn" onClick={() => { setReturnModalOpen(false); setReturnStep(0); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
