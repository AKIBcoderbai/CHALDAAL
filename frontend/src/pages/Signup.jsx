import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = ({ onLogin, defaultAddress }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 2. Merge the address from AppContent into the data sent to the server
      const payload = { 
        ...formData, 
        address: defaultAddress !== "Locating..." ? defaultAddress : "Dhaka" // Fallback just in case
      };

      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account Created Successfully!");
        // 3. Make sure to capture the returned address data
        onLogin({ 
            name: data.user.full_name, 
            email: data.user.email, 
            id: data.user.user_id,
            address: data.user.address,       
            address_id: data.user.address_id
        });
        navigate('/');
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