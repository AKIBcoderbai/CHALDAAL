import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./AdminSellers.css";

const API_BASE = "http://localhost:3000";

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSellers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = useMemo(() => {
    if (!search.trim()) return sellers;
    const lowerSearch = search.toLowerCase();
    return sellers.filter(s => 
      (s.name && s.name.toLowerCase().includes(lowerSearch)) || 
      (s.company_name && s.company_name.toLowerCase().includes(lowerSearch)) || 
      (s.email && s.email.toLowerCase().includes(lowerSearch)) ||
      (s.phone && s.phone.includes(lowerSearch))
    );
  }, [sellers, search]);

  if (loading) return <LoadingSpinner message="Loading Sellers..." />;

  return (
    <div className="admin-sellers-page">
      <div className="admin-card">
        <div className="sellers-header">
          <h3>Registered Sellers</h3>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, company, email or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table sellers-table">
            <thead>
              <tr>
                <th>Seller ID</th>
                <th>Company Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Products Sold</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.length > 0 ? (
                filteredSellers.map(s => (
                  <tr key={s.seller_id} onClick={() => navigate(`/admin/sellers/${s.seller_id}`)} className="clickable-row">
                    <td><strong>#{s.seller_id}</strong></td>
                    <td>{s.company_name}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      <span className="sold-badge">
                        {s.total_products_sold} Unit{s.total_products_sold !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/sellers/${s.seller_id}`);
                      }}>
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center muted">No sellers matched your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
