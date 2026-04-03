import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaChartBar, FaEnvelope, FaBoxOpen, FaSignOutAlt, FaUsers, FaBullhorn, FaUndo } from "react-icons/fa";
import "./AdminLayout.css";

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user || user.role !== 'admin') {
      // If we don't know the role or it's not admin
      setForbidden(true);
    } else {
      setForbidden(false);
    }
  }, [user]);

  if (forbidden) {
    return (
      <div className="admin-layout forbidden-view">
        <div className="forbidden-card">
          <h2>Access Denied</h2>
          <p>You must be logged in as an administrator to view this panel.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <p>Logged in as {user?.name}</p>
        </div>
        <nav className="admin-nav">
          <Link 
            to="/admin/analytics" 
            className={(location.pathname === "/admin/analytics" || location.pathname === "/admin") ? "active": ""}
          >
           <FaChartBar /> Analytics
          </Link>
          <Link 
            to="/admin/messaging" 
            className={location.pathname === "/admin/messaging" ? "active": ""}
          >
           <FaEnvelope /> Contact Sellers
          </Link>
          <Link 
            to="/admin/products" 
            className={location.pathname === "/admin/products" ? "active": ""}
          >
           <FaBoxOpen /> Manage Products
          </Link>
          <Link 
            to="/admin/sellers" 
            className={(location.pathname === "/admin/sellers" || location.pathname.includes("/admin/sellers/")) ? "active": ""}
          >
           <FaUsers /> Sellers
          </Link>
          <Link 
            to="/admin/ads" 
            className={location.pathname === "/admin/ads" ? "active": ""}
          >
           <FaBullhorn /> Advertisements
          </Link>
          <Link 
            to="/admin/returns" 
            className={location.pathname === "/admin/returns" ? "active": ""}
          >
           <FaUndo /> Returns
          </Link>

          <button className="admin-nav-logout" onClick={onLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
      
      <main className="admin-main">
        <header className="admin-topbar">
          <h3>
            {location.pathname.includes("analytics") ? "Platform Analytics" : 
             location.pathname.includes("messaging") ? "Seller Communications" :
             location.pathname.includes("sellers") ? "Seller Management" :
             location.pathname.includes("products") ? "Product Moderation" :
             location.pathname.includes("ads") ? "Advertisement Moderation" :
             location.pathname.includes("returns") ? "Return Requests" : "Admin Dashboard"}
          </h3>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
