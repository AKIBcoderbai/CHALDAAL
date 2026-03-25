import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import CartSidebar from "./components/CartSidebar";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellerLogin from "./pages/SellerLogin";
import SellerDashboard from "./pages/SellerDashboard";
import LocationPicker from "./components/LocationPicker";
import Header from "./components/Header";
import Home from "./pages/Home";
import useProducts from "./hooks/useProducts";
import useCart from "./hooks/useCart";
import UserProfile from "./pages/UserProfile";
import RiderDashboard from "./pages/RiderDashBoard";

export default function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  // --- Location State ---
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userAddress, setUserAddress] = useState("Dhaka");

  // --- Real Data State ---
  
  const [wishlistIds, setWishlistIds] = useState(() => {
    const raw = localStorage.getItem("chaldal_wishlist_ids");
    return raw ? JSON.parse(raw) : [];
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
    if (userData.address) {
      setUserAddress(userData.address);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chaldal_user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('logout_success'));
    navigate("/");
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      alert("Session expired. Please log in again.");
      handleLogout();
    }

    window.addEventListener("session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session_expired", handleSessionExpired);
    };
    handleSessionExpired();
  }, [navigate]);

  // fetching products and handle all product related logic in this custom hook

  const {
    isLoading, selectedCategory, inputValue, setInputValue,
    showSuggestions, setShowSuggestions, suggestions, setSearchTerm,
    quickCategories, inStockOnly, setInStockOnly, priceCap, setPriceCap,
    maxProductPrice, sortBy, setSortBy, displayedProducts,
    handleInputChange, handleSearchKey, handleSearchKeyBtn, handleSelectCategory
  } = useProducts();

  /// Cart logic in this custom hook to keep things organized and separate from product fetching logic
  // this is how standard react developers would do it. Not gpt . It will stack everything in one file and make it a mess. Don't do that.
  //  Always separate concerns and logic into custom hooks or components. It makes your code cleaner and more maintainable.

  const {
    cart, isCartOpen, setIsCartOpen, checkoutMeta, setCheckoutMeta,
    handleAddToCart, handleUpdateQty, clearCart
  } = useCart();

  const toggleWishlist = (productId) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem("chaldal_wishlist_ids", JSON.stringify(next));
      return next;
    });
  };
 
  const handlePlaceOrder = async (customerData) => {
    if (isPlacingOrder) {
      return false;
    }

    if (!user) {
      alert("Please log in to place an order.");
      navigate("/login");
      return false;
    }

    if (cart.length === 0) {
      return false;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalWithDelivery = subtotal + 60;


    const originalDbAddress = user.address || "";
    const isNewAddress = (customerData.address !== originalDbAddress) || (customerData.label !== 'Home');

   
    const finalAddressId = isNewAddress ? null : (user.address_id || null);

    const orderPayload = {
      customer: customerData,
      items: cart,
      total: totalWithDelivery,
      userId: user.id,
      address_id: finalAddressId
    };

    try {
      setIsPlacingOrder(true);

      const token = localStorage.getItem("token");
      if(!token) {
        alert("Authentication token missing. Please log in again.");
        navigate("/login");
        return false;
      }


      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" ,
          "Authorization": `Bearer ${token}`,
          "X-Idempotency-Key": customerData.clientOrderId
          },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        alert("Order Placed Successfully!");
        clearCart();
        navigate("/");
        return true;
      } else {

        if(response.status === 401 || response.status === 403) {
          alert("Authentication failed. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return false;
        }

        if (response.status === 409) {
          alert(responseData.error || "Your order is already being processed. Please wait.");
          return false;
        }

        alert("Failed to place order: " + (responseData.error || "Server Error"));
        return false;
      }
    } catch (error) {
      console.error("Order Error:", error);
      alert("Connection to server failed.");
      return false;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="app-container">
      {/* --- HEADER --- */}

      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleInputChange={handleInputChange}
        handleSearchKey={handleSearchKey}
        handleSearchKeyBtn={handleSearchKeyBtn}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestions={suggestions}
        setSearchTerm={setSearchTerm}
        setIsMapOpen={setIsMapOpen}
        userAddress={userAddress}
        user={user}
        handleLogout={handleLogout}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
      />


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
            <Home
              selectedCategory={selectedCategory}
              handleSelectCategory={handleSelectCategory}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              quickCategories={quickCategories}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceCap={priceCap}
              setPriceCap={setPriceCap}
              maxProductPrice={maxProductPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              displayedProducts={displayedProducts}
              isLoading={isLoading}
              cart={cart}
              handleAddToCart={handleAddToCart}
              handleUpdateQty={handleUpdateQty}
              wishlistIds={wishlistIds}
              toggleWishlist={toggleWishlist}
              user={user}
              handleLogout={handleLogout}
            />
          }
        />


        <Route
          path="/checkout"
          element={
            <Checkout
              user={user}
              cart={cart}
              placeOrder={handlePlaceOrder}
              shippingAddress={userAddress}
              checkoutMeta={checkoutMeta}
              isPlacingOrder={isPlacingOrder}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <UserProfile
              user={user}
              onLogout={handleLogout}
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

        <Route
          path="/rider-dashboard"
          element={<RiderDashboard user={user} onLogout={handleLogout} />}
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
