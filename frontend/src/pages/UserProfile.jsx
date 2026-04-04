import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaBox, FaSignOutAlt, FaCamera, FaHome, FaGift, FaCopy, FaCheck, FaLock } from "react-icons/fa";
import LoadingSpinner from '../components/LoadingSpinner';
import UploadOverlay from '../components/UploadOverlay';
import PasswordInput from '../components/PasswordInput';
import './UserProfile.css';

export default function UserProfile({ user, onUpdateUser, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(user || {});
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rewardsData, setRewardsData] = useState(null);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Settings form state
  const [updateForm, setUpdateForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfileInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfileInfo();
  }, [user]);

  const fetchRewards = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setRewardsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/users/my-coupons", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setRewardsData(await res.json());
    } catch { /* silent */ } finally { setRewardsLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'rewards') fetchRewards();
  }, [activeTab]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
        if (onUpdateUser) {
              onUpdateUser({ image_url: newImageUrl }); 
            }
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
    if (updateForm.password && updateForm.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    if (updateForm.password && updateForm.password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
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
        setUpdateForm({ ...updateForm, password: "" });
        setConfirmPassword("");
        if (onUpdateUser) {
          onUpdateUser({ 
            name: updateForm.name, 
            full_name: updateForm.name, 
            phone: updateForm.phone 
          });
        }
        fetchProfileInfo();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Update failed due to network error.");
    }
  };

  if (!user) return <div className="no-access">Please log in to view your profile.</div>;
  if (isLoading) return <LoadingSpinner message="Loading Profile..." />;

  return (
    <div className="profile-dashboard">
      <UploadOverlay isUploading={isUploading} />
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
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaHome /> Home
          </button>
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
          <button
            className={activeTab === "rewards" ? "active" : ""}
            onClick={() => setActiveTab("rewards")}
          >
            <FaGift /> Rewards
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

        {activeTab === "rewards" && (
          <div className="tab-pane">
            <h2>Rewards & Coupons</h2>
            {rewardsLoading ? (
              <p style={{ color: '#888' }}>Loading your rewards...</p>
            ) : !rewardsData ? (
              <div className="empty-state">Could not load rewards. Please try again.</div>
            ) : (
              <>
                {/* Tier Badge + Points */}
                <div className="rewards-tier-card" style={{ borderColor: rewardsData.current_tier.color }}>
                  <div className="tier-icon-big">{rewardsData.current_tier.icon}</div>
                  <div className="tier-info">
                    <span className="tier-label" style={{ color: rewardsData.current_tier.color }}>
                      {rewardsData.current_tier.tier_name} Member
                    </span>
                    <div className="points-display">
                      <span className="points-num">{rewardsData.loyalty_points}</span>
                      <span className="points-label">Loyalty Points</span>
                    </div>
                    {rewardsData.next_tier ? (
                      <div className="tier-progress-wrap">
                        <div className="tier-progress-bar">
                          <div
                            className="tier-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.round((rewardsData.loyalty_points / rewardsData.next_tier.min_points) * 100))}%`,
                              background: rewardsData.next_tier.color
                            }}
                          />
                        </div>
                        <p className="tier-progress-label">
                          {rewardsData.next_tier.min_points - rewardsData.loyalty_points} points to <strong>{rewardsData.next_tier.icon} {rewardsData.next_tier.tier_name}</strong>
                        </p>
                      </div>
                    ) : (
                      <p className="tier-progress-label" style={{ color: '#ffd700', fontWeight: 700 }}>✨ Maximum tier reached!</p>
                    )}
                  </div>
                </div>

                <p className="rewards-info-note">💡 You earn <strong>1 point per ৳100 spent</strong>. Points unlock better coupons automatically!</p>

                {/* Coupons Grid */}
                <div className="coupons-grid">
                  {rewardsData.coupons.map(c => {
                    const isUnlocked = c.unlocked;
                    const isUsed = c.used === true;
                    return (
                      <div
                        key={c.coupon_id}
                        className={`coupon-card ${isUnlocked ? 'unlocked' : 'locked'} ${isUsed ? 'used' : ''}`}
                        style={{ borderLeft: `4px solid ${c.color}` }}
                      >
                        <div className="coupon-top">
                          <span className="coupon-tier-badge" style={{ background: c.color }}>
                            {c.icon} {c.tier_name}
                          </span>
                          {!isUnlocked && <span className="coupon-lock-badge"><FaLock /> Locked</span>}
                          {isUsed && <span className="coupon-used-badge"><FaCheck /> Used</span>}
                        </div>
                        <div className="coupon-discount">
                          {c.discount_value}% OFF
                          {c.max_discount && <span> (up to ৳{c.max_discount})</span>}
                        </div>
                        <p className="coupon-desc">{c.description}</p>
                        <div className="coupon-code-row">
                          <code className={`coupon-code ${!isUnlocked ? 'blurred' : ''}`}>
                            {isUnlocked ? c.code : '••••••••'}
                          </code>
                          {isUnlocked && !isUsed && (
                            <button
                              className="copy-code-btn"
                              onClick={() => copyCode(c.code)}
                              title="Copy to clipboard"
                            >
                              {copiedCode === c.code ? <FaCheck style={{ color: '#38a169' }} /> : <FaCopy />}
                            </button>
                          )}
                        </div>
                        {!isUnlocked && (
                          <p className="coupon-unlock-hint">Reach <strong>{c.min_points} points</strong> to unlock</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
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
                <PasswordInput
                  label="New Password"
                  value={updateForm.password}
                  onChange={e => setUpdateForm({...updateForm, password: e.target.value})}
                  confirm
                  confirmValue={confirmPassword}
                  onConfirmChange={e => setConfirmPassword(e.target.value)}
                  optional
                  minLength={8}
                  placeholder="Leave blank to keep current"
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