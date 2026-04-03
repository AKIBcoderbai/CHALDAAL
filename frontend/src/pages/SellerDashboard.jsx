import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { FaBox, FaChartLine, FaDollarSign, FaStar, FaSignOutAlt, FaEnvelopeOpenText, FaEdit, FaUserEdit, FaCamera } from 'react-icons/fa';

const SellerDashboard = ({ user, onLogout, onUpdateUser }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total_products: 0, total_sales: 0, total_profit: 0, rating: 0 });
    const [adminMessages, setAdminMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Profile Settings state
    const [avatarUrl, setAvatarUrl] = useState(user?.image_url || "");
    const [updateForm, setUpdateForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        password: ""
    });

    const [formData, setFormData] = useState({
        name: '', price: '', original_price: '', stock_quantity: 10,
        unit: '1 pcs', category_id: '', image_url: ''
    });

   
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', image_url: '', is_active: true });

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
        } catch (error) {
            console.error("Error loading dashboard:", error);
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
                setEditingProduct(null); // Close modal
                fetchData(); // Refresh UI instantly
            } else {
                const errData = await response.json();
                alert(errData.error || "Failed to update product.");
            }
        } catch (error) {
            alert("Network error.");
        }
    };

    const styles = {
        container: { padding: '20px', background: '#f4f6f8', minHeight: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
        statCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
        iconBox: { width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' },
        nav: { display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' },
        navItem: (isActive) => ({ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', background: isActive ? '#2d3436' : 'transparent', color: isActive ? 'white' : '#555', fontWeight: '600' }),
        table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' },
        th: { padding: '15px', background: '#2d3436', color: 'white', textAlign: 'left' },
        td: { padding: '12px 15px', borderBottom: '1px solid #eee' }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2>👋 Welcome, {user?.full_name || user?.name}</h2>
                    <p style={{ color: '#666' }}>Seller Dashboard</p>
                </div>
                <button onClick={onLogout} style={{ ...styles.navItem(true), background: '#e74c3c' }}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#3498db' }}><FaBox /></div>
                    <div><h3>{stats.total_products}</h3><p>Total Products</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#2ecc71' }}><FaDollarSign /></div>
                    <div><h3>৳ {stats.total_profit}</h3><p>Total Profit</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#9b59b6' }}><FaChartLine /></div>
                    <div><h3>{stats.total_sales}</h3><p>Items Sold</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#f1c40f' }}><FaStar /></div>
                    <div><h3>{stats.rating}/5</h3><p>Seller Rating</p></div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.nav}>
                <div style={styles.navItem(activeTab === 'my-products')} onClick={() => setActiveTab('my-products')}>My Products</div>
                <div style={styles.navItem(activeTab === 'add-product')} onClick={() => setActiveTab('add-product')}>+ Add New Product</div>
                <div style={styles.navItem(activeTab === 'admin-messages')} onClick={() => setActiveTab('admin-messages')}>
                    Messages {adminMessages.length > 0 ? `(${adminMessages.length})` : ''}
                </div>
                <div style={styles.navItem(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
                    <FaUserEdit /> Profile Settings
                </div>
            </div>

            {/* Content Area */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', position: 'relative' }}>

                {/* --- MY PRODUCTS TAB --- */}
                {activeTab === 'my-products' && (
                    <div>
                        <h3>My Inventory</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Image</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Price</th>
                                    <th style={styles.th}>Stock</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id}>
                                        <td style={styles.td}><img src={p.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                        <td style={styles.td}>{p.name}</td>
                                        <td style={styles.td}>৳ {p.price}</td>
                                        <td style={styles.td}>{p.stock_quantity}</td>
                                        <td style={styles.td}>
                                            <span style={{ 
                                                color: p.is_active ? '#27ae60' : '#e74c3c', 
                                                backgroundColor: p.is_active ? '#eafaf1' : '#fadbd8', 
                                                padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' 
                                            }}>
                                                {p.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(p);
                                                    setEditForm({ price: p.price, image_url: p.image_url, is_active: p.is_active });
                                                }}
                                                style={{ background: '#0984e3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
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
                                {isUploading && <span style={{ color: '#0984e3', fontSize: '14px' }}>⏳ Uploading...</span>}
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
                                {isUploading && <span style={{ color: '#3498db', fontSize: '14px', fontWeight: 'bold' }}>Uploading...</span>}
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
                                <label>New Password (Optional)</label>
                                <input type="password" placeholder="Leave blank to keep current password" value={updateForm.password} onChange={e => setUpdateForm({...updateForm, password: e.target.value})} />
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
                                    {isUploading && <p style={{color: '#0984e3'}}>Uploading...</p>}
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