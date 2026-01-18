import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
// import { products } from "./data/products"; // DELETE THIS LINE
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CategorySidebar from "./components/CategorySidebar";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { FaBars, FaSearch, FaMapMarkerAlt, FaUser, FaShoppingBag } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import BannerCarousel from "./components/BannerCarousel";
import LocationPicker from "./components/LocationPicker"; // <--- IMPORT THIS

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
    const [userAddress, setUserAddress] = useState("Dhaka"); // Default

    // --- NEW: Real Data State ---
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);

    // ... (Keep your useEffect for fetching products exactly as is) ...
    // ... (Keep your filter logic exactly as is) ...
    // ... (Keep your handlers exactly as is) ...

    // --- Fetch Products logic (restored for context) ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:3000/api/products");
                const data = await response.json();
                
                const mappedData = data.map(item => ({
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    originalPrice: item.original_price,
                    image: item.image_url,
                    category: item.category_name,
                    unit: item.unit,
                    stock: item.stock_quantity
                }));

                setProducts(mappedData);
            } catch (error) {
                console.error("Error connecting to backend:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, [])

    const displayedProducts = products.filter(p => {
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
        if (exists) {
            setCart(cart.map((item) => item.id === product.id ? { ...exists, qty: exists.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setIsCartOpen(true);
    };
    const handleUpdateQty = (id, amount) => {
        setCart((prevCart) =>
            prevCart.map((item) => item.id === id ? { ...item, qty: item.qty + amount } : item)
                    .filter((item) => item.qty > 0)
        );
    };
    const handlePlaceOrder = (customerData) => {
        alert("Order Placed Successfully!");
        setCart([]);
        navigate("/");
    };


    return (
        <div className="app-container">
            <header className="header">
                <div className="logo-section" style={{ cursor: "pointer" }}>
                    <FaBars className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)} />
                    <span className="brand-logo" onClick={() => navigate("/")} style={{ marginLeft: "10px" }}>Chaldal</span>
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
                    <button onClick={handleSearchKeyBtn} className="search-btn-inside"><FaSearch /></button>
                </div>

                <div className="header-actions">
                    {/* Location Selector - NOW CLICKABLE */}
                    <div 
                        className="location-selector" 
                        onClick={() => setIsMapOpen(true)} // Open Map
                        style={{cursor: 'pointer'}}
                    >
                        <FaMapMarkerAlt style={{ color: "#ff6b6b" }} /> 
                        <span>{userAddress}</span> 
                        <MdKeyboardArrowDown />
                    </div>

                    {user ? (
                        <div className="user-profile"><FaUser /> <span>{user.name}</span></div>
                    ) : (
                        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
                    )}
                    <div className="cart-badge-btn" onClick={() => setIsCartOpen(true)}>
                        <FaShoppingBag style={{ color: "#d63031" }} />
                        <span>{cart.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                    </div>
                </div>
            </header>

            {/* --- LOCATION PICKER MODAL --- */}
            <LocationPicker 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={(loc) => {
                    // In a real app, you'd use Reverse Geocoding API to get address name
                    setUserAddress(`Lat: ${loc.lat.toFixed(2)}`); 
                }}
            />

            <Routes>
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/signup" element={<Signup onLogin={setUser} />} />
                <Route path="/" element={
                    <div className="main-layout" style={{ display: 'flex' }}>
                        <CategorySidebar
                            activeCategory={selectedCategory}
                            onSelectCategory={handleSelectCategory}
                            isOpen={isMenuOpen}
                            onClose={() => setIsMenuOpen(false)}
                        />
                        <main style={{ flex: 1, background: '#f6f6f6', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
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
                                    <div style={{ padding: '20px', color: '#666', gridColumn: '1 / -1' }}>
                                        <h3>No products found in {selectedCategory}</h3>
                                        <p>Check the database if you added products for this category!</p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                } />
                <Route path="/checkout" element={<Checkout cart={cart} placeOrder={handlePlaceOrder} />} />
            </Routes>

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQty={handleUpdateQty}
                onCheckout={() => { setIsCartOpen(false); navigate("/checkout"); }}
            />
        </div>
    );
}
// ```

// ### **Summary of Changes**
// 1.  **Installed** `leaflet` and `react-leaflet`.
// 2.  **Created** `LocationPicker.jsx` which displays an interactive OpenStreetMap.
// 3.  **Styled** the modal in `App.css`.
// 4.  **Updated** `AppContent.jsx` to show the modal when the "Dhaka" button is clicked.

// **Note on "Reverse Geocoding":**
// Currently, when you pick a location, it will update the text to show coordinates (e.g., "Lat: 23.81"). To show "Gulshan, Dhaka", you would need a Geocoding API (like Google Maps API or OpenCage), which usually requires a key. For this project phase, coordinates prove the feature works.

// [How to load Maps JavaScript API in React (2023)](https://www.youtube.com/watch?v=PfZ4oLftItk)
// This video is relevant because it shows the integration of Google Maps in React, providing a visual guide on setting up map components similar to the Leaflet implementation described.