import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = ({ onLogin, defaultAddress }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role:'user'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      
      const payload = { 
        ...formData, 
        address: defaultAddress !== "Locating..." ? defaultAddress : "Dhaka" 
      };

      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account Created Successfully!");
        localStorage.setItem("token", data.token);
        onLogin({ 
            name: data.user.full_name, 
            email: data.user.email, 
            id: data.user.user_id,
            role: data.user.role,
            address: data.user.address,       
            address_id: data.user.address_id
        });
        if (data.user.role === 'seller') {
            navigate('/seller-dashboard');
        } else if (data.user.role === 'rider') {
            navigate('/rider-dashboard');
        } else if (data.user.role === 'admin') {
            navigate('/admin-dashboard'); 
        } else {
            navigate('/');
        }
      } else {
        setError(data.error || "Signup Failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <p className="auth-subtitle">Create your Chaldal account</p>
        
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" required placeholder="Ex: Sami" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required placeholder="user@example.com" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" placeholder="017..." onChange={handleChange} />
          </div>

          <div className="form-group">
          <label>Account Type</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }}
          >
            <option value="user">Customer (Buy Groceries)</option>
            <option value="seller">Seller (Manage a Store)</option>
            <option value="rider">Rider (Deliver Orders)</option>
          </select>
        </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required placeholder="******" onChange={handleChange} />
          </div>

          <button type="submit" className="auth-btn">Create Account</button>
        </form>

        <p className="switch-auth">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;