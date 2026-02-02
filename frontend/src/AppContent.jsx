import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CategorySidebar from "./components/CategorySidebar";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellerLogin from "./pages/SellerLogin"; 
import SellerDashboard from "./pages/SellerDashboard"; 
import ThemeToggle from "./components/ThemeToggle";
import {
  FaBars,
  FaSearch,
  FaMapMarkerAlt,
  FaUser,
  FaShoppingBag,
} from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import BannerCarousel from "./components/BannerCarousel";
import LocationPicker from "./components/LocationPicker";

export default function AppContent() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Grocery");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Location State ---
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userAddress, setUserAddress] = useState("Dhaka");

  // --- Real Data State ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Helper to get Real Address Name ---
  const fetchAddressName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  // --- 1. PERSIST LOGIN & LOGOUT LOGIC ---
  useEffect(() => {
    const savedUser = localStorage.getItem("chaldal_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("chaldal_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chaldal_user");
    navigate("/");
  };

  // --- Fetch Products logic ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3000/api/products");
        const data = await response.json();

        const mappedData = data.map((item) => ({
          id: item.id || item.product_id,
          name: item.name,
          price: item.price,
          originalPrice: item.price,
          image: item.image,
          category: item.category,
          unit: item.unit,
          stock: item.stock,
        }));
        
        setProducts(mappedData);
      } catch (error) {``
        console.error("Error connecting to backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayedProducts = products.filter((p) => {
    if (searchTerm.length > 0) {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return p.category === selectedCategory;
  });

  const handleInputChange = (e) => setInputValue(e.target.value);
  const handleSearchKeyBtn = () => setSearchTerm(inputValue);
  const handleSearchKey = (e) => {
    if (e.key === "Enter") setSearchTerm(inputValue);
  };
  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchTerm("");
    setInputValue("");
  };
  const handleAddToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    //console.log(item.id)
    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...exists, qty: exists.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setIsCartOpen(true);
  };
  const handleUpdateQty = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + amount } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };
const handlePlaceOrder = async (customerData) => {
  // 1. Validate user is logged in
  if (!user) {
    alert("Please log in to place an order.");
    navigate("/login");
    return;
  }

  // 2. Calculate the total locally (including delivery fee if applicable)
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalWithDelivery = subtotal + 60; 

  // 3. Construct the payload
  const orderPayload = {
    customer: customerData,
    items: cart,
    total: totalWithDelivery,
    userId: user.id // From your login state
  };

  try {
    // 4. Send the request to the backend
    const response = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (response.ok) {
      alert("Order Placed Successfully!");
      setCart([]); 
      navigate("/");
    } else {
      const errorData = await response.json();
      alert("Failed to place order: " + (errorData.error || "Server Error"));
    }
  } catch (error) {
    console.error("Order Error:", error);
    alert("Connection to server failed.");
  }
};

  return (
    <div className="app-container">
      {/* HEADER: Only show if NOT in Seller Dashboard */}
      {(!user || user.role !== "seller") && (
        <header className="header">
          <div className="logo-section" style={{ cursor: "pointer" }}>
            <FaBars
              className="menu-icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <span
              className="brand-logo"
              onClick={() => navigate("/")}
              style={{ marginLeft: "10px" }}
            >
              Chaldal
            </span>
          </div>

          <div className="search-container">
            <FaSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-input"
              value={inputValue}
              placeholder="Search for products (e.g. eggs, milk)"
              onChange={handleInputChange}
              onKeyDown={handleSearchKey}
            />
            <button onClick={handleSearchKeyBtn} className="search-btn-inside">
              <FaSearch />
            </button>
          </div>

          <div className="header-actions">
            <ThemeToggle />
            <div
              className="location-selector"
              onClick={() => setIsMapOpen(true)}
            >
              <FaMapMarkerAlt style={{ color: "#ff6b6b", flexShrink: 0 }} />
              <span className="address-text">{userAddress}</span>
              <MdKeyboardArrowDown style={{ flexShrink: 0 }} />
              <div className="custom-tooltip">{userAddress}</div>
            </div>

            {user ? (
              <div
                className="user-profile"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                <FaUser /> <span>{user.full_name || user.name}</span>
              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate("/login")}>
                Login
              </button>
            )}

            <div className="cart-badge-btn" onClick={() => setIsCartOpen(true)}>
              <FaShoppingBag style={{ color: "#d63031" }} />
              <span>{cart.reduce((acc, item) => acc + item.qty, 0)} Items</span>
            </div>
          </div>
        </header>
      )}

      {/* --- LOCATION PICKER MODAL --- */}
      <LocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={async (loc) => {
          setUserAddress("Locating...");
          const addressName = await fetchAddressName(loc.lat, loc.lng);
          setUserAddress(addressName);
        }}
      />

      <Routes>
        {/* CUSTOMER ROUTES */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />

        {/* HOME ROUTE */}
        <Route
          path="/"
          element={
            <div className="main-layout" style={{ display: "flex" }}>
              <CategorySidebar
                activeCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
              />
              <main
                style={{
                  flex: 1,
                  background: "#f6f6f6",
                  display: "flex",
                  flexDirection: "column",
                  overflowX: "hidden",
                }}
              >
                <BannerCarousel />

                <div className="product-grid">
                  {displayedProducts.length > 0 ? (
                    displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onAddToCart={handleAddToCart}
                        onUpdateQty={handleUpdateQty}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        color: "#666",
                        gridColumn: "1 / -1",
                      }}
                    >
                      <h3>No products found in {selectedCategory}</h3>
                      <p>
                        Check the database if you added products for this
                        category!
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER: Only for Customers (Links to Seller Login) */}
                <footer
                  style={{
                    marginTop: "50px",
                    padding: "40px",
                    backgroundColor: "#2d3436",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <h3>Partner with Chaldal</h3>
                  <p>Sell your products to millions of customers.</p>
                  <button
                    onClick={() => {
                      if (user) handleLogout(); // Force logout if a customer wants to log in as seller
                      navigate("/seller-login");
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "10px 20px",
                      background: "#ff9f43",
                      border: "none",
                      borderRadius: "5px",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Seller Login
                  </button>
                </footer>
              </main>
            </div>
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              placeOrder={handlePlaceOrder}
              shippingAddress={userAddress}
            />
          }
        />

        {/* SELLER ROUTES */}
        <Route
          path="/seller-login"
          element={<SellerLogin onLogin={handleLogin} />}
        />
        <Route
          path="/seller-dashboard"
          element={<SellerDashboard user={user} onLogout={handleLogout} />}
        />
      </Routes>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateQty}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate("/checkout");
        }}
      />
    </div>
  );
}
