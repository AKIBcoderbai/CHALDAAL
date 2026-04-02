import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { FaBox, FaChartLine, FaDollarSign, FaStar, FaSignOutAlt, FaEnvelopeOpenText } from 'react-icons/fa';

const SellerDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total_products: 0, total_sales: 0, total_profit: 0, rating: 0 });
    const [adminMessages, setAdminMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', price: '', original_price: '', stock_quantity: 10,
        unit: '1 pcs', category_id: '', image_url: '' // category_id starts empty
    });

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/seller-login');
            return;
        }
        fetchData();
        fetchCategories();
    }, [user, navigate]);

    //  FETCH ACTUAL DB CATEGORIES
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
            // Fetch Products
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication token missing. Please login again.");
                navigate("/login");
                return;
            }

            const prodRes = await fetch(`http://localhost:3000/api/seller/products/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProducts(prodData);
            }

            // Fetch Stats
            const statsRes = await fetch(`http://localhost:3000/api/seller/stats/${user.user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            const msgRes = await fetch(`http://localhost:3000/api/seller/admin-messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (msgRes.ok) {
                const msgData = await msgRes.json();
                setAdminMessages(msgData);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const token = localStorage.getItem("token");

        // We must use FormData to send actual files!
        const uploadData = new FormData();
        uploadData.append("image", file);

        try {
            const res = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // Notice: No 'Content-Type' header! Browser sets it automatically for FormData.
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, image_url: data.image_url });
            } else {
                alert("Failed to upload image.");
            }
        } catch (error) {
            alert("Upload server connection failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication token missing. Please login again.");
                navigate("/login");
                return;
            }
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, seller_id: user.user_id })
            });

            if (response.ok) {
                alert("Product Added Successfully!");
                setFormData({ ...formData, name: '', price: '', image_url: '' });
                fetchData();
                setActiveTab('my-products');
            } else {
                //Catch and display the database rejection
                const errData = await response.json();
                alert(`Failed to add product: ${errData.error || errData.message || 'Unknown server error'}`);
            }
        } catch (error) {
            alert("Network error: Failed to reach server");
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmDeactivate = window.confirm("Are you sure you want to deactivate this product? It will be hidden from the storefront.");
        if (!confirmDeactivate) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication token missing. Please login again.");
                navigate("/login");
                return;
            }

            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Product deactivated successfully!");
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p.product_id === productId ? { ...p, is_active: false } : p
                    )
                );
            } else {
                const data = await response.json();
                alert(data.error || "Failed to deactivate product.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Server connection failed.");
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
                    <p style={{ color: '#666' }}>Seller Dashboard Overview</p>
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
                <div style={styles.navItem(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</div>
                <div style={styles.navItem(activeTab === 'admin-messages')} onClick={() => setActiveTab('admin-messages')}>
                    Admin messages {adminMessages.length > 0 ? `(${adminMessages.length})` : ''}
                </div>
                <div style={styles.navItem(activeTab === 'my-products')} onClick={() => setActiveTab('my-products')}>My Products</div>
                <div style={styles.navItem(activeTab === 'add-product')} onClick={() => setActiveTab('add-product')}>+ Add New Product</div>
            </div>

            {/* Content Area */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <h3>📈 Performance Charts</h3>
                        <p>Detailed sales graphs will appear here soon.</p>
                        <p>For now, use the tabs to manage your inventory!</p>
                    </div>
                )}

                {activeTab === 'admin-messages' && (
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <FaEnvelopeOpenText /> Messages from Chaldal admin
                        </h3>
                        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                            Important notices about your listings, delivery issues, or policy — sent by the platform team.
                        </p>
                        {adminMessages.length === 0 ? (
                            <p style={{ color: '#888', padding: '24px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                                No messages yet. When an admin contacts you about an order or product, it will appear here.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {adminMessages.map((m) => (
                                    <div
                                        key={m.message_id}
                                        style={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            background: '#fafafa',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                            <strong style={{ fontSize: '16px', color: '#2d3436' }}>{m.subject}</strong>
                                            <span style={{ fontSize: '12px', color: '#888' }}>
                                                {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#636e72', marginBottom: '10px' }}>
                                            From: {m.admin_name || 'Admin'}
                                            {m.admin_email ? ` · ${m.admin_email}` : ''}
                                        </p>
                                        {m.product_id && (
                                            <p style={{ fontSize: '13px', color: '#0984e3', marginBottom: '8px' }}>
                                                Related product: #{m.product_id}
                                                {m.product_name ? ` — ${m.product_name}` : ''}
                                            </p>
                                        )}
                                        <p style={{ whiteSpace: 'pre-wrap', color: '#2d3436', lineHeight: 1.5 }}>{m.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. ADD PRODUCT TAB  */}
                {activeTab === 'add-product' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h3>Add New Product</h3>
                        <form onSubmit={handleAddProduct} className="auth-form">
                            <div className="form-group"><label>Name</label><input name="name" value={formData.name} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Stock</label><input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required /></div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div className="form-group">
                                <label>Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ padding: '10px 0' }}
                                />
                                {isUploading && <span style={{ color: '#0984e3', fontSize: '14px', fontWeight: 'bold' }}>⏳ Uploading to Cloudinary...</span>}
                            </div>

                            {/* Show a preview of the image once it finishes uploading! */}
                            {formData.image_url && (
                                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                                    <img src={formData.image_url} alt="Preview" style={{ height: '120px', borderRadius: '8px', border: '2px solid #2ecc71' }} />
                                    <p style={{ color: '#2ecc71', fontSize: '12px', margin: '5px 0' }}>✅ Image Ready</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                style={{
                                    background: '#ff9f43',
                                    color: 'white',
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    fontSize: '16px',
                                    marginTop: '15px'
                                }}
                            >
                                Publish Product
                            </button>
                        </form>
                    </div>
                )}

                {/* 3. MY PRODUCTS TAB  */}
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
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id}>
                                        <td style={styles.td}><img src={p.image_url} alt="" style={{ width: '40px', borderRadius: '4px' }} /></td>
                                        <td style={styles.td}>{p.name}</td>
                                        <td style={styles.td}>৳ {p.price}</td>
                                        <td style={styles.td}>{p.stock_quantity}</td>
                                        <td style={styles.td}>
                                            {/* Conditionally render the button based on status */}
                                            {p.is_active ? (
                                                <button
                                                    onClick={() => handleDeleteProduct(p.product_id)}
                                                    style={{ color: 'white', backgroundColor: '#e74c3c', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <span style={{ color: '#e74c3c', backgroundColor: '#fadbd8', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>


        </div>

    );
};

export default SellerDashboard;