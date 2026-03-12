import { useNavigate } from "react-router-dom";

function Footer({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <footer style={{ marginTop: "50px", padding: "40px", backgroundColor: "#2d3436", color: "white", textAlign: "center" }}>
      <h3>Partner with Chaldal</h3>
      <p>Sell your products to millions of customers.</p>
      <button
        onClick={() => {
          if (user) handleLogout();
          navigate("/seller-login");
        }}
        style={{ marginTop: "10px", padding: "10px 20px", background: "#ff9f43", border: "none", borderRadius: "5px", color: "white", fontWeight: "bold", cursor: "pointer" }}
      >
        Seller Login
      </button>
    </footer>
  );
}

export default Footer;