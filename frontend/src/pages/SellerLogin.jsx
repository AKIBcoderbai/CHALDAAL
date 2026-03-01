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
        const endpoint = isSignup ? '/api/signup' : '/api/login';
        
       
        const payload = isSignup ? { ...formData, fullName: formData.full_name, role: 'seller' } : formData;

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
                
                onLogin({
                    name: data.user.full_name,
                    email: data.user.email,
                    id: data.user.user_id, // Map user_id to id
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
        <div className="auth-container" style={{background: '#2d3436'}}>
            <div className="auth-box">
                <h2 style={{color: '#ff9f43'}}>💼 Seller {isSignup ? 'Registration' : 'Portal'}</h2>
                <p style={{color: '#ddd'}}>Manage your business on Chaldal</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {isSignup && (
                        <>
                            <div className="form-group">
                                <label style={{color: '#fff'}}>Business / Full Name</label>
                                <input type="text" name="full_name" required onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label style={{color: '#fff'}}>Phone</label>
                                <input type="text" name="phone" required onChange={handleChange} />
                            </div>
                        </>
                    )}
                    
                    <div className="form-group">
                        <label style={{color: '#fff'}}>Email Address</label>
                        <input type="email" name="email" required onChange={handleChange} />
                    </div>
                    
                    <div className="form-group">
                        <label style={{color: '#fff'}}>Password</label>
                        <input type="password" name="password" required onChange={handleChange} />
                    </div>

                    <button type="submit" className="auth-btn" style={{background: '#ff9f43', border: 'none'}}>
                        {isSignup ? 'Register Business' : 'Login to Dashboard'}
                    </button>
                </form>

                <p className="switch-auth" style={{color: '#aaa'}}>
                    {isSignup ? "Already a seller?" : "Want to sell with us?"} 
                    <span onClick={() => setIsSignup(!isSignup)} style={{color: '#ff9f43', cursor: 'pointer', marginLeft: '5px'}}>
                        {isSignup ? " Login" : " Apply Now"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SellerLogin;