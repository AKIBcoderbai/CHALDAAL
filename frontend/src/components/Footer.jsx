import { useNavigate } from "react-router-dom";

function Footer({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <footer style={{ marginTop: "50px", padding: "40px", backgroundColor: "#2d3436", color: "white", textAlign: "center" }}>
      <h3>Partner with Chaldal</h3>
      <p>Sell your products to millions of customers.</p>
      <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => navigate("/admin-dashboard")}
          style={{ padding: "10px 20px", background: "#636e72", border: "none", borderRadius: "5px", color: "white", fontWeight: "bold", cursor: "pointer" }}
        >
          Admin panel
        </button>
        <button
          type="button"
          onClick={() => {
            if (user) handleLogout();
            navigate("/seller-login");
          }}
          style={{ padding: "10px 20px", background: "#ff9f43", border: "none", borderRadius: "5px", color: "white", fontWeight: "bold", cursor: "pointer" }}
        >
          Seller Login
        </button>
      </div>
    </footer>
  );
}

export default Footer;