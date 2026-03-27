import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function AdminSignupTest() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/admin/signup-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Signup-Secret": secret,
        },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Admin signup failed");
        return;
      }

      alert("Admin created. Now login from /login.");
      navigate("/login");
    } catch (err) {
      setError("Server connection failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Signup (Test)</h2>
        <p className="auth-subtitle">Hidden test page. Requires secret header.</p>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Signup Secret</label>
            <input value={secret} onChange={(e) => setSecret(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-btn">
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
}

