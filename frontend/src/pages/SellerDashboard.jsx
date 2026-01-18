import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Using for form styles
import { FaBox, FaChartLine, FaDollarSign, FaStar, FaPlus, FaSignOutAlt } from 'react-icons/fa';

const SellerDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // overview, add-product, my-products
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ total_products: 0, total_sales: 0, total_profit: 0, rating: 0 });
    
    // Add Product Form State
    const [formData, setFormData] = useState({
        name: '', price: '', original_price: '', stock_quantity: 10,
        unit: '1 pcs', category_id: '1', image_url: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/seller-login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            // Fetch Products
            const prodRes = await fetch(`http://localhost:3000/api/seller/products/${user.user_id}`);
            const prodData = await prodRes.json();
            setProducts(prodData);

            // Fetch Stats
            const statsRes = await fetch(`http://localhost:3000/api/seller/stats/${user.user_id}`);
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, seller_id: user.user_id })
            });

            if (response.ok) {
                alert("Product Added Successfully!");
                setFormData({ ...formData, name: '', price: '', image_url: '' }); // Reset partial form
                fetchData(); // Refresh data
                setActiveTab('my-products'); // Switch view
            }
        } catch (error) {
            alert("Failed to add product");
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- STYLES FOR DASHBOARD (Inline for simplicity) ---
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
                    <h2>👋 Welcome, {user?.full_name}</h2>
                    <p style={{color: '#666'}}>Seller Dashboard Overview</p>
                </div>
                <button onClick={onLogout} style={{...styles.navItem(true), background: '#e74c3c'}}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{...styles.iconBox, background: '#3498db'}}><FaBox /></div>
                    <div><h3>{stats.total_products}</h3><p>Total Products</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.iconBox, background: '#2ecc71'}}><FaDollarSign /></div>
                    <div><h3>৳ {stats.total_profit}</h3><p>Total Profit</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.iconBox, background: '#9b59b6'}}><FaChartLine /></div>
                    <div><h3>{stats.total_sales}</h3><p>Items Sold</p></div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.iconBox, background: '#f1c40f'}}><FaStar /></div>
                    <div><h3>{stats.rating}/5</h3><p>Seller Rating</p></div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.nav}>
                <div style={styles.navItem(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</div>
                <div style={styles.navItem(activeTab === 'my-products')} onClick={() => setActiveTab('my-products')}>My Products</div>
                <div style={styles.navItem(activeTab === 'add-product')} onClick={() => setActiveTab('add-product')}>+ Add New Product</div>
            </div>

            {/* Content Area */}
            <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)'}}>
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                        <h3>📈 Performance Charts</h3>
                        <p>Detailed sales graphs will appear here soon.</p>
                        <p>For now, use the tabs to manage your inventory!</p>
                    </div>
                )}

                {/* 2. ADD PRODUCT TAB */}
                {activeTab === 'add-product' && (
                    <div style={{maxWidth: '600px'}}>
                        <h3>Add New Product</h3>
                        <form onSubmit={handleAddProduct} className="auth-form">
                            <div className="form-group"><label>Name</label><input name="name" onChange={handleChange} required /></div>
                            <div className="form-group"><label>Price</label><input type="number" name="price" onChange={handleChange} required /></div>
                            <div className="form-group"><label>Stock</label><input type="number" name="stock_quantity" onChange={handleChange} required /></div>
                            <div className="form-group"><label>Category</label>
                                <select name="category_id" onChange={handleChange} className="auth-input">
                                    <option value="1">Grocery</option><option value="2">Beverage</option><option value="3">Pharmacy</option><option value="4">Cooking</option><option value="5">Food</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Image URL</label><input name="image_url" onChange={handleChange} required /></div>
                            <button type="submit" className="login-submit-btn" style={{background: '#2d3436'}}>Publish Product</button>
                        </form>
                    </div>
                )}

                {/* 3. MY PRODUCTS TAB */}
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
                                        <td style={styles.td}><img src={p.image_url} alt="" style={{width: '40px', borderRadius:'4px'}}/></td>
                                        <td style={styles.td}>{p.name}</td>
                                        <td style={styles.td}>৳ {p.price}</td>
                                        <td style={styles.td}>{p.stock_quantity}</td>
                                        <td style={styles.td}><button style={{color: 'red', border:'none', background:'none', cursor:'pointer'}}>Delete</button></td>
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