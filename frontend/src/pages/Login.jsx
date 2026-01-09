import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // We will use one CSS file for both Login/Signup

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API Login
    if (email && password) {
      const mockUser = { name: "Sami", email: email };
      onLogin(mockUser); // Update App state
      navigate('/'); // Go back home
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back to Chaldal Clone</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Phone</label>
            <input 
              type="text" 
              placeholder="Enter your number or email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="switch-auth">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;