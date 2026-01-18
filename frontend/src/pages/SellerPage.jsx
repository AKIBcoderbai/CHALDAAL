import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Re-using your existing nice form styles

const SellerPage = ({ user }) => {
    const navigate = useNavigate();
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        original_price: '',
        stock_quantity: 10,
        unit: '1 pcs',
        category_id: '1', // Default to Grocery
        image_url: ''
    });

    useEffect(() => {
        // If user is not logged in, send them to login
        if (!user) {
            alert("You must login to become a seller!");
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!user) return;

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    seller_id: user.user_id // Determine who is selling
                })
            });

            if (response.ok) {
                alert("Product Listed Successfully! It is now live.");
                navigate('/'); // Go back home to see it
                window.location.reload(); // Reload to fetch new data
            } else {
                alert("Failed to list product.");
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box" style={{maxWidth: '600px'}}> 
                <h2>🛍️ Seller Dashboard</h2>
                <p>List your product on Chaldal</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" name="name" required placeholder="Ex: Homemade Achar" onChange={handleChange} />
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                        <div className="form-group">
                            <label>Selling Price (৳)</label>
                            <input type="number" name="price" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Original MRP (৳)</label>
                            <input type="number" name="original_price" required onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '10px'}}>
                        <div className="form-group">
                            <label>Stock</label>
                            <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            <input type="text" name="unit" placeholder="kg, pcs, ltr" value={formData.unit} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category_id" onChange={handleChange} className="auth-input">
                            <option value="1">Grocery</option>
                            <option value="2">Beverage</option>
                            <option value="3">Pharmacy</option>
                            <option value="4">Cooking</option>
                            <option value="5">Food</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Image URL</label>
                        <input type="text" name="image_url" required placeholder="https://..." onChange={handleChange} />
                        <small style={{color: '#888'}}>* Right click any image on google and 'Copy Image Address'</small>
                    </div>

                    {formData.image_url && (
                        <div style={{textAlign: 'center', margin: '10px 0'}}>
                            <img src={formData.image_url} alt="Preview" style={{height: '100px', borderRadius: '5px'}} />
                        </div>
                    )}

                    <button type="submit" className="login-submit-btn" style={{backgroundColor: '#2ecc71'}}>
                        Publish Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerPage;