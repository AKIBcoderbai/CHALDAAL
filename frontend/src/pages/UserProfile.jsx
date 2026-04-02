import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaBox, FaSignOutAlt, FaCamera } from "react-icons/fa";
import './UserProfile.css';

export default function UserProfile({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(user || {});
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);

  // Settings form state
  const [updateForm, setUpdateForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: ""
  });

  const fetchProfileInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/api/profile/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new Event('session_expired'));
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setOrders(data.orders || []);
        if (data.image_url) setAvatarUrl(data.image_url);
        setUpdateForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || prev.phone
        }));
      }
    } catch (err) {
      console.error("Failed to load profile");
    }
  };

  useEffect(() => {
    if (user) fetchProfileInfo();
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem("token");

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const uploadRes = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        const newImageUrl = data.image_url;
        setAvatarUrl(newImageUrl);

        await fetch("http://localhost:3000/api/users/avatar", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ image_url: newImageUrl })
        });
        alert("Profile image updated successfully!");
        fetchProfileInfo();
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      alert("Server connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updateForm.name,
          phone: updateForm.phone,
          password: updateForm.password
        })
      });
      if (res.ok) {
        alert("Profile info updated successfully!");
        setUpdateForm({ ...updateForm, password: "" }); // clear password field
        fetchProfileInfo();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Update failed due to network error.");
    }
  };

  if (!user) return <div className="no-access">Please log in to view your profile.</div>;

  return (
    <div className="profile-dashboard">
      <div className="profile-sidebar">
        <div className="sidebar-header">
          <div className="avatar-wrapper">
            <img 
              src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Avatar" 
              className="sidebar-avatar" 
            />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              <FaCamera />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="avatar-upload"
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </div>
          <h3>{profileData.name || user.name}</h3>
          <p>{profileData.email || user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === "orders" ? "active" : ""} 
            onClick={() => setActiveTab("orders")}
          >
            <FaBox /> My Orders
          </button>
          <button 
            className={activeTab === "settings" ? "active" : ""} 
            onClick={() => setActiveTab("settings")}
          >
            <FaUserEdit /> Settings
          </button>
          <button className="logout-btn" onClick={onLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>

      <div className="profile-content">
        {activeTab === "orders" && (
          <div className="tab-pane">
            <h2>Order History</h2>
            {orders.length === 0 ? (
              <div className="empty-state">You haven't placed any orders yet.</div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => (
                  <div 
                    key={order.order_id} 
                    className="order-card"
                    onClick={() => navigate(`/order/${order.order_id}`)}
                  >
                    <div className="order-card-header">
                      <span className="order-number">Order #{order.order_id}</span>
                      <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-card-body">
                      <div className="items-preview">
                        {order.items.slice(0, 3).map((item, idx) => (
                           <div key={idx} className="item-thumb-row">
                             <img src={item.image} alt={item.name} />
                             <span className="item-name">{item.qty}x {item.name}</span>
                           </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">+{order.items.length - 3} more items...</div>
                        )}
                      </div>
                    </div>
                    <div className="order-card-footer">
                      <button className="view-details-btn">View Full Details &rarr;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-pane">
            <h2>Account Settings</h2>
            <form className="settings-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="text" value={profileData.email || user.email} disabled className="disabled-input" />
                <small>Email address cannot be changed.</small>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={updateForm.name} 
                  onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={updateForm.phone} 
                  onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group divider-group">
                <h3>Security</h3>
                <label>New Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={updateForm.password}
                  onChange={(e) => setUpdateForm({...updateForm, password: e.target.value})}
                />
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}