
import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';

export default function RiderDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
  // Location States
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [riderLocation, setRiderLocation] = useState("Update your location to see nearby deliveries");
    const defaultloc= "Update your location to see nearby deliveries";
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
      const availRes = await fetch("http://localhost:3000/api/rider/orders/available", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (availRes.ok) setAvailableOrders(await availRes.json());

      const myJobsRes = await fetch("http://localhost:3000/api/rider/orders/my-deliveries", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const myPictureRes = await fetch("http://localhost:3000/api/rider/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
        if (myPictureRes.ok) {
            const profileData = await myPictureRes.json();
            if (profileData.image_url) {
                setAvatarUrl(profileData.image_url);
            }

        }
      if (myJobsRes.ok) setMyJobs(await myJobsRes.json());
    } catch (err) {
      console.error("Failed to fetch rider data");
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
        // 1. Upload to Cloudinary
        const uploadRes = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadData
        });

        if (uploadRes.ok) {
            const data = await uploadRes.json();
            const newImageUrl = data.image_url;
            setAvatarUrl(newImageUrl); // Update the UI instantly

            // 2. Save the new URL to PostgreSQL
            await fetch("http://localhost:3000/api/users/avatar", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ image_url: newImageUrl })
            });
            
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

return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d3436', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Rider Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #00cec9' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#636e72', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', border: '3px solid #00cec9' }}>
              Rider
            </div>
          )}
          
          <div>
            <h2 style={{ margin: 0, color: '#00cec9' }}>My Profile</h2>
            <p style={{ margin: '5px 0 10px 0', fontSize: '18px' }}>{user?.name}</p>
            
            {/* Rider Avatar Update Input */}
            <div style={{ marginTop: '10px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                id="rider-avatar-upload"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="rider-avatar-upload" 
                style={{ background: '#0984e3', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                {isUploading ? "Uploading..." : "Change Avatar"}
              </label>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <button 
            onClick={onLogout} 
            style={{ padding: '8px 20px', background: '#d63031', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sign Out
          </button>

          <div>
            <button 
              onClick={() => setIsMapOpen(true)} 
              style={{ padding: '8px 15px', background: '#00cec9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📍 {riderLocation === "Update your location to see nearby deliveries" ? "Set Location" : "Update Location"}
            </button>
            <p style={{ fontSize: '12px', color: '#b2bec3', maxWidth: '200px', margin: '5px 0 0 0' }}>
              {riderLocation}
            </p>
          </div>
        </div>
      </div>

      <LocationPicker 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelectLocation={(loc) => {
          setRiderLocation(`Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}`);
        }} 
      />

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        
        <div style={{ flex: '1 1 400px' }}>
          <h3>Available Deliveries</h3>
          {availableOrders.length === 0 ? <p>No deliveries available right now.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {availableOrders.map(order => (
                <div key={order.order_id} style={{ padding: '20px', border: '1px solid #dfe6e9', borderRadius: '10px', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '18px' }}>Order #{order.order_id}</strong>
                    <strong style={{ fontSize: '16px', color: '#0984e3' }}>${order.delivery_fee.toFixed(2)}</strong>
                  </div>
                  <p style={{ margin: '5px 0', color: '#636e72' }}>📍 {order.street}, {order.city}</p>
                  <p style={{ margin: '5px 0', color: '#636e72' }}>👤 {order.customer_name} ({order.customer_phone})</p>
                  <button 
                    onClick={() => handleAcceptOrder(order.order_id)}
                    style={{ width: '100%', padding: '10px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                  >
                    Accept Job
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h3>My Active Deliveries (On The Way)</h3>
          {myJobs.length === 0 ? <p>You have no active deliveries.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myJobs.map(job => (
                <div key={job.order_id} style={{ padding: '20px', border: '2px solid #00cec9', borderRadius: '10px', background: '#e0fbfb' }}>
                  <strong style={{ fontSize: '18px' }}>Order #{job.order_id}</strong>
                  <p style={{ margin: '10px 0 5px 0' }}>📍 {job.street}</p>
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

      </div>
    </div>
  );
}