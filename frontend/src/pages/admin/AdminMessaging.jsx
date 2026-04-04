import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./AdminMessaging.css";

const API_BASE = "http://localhost:3000";

export default function AdminMessaging() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Searchable combo box state
  const [sellerSearch, setSellerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchMessagingData();
  }, []);

  const fetchMessagingData = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const [productsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/seller-contact`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.error("Messaging data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueSellers = useMemo(() => {
    const sellerMap = new Map();
    products.forEach((p) => {
      if (!sellerMap.has(p.seller_id)) {
        sellerMap.set(p.seller_id, {
          seller_id: p.seller_id,
          seller_name: p.seller_name,
          seller_email: p.seller_email,
        });
      }
    });
    return Array.from(sellerMap.values());
  }, [products]);

  const filteredSellerProducts = useMemo(() => {
    if (!selectedSellerId) return [];
    return products.filter((p) => String(p.seller_id) === String(selectedSellerId));
  }, [products, selectedSellerId]);

  const filteredComboSellers = useMemo(() => {
    if (!sellerSearch.trim()) return uniqueSellers;
    const q = sellerSearch.toLowerCase();
    return uniqueSellers.filter(s => 
      s.seller_name.toLowerCase().includes(q) || 
      (s.seller_email && s.seller_email.toLowerCase().includes(q))
    );
  }, [uniqueSellers, sellerSearch]);

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          seller_id: Number(selectedSellerId),
          product_id: selectedProductId ? Number(selectedProductId) : null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to send contact note.");
        return;
      }

      setSubject("");
      setMessage("");
      setSelectedProductId("");
      alert("Seller contact note saved.");
      fetchMessagingData();
    } catch (err) {
      console.error("Contact submit failed:", err);
      alert("Server connection failed.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Messaging Center..." />;

  return (
    <div className="admin-messaging">
      <div className="messaging-grid">
        <section className="admin-card">
          <h3>Compose Message</h3>
          <form onSubmit={submitContact} className="admin-form">
            <div className="form-group custom-combo">
              <label>Select Seller</label>
              <div className="combo-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Type to search seller by name or email..."
                  value={sellerSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSellerSearch(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                />
                {isDropdownOpen && (
                  <div className="combo-dropdown">
                    {filteredComboSellers.length > 0 ? (
                      filteredComboSellers.map((seller) => (
                        <div 
                          key={seller.seller_id} 
                          className="combo-option"
                          onClick={() => {
                            setSelectedSellerId(seller.seller_id);
                            setSellerSearch(`${seller.seller_name} (${seller.seller_email})`);
                            setSelectedProductId("");
                            setIsDropdownOpen(false);
                          }}
                        >
                          {seller.seller_name} <span className="combo-muted">({seller.seller_email})</span>
                        </div>
                      ))
                    ) : (
                      <div className="combo-option muted">No sellers found.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Related Product (Optional)</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Not product-specific</option>
                {filteredSellerProducts.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    [{p.product_id}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Fraud alert / delivery issue / compliance notice"
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write details for seller follow-up..."
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSending}>
              {isSending ? "Sending..." : "Log Contact Note"}
            </button>
          </form>
        </section>

        <section className="admin-card">
          <h3>Communication History</h3>
          <div className="admin-log-list">
            {logs.length === 0 ? (
              <p className="muted">No contact logs yet.</p>
            ) : (
              logs.slice(0, 8).map((log) => (
                <div key={log.message_id} className="admin-log-item">
                  <div className="log-header">
                    <strong>{log.subject}</strong>
                    <span className="log-date">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="log-seller-badge">{log.seller_name}</div>
                  <p className="log-body">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
