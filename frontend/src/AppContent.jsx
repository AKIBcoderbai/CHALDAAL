import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Grocery");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceCap, setPriceCap] = useState(0);

  // --- Location State ---
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userAddress, setUserAddress] = useState("Dhaka");

  // --- Real Data State ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(() => {
    const raw = localStorage.getItem("chaldal_wishlist_ids");
    return raw ? JSON.parse(raw) : [];
  });
  const [checkoutMeta, setCheckoutMeta] = useState({
    couponCode: "",
    discount: 0,
    deliveryCharge: 60,
    tax: 0,
    subtotal: 0,
    total: 0,
  });

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
    // NEW: Update the address in the header/checkout immediately on login
    if (userData.address) {
      setUserAddress(userData.address);
    }
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
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => Number(p.price) || 0), 0),
    [products],
  );

  useEffect(() => {
    if (maxProductPrice > 0 && priceCap === 0) {
      setPriceCap(maxProductPrice);
    }
  }, [maxProductPrice, priceCap]);

  const suggestions = useMemo(() => {
    const keyword = inputValue.trim().toLowerCase();
    if (!keyword) return [];
    return products
      .filter((p) => p.name?.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [inputValue, products]);

  const quickCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).slice(0, 7)];
  }, [products]);

  const displayedProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let list = products.filter((p) => {
      const byQuery = query.length > 0
        ? p.name?.toLowerCase().includes(query)
        : selectedCategory === "All" || p.category === selectedCategory;

      const byStock = inStockOnly ? Number(p.stock) > 0 : true;
      const byPrice = priceCap > 0 ? Number(p.price) <= priceCap : true;
      return byQuery && byStock && byPrice;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, searchTerm, selectedCategory, inStockOnly, priceCap, sortBy]);

  const handleInputChange = (e) => setInputValue(e.target.value);
  const handleSearchKeyBtn = () => {
    setSearchTerm(inputValue);
    setShowSuggestions(false);
  };
  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue);
      setShowSuggestions(false);
    }
  };
  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchTerm("");
    setInputValue("");
    setShowSuggestions(false);
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

  const toggleWishlist = (productId) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("chaldal_wishlist_ids", JSON.stringify(next));
      return next;
    });
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
    if (!user) {
      alert("Please log in to place an order.");
      navigate("/login");
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalWithDelivery = subtotal + 60; 

  
    const originalDbAddress = user.address || "";
    const isNewAddress = (customerData.address !== originalDbAddress) || (customerData.label !== 'Home');
    
    // If it's a new address or a new label, send null so the backend creates it!
    const finalAddressId = isNewAddress ? null : (user.address_id || null);

    const orderPayload = {
      customer: customerData,
      items: cart,
      total: totalWithDelivery,
      userId: user.id, 
      address_id: finalAddressId 
    };

    try {
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
     {/* HEADER: Hide on specific routes instead of user role */}
      {location.pathname !== "/seller-dashboard" && location.pathname !== "/seller-login" && (
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
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            />
            <button onClick={handleSearchKeyBtn} className="search-btn-inside">
              <FaSearch />
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setInputValue(item.name);
                      setSearchTerm(item.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                    <span className="suggestion-price">৳ {item.price}</span>
                  </button>
                ))}
              </div>
            )}
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

           {user && user.role !== 'seller' ? (
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
        
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} defaultAddress={userAddress} />} />

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
              <main className="main-content">
                <BannerCarousel />
                <section className="discovery-toolbar">
                  <div className="discover-left">
                    <span className="discover-label">Quick Filters</span>
                    {quickCategories.map((category) => (
                      <button
                        key={category}
                        className={`discover-chip ${selectedCategory === category ? "active" : ""}`}
                        onClick={() => handleSelectCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="discover-right">
                    <label className="stock-toggle">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                      />
                      In stock only
                    </label>
                    <label className="price-cap">
                      Max ৳ {Math.round(priceCap || maxProductPrice || 0)}
                      <input
                        type="range"
                        min="0"
                        max={maxProductPrice || 1}
                        value={priceCap || maxProductPrice || 0}
                        onChange={(e) => setPriceCap(Number(e.target.value))}
                      />
                    </label>
                    <select
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                    </select>
                  </div>
                </section>
                <div className="results-summary">
                  Showing <strong>{displayedProducts.length}</strong> products
                </div>

                <div className="product-grid">
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, idx) => (
                      <div key={`skeleton-${idx}`} className="product-skeleton-card" />
                    ))
                  ) : displayedProducts.length > 0 ? (
                    displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        onAddToCart={handleAddToCart}
                        onUpdateQty={handleUpdateQty}
                        wishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={toggleWishlist}
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
              checkoutMeta={checkoutMeta}
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
        onCheckout={(summary) => {
          setCheckoutMeta(summary);
          setIsCartOpen(false);
          navigate("/checkout");
        }}
      />
    </div>
  );
}
