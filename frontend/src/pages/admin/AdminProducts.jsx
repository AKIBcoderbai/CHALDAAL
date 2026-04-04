import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./AdminProducts.css";

const API_BASE = "http://localhost:3000";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error("Products fetch failed:", err);
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
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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

  const reactivateProduct = async (productId) => {
    const confirmed = window.confirm(
      "Reactivate this product? It will become visible on the storefront again."
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/products/${productId}/reactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to reactivate product.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, is_active: true } : p))
      );
      alert("Product reactivated successfully.");
    } catch (err) {
      console.error("Admin reactivation failed:", err);
      alert("Server connection failed.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading Products..." />;

  return (
    <div className="admin-products">
      <div className="admin-card">
        <h3>Moderation List</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Thumbnail</th>
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
                  <td>
                    <img src={p.image_url} alt={p.name} className="product-table-img" />
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.seller_name}</td>
                  <td>৳ {p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={p.is_active ? "badge-active" : "badge-inactive"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {p.is_active ? (
                      <button
                        className="danger-btn"
                        onClick={() => deactivateProduct(p.product_id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="danger-btn"
                        style={{ background: '#27ae60', borderColor: '#27ae60' }}
                        onClick={() => reactivateProduct(p.product_id)}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
