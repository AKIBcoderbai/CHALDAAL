import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const SellerLogin = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignup ? '/api/seller/signup' : '/api/login';


        const payload = isSignup ? { ...formData, fullName: formData.full_name } : formData;

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const userRole = data.user ? data.user.role : data.role;

                if (userRole !== 'seller') {
                    alert("This account is not a Seller account. Please login as a Customer.");
                    return;
                }
                localStorage.setItem("token", data.token);
                onLogin({
                    name: data.user.full_name,
                    email: data.user.email,
                    id: data.user.user_id,
                    role: data.user.role
                });
                navigate('/seller-dashboard');

            } else {
                alert(data.error || "Authentication failed");
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isSignup ? 'Seller Registration' : 'Seller Portal'}</h2>
                <p className="auth-subtitle">Manage your business on Chaldal</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {isSignup && (
                        <>
                            <div className="form-group">
                                <label>Business / Full Name</label>
                                <input type="text" name="full_name" required onChange={handleChange} placeholder="Enter your business name" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" name="phone" required onChange={handleChange} placeholder="017..." />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} placeholder="seller@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required onChange={handleChange} placeholder="Enter password" />
                    </div>

                    <button type="submit" className="auth-btn">
                        {isSignup ? 'Register Business' : 'Login to Dashboard'}
                    </button>
                </form>

                <p className="switch-auth">
                    {isSignup ? "Already a seller?" : "Want to sell with us?"}
                    <span onClick={() => setIsSignup(!isSignup)} style={{ cursor: 'pointer', marginLeft: '5px', color: '#e91e63', fontWeight: 'bold' }}>
                        {isSignup ? "Login" : "Apply Now"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SellerLogin;