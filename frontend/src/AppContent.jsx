import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
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
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSellers from "./pages/admin/AdminSellers";
import SellerDetails from "./pages/admin/SellerDetails";
import RiderDashboard from "./pages/RiderDashboard";
import OrderDetails from "./pages/OrderDetails";
import AdminSignupTest from "./pages/AdminSignupTest";
import ProductDetails from "./pages/ProductDetails";
import AdDetailPage from "./pages/AdDetailPage";
import AdminAdvertisements from "./pages/admin/AdminAdvertisements";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminProfile from "./pages/admin/AdminProfile";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AffiliatePage from "./pages/AffiliatePage";
import OffersPage from "./pages/OffersPage";
import RequireRole from "./components/RequireRole";

export default function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("chaldal_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [userAddress, setUserAddress] = useState("Dhaka");

  const [wishlistIds, setWishlistIds] = useState(() => {
    const raw = localStorage.getItem("chaldal_wishlist_ids");
    return raw ? JSON.parse(raw) : [];
  });

  // Reverse geocode a lat/lng to a full address string using Nominatim
  const fetchAddressName = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'ChaalDaalApp/1.0' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

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
    
  }, [navigate]);

  const {
    isLoading, selectedCategory, inputValue, setInputValue,
    showSuggestions, setShowSuggestions, suggestions, setSearchTerm,
    quickCategories, inStockOnly, setInStockOnly, priceCap, setPriceCap,
    maxProductPrice, sortBy, setSortBy, displayedProducts,
    handleInputChange, handleSearchKey, handleSearchKeyBtn, handleSelectCategory
  } = useProducts();

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

    if (user && (user.role === 'admin' || user.role === 'seller' || user.role === 'rider')) {
      alert("You must be a standard customer to place an order.");
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
      address_id: finalAddressId,
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
        // Mark coupon as used if one was applied
        const appliedCouponData = (() => { try { return JSON.parse(localStorage.getItem('chaldal_coupon_data')); } catch { return null; } })();
        if (appliedCouponData?.code && token) {
          fetch('http://localhost:3000/api/coupons/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code: appliedCouponData.code })
          }).catch(() => {}); // Fire and forget, non-blocking
          localStorage.removeItem('chaldal_coupon_data');
        }
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

  const handleUpdateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem("chaldal_user", JSON.stringify(updatedUser));
  };

  return (
    <div className="app-container">
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

      <LocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={async (loc) => {
          setUserAddress("Locating...");
          const address = await fetchAddressName(loc.lat, loc.lng);
          setUserAddress(address);
        }}
      />

      <Routes>

        <Route path="/login" element={<Login onLogin={handleLogin} />} />


        <Route path="/signup" element={<Signup onLogin={handleLogin} defaultAddress={userAddress} />} />
        <Route path="/_admin-signup-test" element={<AdminSignupTest />} />
        <Route path="/product/:id"
          element={
            <ProductDetails
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateQty}
              user={user}
            />
          }
        />
        <Route path="/ad/:id" element={<AdDetailPage />} />
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
              setIsCartOpen={setIsCartOpen}
              isCartOpen={isCartOpen}
            />
          }
        />


        <Route
          path="/checkout"
          element={
            <RequireRole user={user} allowedRoles={['user']}>
              <Checkout
                user={user}
                cart={cart}
                placeOrder={handlePlaceOrder}
                shippingAddress={userAddress}
                checkoutMeta={checkoutMeta}
                isPlacingOrder={isPlacingOrder}
              />
            </RequireRole>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireRole user={user} allowedRoles={['user']}>
              <UserProfile
                user={user}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
              />
            </RequireRole>
          }
        />

        <Route
          path="/order/:id"
          element={
            <RequireRole user={user} allowedRoles={['user']}>
              <OrderDetails user={user} />
            </RequireRole>
          }
        />

        {/* Seller routes */}
        <Route path="/seller-login" element={<SellerLogin onLogin={handleLogin} />} />
        <Route
          path="/seller-dashboard"
          element={
            <RequireRole user={user} allowedRoles={['seller']}>
              <SellerDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
            </RequireRole>
          }
        />

        {/* Rider routes */}
        <Route
          path="/rider-dashboard"
          element={
            <RequireRole user={user} allowedRoles={['rider']}>
              <RiderDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
            </RequireRole>
          }
        />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={
            <RequireRole user={user} allowedRoles={['admin']}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="messaging" element={<AdminMessaging />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="sellers/:id" element={<SellerDetails />} />
          <Route path="ads" element={<AdminAdvertisements />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="profile" element={<AdminProfile user={user} onUpdateUser={handleUpdateUser} />} />
        </Route>

        {/* STATIC FOOTER PAGES */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
        <Route path="/offers" element={<OffersPage user={user} />} />
        {/* FAQ redirects to homepage — handled by Footer link */}
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
