import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import './SellerDashboard.css';
import LoadingSpinner from '../components/LoadingSpinner';
import UploadOverlay from '../components/UploadOverlay';
import PasswordInput from '../components/PasswordInput';
import { FaBox, FaChartLine, FaDollarSign, FaStar, FaSignOutAlt, FaEnvelopeOpenText, FaEdit, FaUserEdit, FaCamera, FaHome } from 'react-icons/fa';

const SellerDashboard = ({ user, onLogout, onUpdateUser }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total_products: 0, total_sales: 0, total_profit: 0, rating: 0 });
    const [adminMessages, setAdminMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Profile Settings state
    const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
    const [updateForm, setUpdateForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        password: ""
    });
    const [confirmPassword, setConfirmPassword] = useState("");

    const [formData, setFormData] = useState({
        name: '', price: '', original_price: '', stock_quantity: 10,
        unit: '1 pcs', category_id: '', image_url: ''
    });

   
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', image_url: '', is_active: true });

    // --- Advertisement State ---
    const [myAds, setMyAds] = useState([]);
    const [adForm, setAdForm] = useState({
        product_id: '',
        title: '',
        tagline: '',
        budget: '',
        duration_days: 7,
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    });
    const [adSubmitting, setAdSubmitting] = useState(false);

    const gradientOptions = [
        { label: '🟣 Purple Dream', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { label: '🔴 Crimson Sunset', value: 'linear-gradient(135deg, #ff9a9e 0%, #ff5252 100%)' },
        { label: '🔵 Ocean Blue', value: 'linear-gradient(135deg, #a1c4fd 0%, #1976d2 100%)' },
        { label: '🟢 Emerald', value: 'linear-gradient(135deg, #84fab0 0%, #08d19b 100%)' },
        { label: '🟡 Golden Hour', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
        { label: '🩷 Pink Blossom', value: 'linear-gradient(135deg, #fbc2eb 0%, #e91e63 100%)' },
        { label: '🌊 Teal Waves', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { label: '🌌 Midnight', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
    ];

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/seller-login');
            return;
        }
        fetchData();
        fetchCategories();
    }, [user, navigate]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: data[0].category_id }));
                }
            }
        } catch (err) {
            console.error("Failed to load categories");
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            const prodRes = await fetch(`http://localhost:3000/api/seller/products/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (prodRes.ok) setProducts(await prodRes.json());

            const statsRes = await fetch(`http://localhost:3000/api/seller/stats/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsRes.ok) setStats(await statsRes.json());

            const msgRes = await fetch(`http://localhost:3000/api/seller/admin-messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (msgRes.ok) setAdminMessages(await msgRes.json());

            const adsRes = await fetch('http://localhost:3000/api/seller/advertisements', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (adsRes.ok) setMyAds(await adsRes.json());
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Universal Cloudinary Uploader
    const handleImageUpload = async (e, isEditMode = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const token = localStorage.getItem("token");
        const uploadData = new FormData();
        uploadData.append("image", file);

        try {
            const res = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                if (isEditMode) {
                    setEditForm(prev => ({ ...prev, image_url: data.image_url }));
                } else {
                    setFormData(prev => ({ ...prev, image_url: data.image_url }));
                }
            } else {
                alert("Failed to upload image.");
            }
        } catch (error) {
            alert("Upload server connection failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileImageUpload = async (e) => {
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

                await fetch("http://localhost:3000/api/profile/update", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ image_url: newImageUrl })
                });

                if (onUpdateUser) {
                    onUpdateUser({ image_url: newImageUrl }); 
                }
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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(updateForm)
            });

            if (res.ok) {
                const data = await res.json();
                if (onUpdateUser) {
                    onUpdateUser({ name: data.user.name, phone: updateForm.phone });
                }
                alert("Profile updated successfully!");
                setUpdateForm(prev => ({ ...prev, password: "" }));
                setConfirmPassword("");
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            alert("Server error during update.");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...formData, seller_id: user.user_id })
            });

            if (response.ok) {
                alert("Product Added Successfully!");
                setFormData({ ...formData, name: '', price: '', image_url: '' });
                fetchData();
                setActiveTab('my-products');
            } else {
                const errData = await response.json();
                alert(`Failed to add: ${errData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert("Network error.");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/api/products/${editingProduct.product_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    price: editForm.price,
                    image_url: editForm.image_url,
                    is_active: editForm.is_active
                })
            });

            if (response.ok) {
                alert("Product updated successfully!");
                setEditingProduct(null);
                fetchData();
            } else {
                const errData = await response.json();
                alert(errData.error || "Failed to update product.");
            }
        } catch (error) {
            alert("Network error.");
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        if (!adForm.product_id) { alert('Please select a product.'); return; }
        if (!adForm.title.trim()) { alert('Please enter an ad title.'); return; }
        if (!adForm.budget || parseFloat(adForm.budget) <= 0) { alert('Please enter a valid budget.'); return; }

        setAdSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:3000/api/seller/advertisements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(adForm)
            });
            if (res.ok) {
                alert('Advertisement created successfully! It will now appear on the banner carousel.');
                setAdForm({ product_id: '', title: '', tagline: '', budget: '', duration_days: 7, gradient: gradientOptions[0].value });
                fetchData();
                setActiveTab('advertise');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create advertisement.');
            }
        } catch (err) {
            alert('Network error.');
        } finally {
            setAdSubmitting(false);
        }
    };

    const handleCancelAd = async (adId) => {
        if (!window.confirm('Cancel this advertisement? It will be removed from the banner.')) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/seller/advertisements/${adId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Advertisement cancelled.');
                fetchData();
            } else {
                alert('Failed to cancel ad.');
            }
        } catch {
            alert('Network error.');
        }
    };

    if (isLoading) return <LoadingSpinner message="Loading Seller Dashboard..." />;

    return (
        <div className="sd-container">
            <UploadOverlay isUploading={isUploading} />
            {/* Header */}
            <div className="sd-header">
                <div>
                    <h2>Welcome, {user?.full_name || user?.name}</h2>
                    <p>Seller Dashboard</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#e8f4fd', color: '#0984e3', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                        <FaHome /> Home
                    </button>
                    <button onClick={onLogout} className="sd-logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="sd-stats-grid">
                <div className="sd-stat-card">
                    <div className="sd-icon-box" style={{ background: '#eafaf1', color: '#2ecc71' }}><FaBox /></div>
                    <div><h3>{stats.total_products}</h3><p>Total Products</p></div>
                </div>
                <div className="sd-stat-card">
                    <div className="sd-icon-box" style={{ background: '#fff9e6', color: '#f1c40f' }}><FaDollarSign /></div>
                    <div><h3>৳ {stats.total_profit}</h3><p>Total Profit</p></div>
                </div>
                <div className="sd-stat-card">
                    <div className="sd-icon-box" style={{ background: '#e3f2fd', color: '#3498db' }}><FaChartLine /></div>
                    <div><h3>{stats.total_sales}</h3><p>Items Sold</p></div>
                </div>
                <div className="sd-stat-card">
                    <div className="sd-icon-box" style={{ background: '#f5eef8', color: '#9b59b6' }}><FaStar /></div>
                    <div><h3>{stats.rating}/5</h3><p>Seller Rating</p></div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sd-nav">
                <div className={`sd-nav-item ${activeTab === 'my-products' ? 'active' : ''}`} onClick={() => setActiveTab('my-products')}>My Products</div>
                <div className={`sd-nav-item ${activeTab === 'add-product' ? 'active' : ''}`} onClick={() => setActiveTab('add-product')}>+ Add New Product</div>
                <div className={`sd-nav-item ${activeTab === 'admin-messages' ? 'active' : ''}`} onClick={() => setActiveTab('admin-messages')}>
                    Messages {adminMessages.length > 0 ? `(${adminMessages.length})` : ''}
                </div>
                <div className={`sd-nav-item ${activeTab === 'advertise' ? 'active' : ''}`} onClick={() => setActiveTab('advertise')}>
                    Advertise {myAds.filter(a => a.is_active).length > 0 ? `(${myAds.filter(a => a.is_active).length} active)` : ''}
                </div>
                <div className={`sd-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <FaUserEdit /> Profile Settings
                </div>
            </div>

            {/* Content Area */}
            <div className="sd-content-area">

                {/* --- MY PRODUCTS TAB --- */}
                {activeTab === 'my-products' && (
                    <div>
                        <h3>My Inventory</h3>
                        <table className="sd-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id}>
                                        <td><img src={p.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                        <td>{p.name}</td>
                                        <td>৳ {p.price}</td>
                                        <td>{p.stock_quantity}</td>
                                        <td>
                                            <span style={{ 
                                                color: p.is_active ? '#27ae60' : '#e74c3c', 
                                                backgroundColor: p.is_active ? '#eafaf1' : '#fadbd8', 
                                                padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' 
                                            }}>
                                                {p.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(p);
                                                    setEditForm({ price: p.price, image_url: p.image_url, is_active: p.is_active });
                                                }}
                                                className="sd-edit-btn"
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- ADD PRODUCT TAB --- */}
                {activeTab === 'add-product' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h3>Add New Product</h3>
                        <form onSubmit={handleAddProduct} className="auth-form">
                            <div className="form-group"><label>Name</label><input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                            <div className="form-group"><label>Price (৳)</label><input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
                            <div className="form-group"><label>Stock</label><input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} required /></div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '5px' }}>
                                    {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Product Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} style={{ padding: '10px 0' }} />

                            </div>
                            {formData.image_url && (
                                <div style={{ margin: '15px 0' }}>
                                    <img src={formData.image_url} alt="Preview" style={{ height: '80px', borderRadius: '4px' }} />
                                </div>
                            )}
                            <button type="submit" style={{ background: '#ff9f43', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>Publish Product</button>
                        </form>
                    </div>
                )}

                {/* --- ADMIN MESSAGES TAB --- */}
                {activeTab === 'admin-messages' && (
                    <div>
                        <h3><FaEnvelopeOpenText /> Messages from Admin</h3>
                        {adminMessages.map(m => (
                            <div key={m.message_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                <strong>{m.subject}</strong>
                                <p style={{ color: '#666', margin: '5px 0' }}>{m.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- ADVERTISE TAB --- */}
                {activeTab === 'advertise' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>📢 Banner Advertisements</h3>
                                <p style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Promote your products on the homepage banner carousel. Customers will see your ad and can click to view product details.</p>
                            </div>
                        </div>

                        {/* === CREATE AD FORM === */}
                        <div style={{ border: '1px solid #eaeaea', background: '#fafbfc', borderRadius: '12px', padding: '28px', marginBottom: '32px' }}>
                            <h4 style={{ color: '#333', marginBottom: '25px', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.01em' }}>Create New Advertisement</h4>
                            <form onSubmit={handleCreateAd}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                                    {/* Product Select */}
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                        <label>Select Product to Advertise *</label>
                                        <select
                                            value={adForm.product_id}
                                            onChange={e => setAdForm({ ...adForm, product_id: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Choose a product --</option>
                                            {products.filter(p => p.is_active).map(p => (
                                                <option key={p.product_id} value={p.product_id}>
                                                    {p.name} — ৳{p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Ad Title */}
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                        <label>Ad Title * <span style={{ color: '#888', fontWeight: '400' }}>(shown on banner)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Fresh Arrivals — Get 20% Off!"
                                            value={adForm.title}
                                            onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                                            maxLength={200}
                                            required
                                        />
                                    </div>

                                    {/* Tagline */}
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                        <label>Tagline <span style={{ color: '#888', fontWeight: '400' }}>(optional subtitle)</span></label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Premium Quality. Delivered Fast."
                                            value={adForm.tagline}
                                            onChange={e => setAdForm({ ...adForm, tagline: e.target.value })}
                                            maxLength={300}
                                        />
                                    </div>

                                    {/* Budget */}
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Ad Budget (৳) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 500"
                                            value={adForm.budget}
                                            onChange={e => setAdForm({ ...adForm, budget: e.target.value })}
                                            required
                                        />
                                        <p style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>Budget is recorded for accounting purposes.</p>
                                    </div>

                                    {/* Duration */}
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Duration (days) *</label>
                                        <select
                                            value={adForm.duration_days}
                                            onChange={e => setAdForm({ ...adForm, duration_days: parseInt(e.target.value) })}
                                        >
                                            <option value={3}>3 days</option>
                                            <option value={7}>7 days</option>
                                            <option value={14}>14 days</option>
                                            <option value={30}>30 days</option>
                                        </select>
                                    </div>

                                    {/* Gradient Color */}
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0, marginTop: '10px' }}>
                                        <label>Banner Theme Color</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                                            {gradientOptions.map(opt => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => setAdForm({ ...adForm, gradient: opt.value })}
                                                    title={opt.label}
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '10px',
                                                        background: opt.value, cursor: 'pointer',
                                                        border: adForm.gradient === opt.value ? '3px solid #333' : '3px solid transparent',
                                                        transition: 'border 0.2s, transform 0.2s',
                                                        transform: adForm.gradient === opt.value ? 'scale(1.15)' : 'scale(1)',
                                                        boxShadow: adForm.gradient === opt.value ? '0 4px 10px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        {/* Preview */}
                                        <div style={{ marginTop: '20px', height: '60px', borderRadius: '10px', background: adForm.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.3)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
                                            Preview: {adForm.title || 'Your Ad Title'}
                                        </div>
                                    </div>
                                </div>

                                <p style={{ marginTop: '20px', marginBottom: '20px', fontSize: '13px', color: '#666', lineHeight: '1.5', background: '#f0f4f8', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
                                    After submission, your ad will be reviewed by admin before appearing on the homepage banner.
                                </p>
                                <button
                                    type="submit"
                                    disabled={adSubmitting}
                                    style={{ marginTop: '4px', width: '100%', padding: '14px', background: adSubmitting ? '#ddd' : '#ffd645', color: adSubmitting ? '#888' : '#333', fontWeight: '700', fontSize: '15px', border: 'none', borderRadius: '8px', cursor: adSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s, transform 0.1s' }}
                                >
                                    {adSubmitting ? 'Submitting...' : 'Submit Advertisement for Review'}
                                </button>
                            </form>
                        </div>

                        {/* === MY ADS LIST === */}
                        <h4 style={{ marginBottom: '16px', color: '#333', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Submitted Advertisements ({myAds.length})</h4>
                        {myAds.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '10px', color: '#bbb' }}>
                                <p>No advertisements submitted yet. Create one above to promote your products.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {myAds.map(ad => {
                                        const expired = ad.expires_at && new Date(ad.expires_at) < new Date();
                                        const statusLabel = !ad.is_active ? 'Cancelled' : expired ? 'Expired' : ad.status === 'approved' ? 'Active' : ad.status === 'rejected' ? 'Rejected' : 'Pending Review';
                                        const statusColors = {
                                            'Active':        { bg: '#eafaf1', color: '#27ae60' },
                                            'Pending Review':{ bg: '#fff8e1', color: '#b8860b' },
                                            'Rejected':      { bg: '#fff0f0', color: '#e74c3c' },
                                            'Expired':       { bg: '#fef9c3', color: '#f59e0b' },
                                            'Cancelled':     { bg: '#f5f5f5', color: '#aaa'    },
                                        };
                                        const sc = statusColors[statusLabel] || { bg: '#f5f5f5', color: '#aaa' };
                                        const expiresStr = ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('en-BD') : 'No expiry';
                                    return (
                                        <div key={ad.ad_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            {/* Gradient swatch */}
                                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: ad.gradient, flexShrink: 0 }} />

                                            {/* Product image */}
                                            <img src={ad.product_image} alt={ad.product_name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '700', fontSize: '15px', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.title}</div>
                                                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{ad.product_name} · ৳{ad.price}</div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                            <div className="ad-status-badge-text" style={{
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                                                background: sc.bg, color: sc.color, fontWeight: '700', border: `1px solid ${sc.color}33`
                                            }}>{statusLabel}</div>
                                                    <span style={{ fontSize: '11px', color: '#aaa' }}>Budget: ৳{ad.budget}</span>
                                                    <span style={{ fontSize: '11px', color: '#aaa' }}>Expires: {expiresStr}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => window.open(`/ad/${ad.ad_id}`, '_blank')}
                                                    style={{ padding: '7px 14px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                                >
                                                    👁 Preview
                                                </button>
                                                {ad.is_active && !expired && (
                                                    <button
                                                        onClick={() => handleCancelAd(ad.ad_id)}
                                                        style={{ padding: '7px 14px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* --- SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h3>Profile Settings</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Seller Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaUserEdit size={30} color="#ccc" />
                                    </div>
                                )}
                                <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#3498db', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <FaCamera />
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleProfileImageUpload} />
                                </label>
                            </div>
                            <div>
                                <h4>Profile Image</h4>
                                <p style={{ color: '#666', fontSize: '13px' }}>Upload a new image. Max size 2MB.</p>

                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="auth-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={updateForm.name} onChange={e => setUpdateForm({...updateForm, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <PasswordInput
                                    label="New Password"
                                    value={updateForm.password}
                                    onChange={e => setUpdateForm({...updateForm, password: e.target.value})}
                                    confirm
                                    confirmValue={confirmPassword}
                                    onConfirmChange={e => setConfirmPassword(e.target.value)}
                                    optional
                                    minLength={8}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <button type="submit" style={{ background: '#2ecc71', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {/* --- EDIT MODAL OVERLAY --- */}
                {editingProduct && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '400px' }}>
                            <h3>Edit: {editingProduct.name}</h3>
                            <form onSubmit={handleSaveEdit}>
                                <div className="form-group">
                                    <label>Price (৳)</label>
                                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Visibility Status</label>
                                    <select 
                                        value={editForm.is_active} 
                                        onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="true">Active (Visible)</option>
                                        <option value="false">Inactive (Hidden)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Update Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
    
                                    {editForm.image_url && <img src={editForm.image_url} alt="preview" style={{ height: '60px', marginTop: '10px', borderRadius: '4px' }} />}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
                                    <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default SellerDashboard;