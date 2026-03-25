import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE = "http://localhost:3000";

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  /** Until frontend role routing exists: page is reachable with any login; APIs still require JWT with role admin. */
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("token");
  // Check both token existence AND user role
  if (!token || !user || user.role !== 'admin') {
    navigate("/login", { state: { from: "/admin-dashboard" } });
    return;
  }
  fetchAdminData();
}, [navigate, user]);

  const uniqueSellers = useMemo(() => {
    const sellerMap = new Map();
    products.forEach((p) => {
      if (!sellerMap.has(p.seller_id)) {
        sellerMap.set(p.seller_id, {
          seller_id: p.seller_id,
          seller_name: p.seller_name,
          seller_email: p.seller_email,
          seller_phone: p.seller_phone,
        });
      }
    });
    return Array.from(sellerMap.values());
  }, [products]);

  const filteredSellerProducts = useMemo(() => {
    if (!selectedSellerId) return [];
    return products.filter((p) => String(p.seller_id) === String(selectedSellerId));
  }, [products, selectedSellerId]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/admin-dashboard" } });
        return;
      }
      setLoading(true);
      setForbidden(false);

      const [productsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/seller-contact`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsRes.status === 403 || logsRes.status === 403) {
        setForbidden(true);
        setProducts([]);
        setLogs([]);
        return;
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error("Admin data fetch failed:", err);
      alert("Failed to load admin data from server.");
    } finally {
      setLoading(false);
    }
  };

  const deactivateProduct = async (productId) => {
    const confirmed = window.confirm(
      "Deactivate this product now? It will be hidden from the storefront immediately."
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/products/${productId}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to deactivate product.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, is_active: false } : p))
      );
      alert("Product deactivated successfully.");
    } catch (err) {
      console.error("Admin deactivation failed:", err);
      alert("Server connection failed.");
    }
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!selectedSellerId || !subject.trim() || !message.trim()) {
      alert("Please select seller and fill in subject + message.");
      return;
    }

    try {
      setIsSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/seller-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seller_id: Number(selectedSellerId),
          product_id: selectedProductId ? Number(selectedProductId) : null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to send contact note.");
        return;
      }

      setSubject("");
      setMessage("");
      setSelectedProductId("");
      alert("Seller contact note saved.");
      fetchAdminData();
    } catch (err) {
      console.error("Contact submit failed:", err);
      alert("Server connection failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h2>Admin Control Panel</h2>
          <p>Monitor sellers, contact sellers, and deactivate risky products.</p>
        </div>
        <button className="admin-logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="admin-card admin-temp-banner" role="status">
        <strong>Temporary access:</strong> Open this page anytime via the footer link,{" "}
        <code>/admin-dashboard</code>, or <code>/admin</code>. The app login page does not route by role yet;{" "}
        you still need a JWT issued for an <strong>admin</strong> account (e.g. sign up with role admin or use DB) for these APIs to return data.
        {user?.full_name || user?.name ? (
          <> Signed in as {user.full_name || user.name}.</>
        ) : null}
      </div>

      {forbidden && (
        <div className="admin-card admin-forbidden">
          <strong>Not authorized for admin APIs.</strong> Your current session token is not for an admin account.
          Register/login as admin in the backend, or switch account — frontend role checks are deferred.
        </div>
      )}

      {loading ? (
        <div className="admin-card">Loading admin dashboard...</div>
      ) : (
        <>
          <div className="admin-grid">
            <section className="admin-card">
              <h3>Contact Seller</h3>
              <form onSubmit={submitContact} className="admin-form">
                <label>Seller</label>
                <select
                  value={selectedSellerId}
                  onChange={(e) => {
                    setSelectedSellerId(e.target.value);
                    setSelectedProductId("");
                  }}
                  required
                >
                  <option value="">Select a seller</option>
                  {uniqueSellers.map((seller) => (
                    <option key={seller.seller_id} value={seller.seller_id}>
                      {seller.seller_name} ({seller.seller_email})
                    </option>
                  ))}
                </select>

                <label>Related Product (Optional)</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Not product-specific</option>
                  {filteredSellerProducts.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      #{p.product_id} - {p.name}
                    </option>
                  ))}
                </select>

                <label>Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Fraud alert / delivery issue / compliance notice"
                  required
                />

                <label>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Write details for seller follow-up..."
                  required
                />

                <button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Contact Note"}
                </button>
              </form>
            </section>

            <section className="admin-card">
              <h3>Recent Contact Logs</h3>
              <div className="admin-log-list">
                {logs.length === 0 ? (
                  <p className="muted">No contact logs yet.</p>
                ) : (
                  logs.slice(0, 8).map((log) => (
                    <div key={log.message_id} className="admin-log-item">
                      <strong>{log.subject}</strong>
                      <p>
                        Seller: {log.seller_name} ({log.seller_email})
                      </p>
                      <p>{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="admin-card">
            <h3>Product Moderation</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.product_id}>
                      <td>{p.product_id}</td>
                      <td>{p.name}</td>
                      <td>{p.seller_name}</td>
                      <td>৳ {p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={p.is_active ? "badge-active" : "badge-inactive"}>
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="danger-btn"
                          disabled={!p.is_active}
                          onClick={() => deactivateProduct(p.product_id)}
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
