import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaMotorcycle, FaCheckCircle, FaHistory, FaUserEdit, FaSignOutAlt, FaMapMarkerAlt, FaStar, FaCamera, FaHome } from 'react-icons/fa';

export default function RiderDashboard({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('available');
  
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [history, setHistory] = useState({ rating: 0, deliveries: [] });
  
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: user?.name || "", phone: user?.phone || "", password: "" });

  // Location States
  const [isMapOpen, setIsMapOpen] = useState(false);
  const defaultloc = "Update your location to see nearby deliveries";
  const [riderLocation, setRiderLocation] = useState(defaultloc);
  
  const fetchAddressName = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      return data.locality ? `${data.locality}, ${data.city}` : (data.city || data.countryName);
    } catch (error) {
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'rider') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const availRes = await fetch("http://localhost:3000/api/rider/orders/available", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (availRes.ok) setAvailableOrders(await availRes.json());

      const myJobsRes = await fetch("http://localhost:3000/api/rider/orders/my-deliveries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (myJobsRes.ok) setMyJobs(await myJobsRes.json());
      
      const historyRes = await fetch("http://localhost:3000/api/rider/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (historyRes.ok) setHistory(await historyRes.json());

      const myPictureRes = await fetch("http://localhost:3000/api/rider/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (myPictureRes.ok) {
        const profileData = await myPictureRes.json();
        if (profileData.image_url) setAvatarUrl(profileData.image_url);
        setUpdateForm(prev => ({ ...prev, name: profileData.name || prev.name, phone: profileData.phone || prev.phone }));
      }
    } catch (err) {
      console.error("Failed to fetch rider data");
    } finally {
      setIsLoading(false);
    }
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

            if(onUpdateUser) onUpdateUser({ image_url: newImageUrl });
            alert("Profile image updated successfully!");
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
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(updateForm)
        });

        if (res.ok) {
            if (onUpdateUser) onUpdateUser({ name: updateForm.name, phone: updateForm.phone });
            alert("Profile details updated successfully!");
            setUpdateForm(prev => ({ ...prev, password: "" })); 
        } else {
            alert("Failed to update profile details.");
        }
    } catch (error) {
        alert("Server error during update.");
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if(riderLocation === defaultloc) {
      alert("Please update your location before accepting a delivery!");
      return;
    }
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/api/rider/orders/${orderId}/accept`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      alert("Job Accepted! Drive safe.");
      fetchDashboardData(); 
    } else {
      const data = await response.json();
      alert(data.error || "Failed to accept job.");
    }
  };

  const handleDeliverOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/rider/orders/${orderId}/deliver`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      alert("Delivery successful! Great job.");
      fetchDashboardData();
    }
  };

  const styles = {
      container: { padding: '20px', background: '#f4f6f8', minHeight: '100vh', fontFamily: 'sans-serif' },
      header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
      card: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
      nav: { display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', overflowX: 'auto' },
      navItem: (isActive) => ({ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', background: isActive ? '#00cec9' : 'transparent', color: isActive ? 'white' : '#555', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }),
      grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
      jobCard: { padding: '20px', border: '1px solid #dfe6e9', borderRadius: '10px', background: '#f8f9fa' }
  };

  if (isLoading) return <LoadingSpinner message="Loading Rider Dashboard..." />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
          <div>
              <h2 style={{ margin: 0, color: '#2d3436' }}>👋 Welcome, {user?.full_name || user?.name}</h2>
              <p style={{ color: '#636e72', margin: '5px 0 0 0' }}>Rider Dashboard Portal</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate('/')} style={{ padding: '8px 15px', background: '#e8f4fd', color: '#0984e3', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaHome /> Home
              </button>
              <button onClick={() => setIsMapOpen(true)} style={{ padding: '8px 15px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaMapMarkerAlt /> {riderLocation === defaultloc ? "Set Location" : "Update Location"}
              </button>
              <button onClick={onLogout} style={{ padding: '8px 20px', background: '#d63031', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaSignOutAlt /> Sign Out
              </button>
          </div>
      </div>

      <LocationPicker 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelectLocation={async (loc) => { 
          setRiderLocation("Locating...");
          const address = await fetchAddressName(loc.lat, loc.lng);
          setRiderLocation(address); 
        }} 
      />

      {/* Tabs */}
      <div style={styles.nav}>
          <div style={styles.navItem(activeTab === 'available')} onClick={() => setActiveTab('available')}>
            <FaMotorcycle /> Available Jobs ({availableOrders.length})
          </div>
          <div style={styles.navItem(activeTab === 'active')} onClick={() => setActiveTab('active')}>
            <FaCheckCircle /> Active Deliveries ({myJobs.length})
          </div>
          <div style={styles.navItem(activeTab === 'history')} onClick={() => setActiveTab('history')}>
            <FaHistory /> Delivery History
          </div>
          <div style={styles.navItem(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
            <FaUserEdit /> Profile Settings
          </div>
      </div>

      <div style={{ ...styles.card, minHeight: '60vh' }}>
        
        {/* AVAILABLE JOBS */}
        {activeTab === 'available' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Jobs near you</h3>
            <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '20px' }}>Current location tracking: {riderLocation}</p>
            {availableOrders.length === 0 ? <p className="muted">No deliveries actively looking for riders right now.</p> : (
              <div style={styles.grid}>
                {availableOrders.map(order => (
                  <div key={order.order_id} style={{ ...styles.jobCard, borderLeft: '4px solid #0984e3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '18px' }}>Order #{order.order_id}</strong>
                      <strong style={{ fontSize: '16px', color: '#0984e3' }}>৳{order.delivery_fee.toFixed(2)}</strong>
                    </div>
                    <p style={{ margin: '5px 0', color: '#2d3436' }}>📍 {order.street}, {order.city}</p>
                    <p style={{ margin: '5px 0', color: '#636e72' }}>👤 {order.customer_name} ({order.customer_phone})</p>
                    <button 
                      onClick={() => handleAcceptOrder(order.order_id)}
                      style={{ width: '100%', padding: '10px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}
                    >
                      Accept Job
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE DELIVERIES */}
        {activeTab === 'active' && (
          <div>
            <h3 style={{ marginTop: 0 }}>Your Assigned Deliveries</h3>
            {myJobs.length === 0 ? <p className="muted">You have no active deliveries right now. Check the "Available Jobs" tab.</p> : (
              <div style={styles.grid}>
                {myJobs.map(job => (
                  <div key={job.order_id} style={{ ...styles.jobCard, borderLeft: '4px solid #00cec9', background: '#e0fbfb' }}>
                    <strong style={{ fontSize: '18px' }}>Order #{job.order_id}</strong>
                    <p style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>📍 {job.street}</p>
                    <p style={{ margin: '5px 0 15px 0' }}>📞 {job.customer_name} - {job.customer_phone}</p>
                    <button 
                      onClick={() => handleDeliverOrder(job.order_id)}
                      style={{ width: '100%', padding: '10px', background: '#00b894', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Mark as Delivered ✅
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY & RATING */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '20px', background: '#f1f2f6', borderRadius: '10px', display: 'inline-flex' }}>
               <div style={{ background: '#f1c40f', color: '#fff', padding: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <FaStar size={30} />
               </div>
               <div>
                  <h3 style={{ margin: 0, fontSize: '24px' }}>{history.rating.toFixed(1)} / 5.0</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#636e72' }}>Overall Rider Rating</p>
               </div>
               <div style={{ marginLeft: '30px', borderLeft: '2px solid #dfe6e9', paddingLeft: '30px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px' }}>{history.deliveries.length}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#636e72' }}>Total Lifetime Deliveries</p>
               </div>
            </div>

            <h3>Past Deliveries</h3>
            {history.deliveries.length === 0 ? <p className="muted">You have no completed deliveries on record.</p> : (
              <div style={styles.grid}>
                {history.deliveries.map(d => (
                  <div key={d.order_id} style={{ ...styles.jobCard, background: '#fff', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong>Order #{d.order_id}</strong>
                      <span style={{ fontSize: '13px', color: '#B53471', background: '#f8c291', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Delivered</span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#636e72' }}>{new Date(d.arrival_time || d.order_time).toLocaleString()}</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Customer: {d.customer_name}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Address: {d.street}, {d.city}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '500px' }}>
              <h3 style={{ marginTop: 0 }}>Profile Settings</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                      {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaUserEdit size={30} color="#ccc" />
                          </div>
                      )}
                      <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#0984e3', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <FaCamera />
                          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                      </label>
                  </div>
                  <div>
                      <h4>Delivery Profile Image</h4>
                      <p style={{ color: '#666', fontSize: '13px', margin: '5px 0' }}>Customers see this when tracking orders.</p>
                      {isUploading && <span style={{ color: '#0984e3', fontSize: '14px', fontWeight: 'bold' }}>Uploading...</span>}
                  </div>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Legal Name</label>
                      <input type="text" value={updateForm.name} onChange={e => setUpdateForm({...updateForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Contact Phone</label>
                      <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>New Password (Optional)</label>
                      <input type="password" placeholder="Leave blank to maintain current" value={updateForm.password} onChange={e => setUpdateForm({...updateForm, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" style={{ background: '#00cec9', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                      Secure Profile Changes
                  </button>
              </form>
          </div>
        )}

      </div>
    </div>
  );
}