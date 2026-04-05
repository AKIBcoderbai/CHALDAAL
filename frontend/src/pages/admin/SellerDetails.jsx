import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoneyBillWave, FaBox, FaStar, FaStore, FaEnvelope } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./SellerDetails.css";

const API_BASE = "http://localhost:3000";

export default function SellerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sellerInfo, setSellerInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);


  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const [statsRes, sellersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sellers/${id}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/sellers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/products`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());

      if (sellersRes.ok) {
        const allSellers = await sellersRes.json();
        const me = allSellers.find(s => String(s.seller_id) === String(id));
        setSellerInfo(me || { company_name: "Unknown Seller", email: "N/A" });
      }

      if (productsRes.ok) {
        const allProducts = await productsRes.json();
        setProducts(allProducts.filter(p => String(p.seller_id) === String(id)));
      }

    } catch (err) {
      console.error("Seller details fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setIsSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/seller-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          seller_id: Number(id),
          product_id: selectedProduct ? Number(selectedProduct) : null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to send message.");
        return;
      }

      setSubject("");
      setMessage("");
      setSelectedProduct("");
      alert("Message sent successfully.");
    } catch (err) {
      console.error("Contact submit failed:", err);
      alert("Server connection failed.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Seller Details..." />;
  if (!sellerInfo) return <LoadingSpinner message="Seller not found..." />;

  return (
    <div className="seller-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Sellers
      </button>

      <div className="seller-header-banner">
        <div className="seller-profile-icon"><FaStore /></div>
        <div className="seller-profile-info">
          <h2>{sellerInfo.company_name}</h2>
          <p>{sellerInfo.name} • {sellerInfo.email} • {sellerInfo.phone}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p>৳{stats?.total_profit?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon"><FaBox /></div>
          <div className="stat-info">
            <h3>Items Sold</h3>
            <p>{stats?.total_sales?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-info">
            <h3>Avg Rating</h3>
            <p>{stats?.rating || "0.0"}</p>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="admin-card">
          <h3>Products Catalog</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map(p => (
                    <tr key={p.product_id}>
                      <td><img src={p.image_url} alt={p.name} className="mini-product-img" /></td>
                      <td>{p.name}</td>
                      <td>৳{p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={p.is_active ? "badge-active" : "badge-inactive"}>
                          {p.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="muted text-center">No products listed.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card sticky-card">
          <h3><FaEnvelope /> Direct Message</h3>
          <p className="muted" style={{fontSize: '13px', marginBottom: '15px'}}>
            Send a warning, notice, or compliance alert to <strong>{sellerInfo.company_name}</strong>.
          </p>

          <form onSubmit={handleSendMessage} className="admin-form">
            <div className="form-group">
              <label>Related Product (Optional)</label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
              >
                <option value="">-- General Notice --</option>
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Immediate action required"
              />
            </div>

            <div className="form-group">
              <label>Message Body</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Details of the violation or notice..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={isSending}>
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
