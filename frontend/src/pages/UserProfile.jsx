import React, { useState, useEffect } from "react";
import './UserProfile.css';


export default function UserProfile({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
  const [reviewData, setReviewData] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  let fetchOrdersSaved=null;
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:3000/api/profile/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status == 401 || response.status == 403) {
          window.dispatchEvent(new Event('session_expired'));
          return;
        }

        if (response.ok) {
          const profileData = await response.json();
          setOrders(profileData.orders || []);
          if (profileData.image_url) {
            setAvatarUrl(profileData.image_url);
          }
        }
      } catch (err) {
        console.error("Failed to load orders");
      }
    };

    fetchOrdersSaved=fetchOrders;
    if (user) fetchOrders();
  }, [user]);

  const handleUpdateAvatar = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3000/api/users/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ image_url: avatarUrl })
    });
    alert("Profile image updated!");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/profile/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        product_id: activeReview.productId,
        rating: activeReview.rating,
        comment: activeReview.comment
      })
    });
    if (response.status == 401 || response.status == 403) {
      window.dispatchEvent(new Event('session_expired'));
      return;
    }

    if (response.ok) {
      alert("Review submitted!");
      setActiveReview({ productId: null, rating: 5, comment: "" });
      if(fetchOrdersSaved) fetchOrdersSaved();
    }
  };

  if (!user) return <div style={{ padding: '50px' }}>Please log in.</div>;

  return (
    <div className="profile-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

      {/* 1. PROFILE HEADER */}
      <div className="profile-header" style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" />
        ) : (
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#eee', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 'bold', color: '#888',
            border: '3px solid #f0f0f0'
          }}>
            Profile
          </div>
        )}
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Paste Image URL..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <button onClick={handleUpdateAvatar}>Update Image</button>
          </div>
        </div>
        <button onClick={onLogout} style={{ marginLeft: 'auto', height: '40px', background: 'red', color: 'white' }}>
          Logout
        </button>
      </div>

      {/* 2. ORDER HISTORY */}
      <h3>Order History</h3>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="order-list">
          {orders.map(order => (
            <div key={order.order_id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Order #{order.order_id}</strong>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px',
                  background: order.status.toLowerCase() === 'delivered' ? 'lightgreen' : 'gold'
                }}>
                  Status: {order.status}
                </span>
              </div>

              {order.items.map(item => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
                  <span>{item.qty}x {item.name}</span>

                  {/* Show Review Button ONLY if delivered */}
                  {order.status.toLowerCase() === 'delivered' && (
                    <button onClick={() => setActiveReview({ productId: item.product_id, rating: 5, comment: "" })}>
                      Leave Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 3. REVIEW MODAL/FORM */}
      {activeReview && (
        <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #ccc', marginTop: '20px', borderRadius: '8px' }}>
          <h4>Write a Review for Product #{activeReview.productId}</h4>
          <form onSubmit={submitReview}>
            <select 
              value={activeReview.rating} 
              onChange={(e) => setActiveReview({ ...activeReview, rating: Number(e.target.value) })}
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            <br /><br />
            <textarea
              placeholder="How was it?"
              value={activeReview.comment || ""}
              onChange={(e) => setActiveReview({ ...activeReview, comment: e.target.value })}
              required
              style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <br /><br />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Submit Review
              </button>
              <button type="button" onClick={() => setActiveReview(null)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}