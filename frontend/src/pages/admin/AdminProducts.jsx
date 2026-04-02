import React, { useEffect, useState } from "react";
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

  if (loading) return <div>Loading Products...</div>;

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
                    <button
                      className="danger-btn"
                      disabled={!p.is_active}
                      onClick={() => deactivateProduct(p.product_id)}
                    >
                      {p.is_active ? "Deactivate" : "Disabled"}
                    </button>
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
