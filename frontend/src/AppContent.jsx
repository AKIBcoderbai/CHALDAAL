import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
// import { products } from "./data/products"; // <--- DELETE THIS LINE (We don't need fake file anymore)
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CategorySidebar from "./components/CategorySidebar";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { FaBars, FaSearch, FaMapMarkerAlt, FaUser, FaShoppingBag } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import BannerCarousel from "./components/BannerCarousel";

export default function AppContent() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Grocery");
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- NEW: Real Data State ---
    const [products, setProducts] = useState([]); // Stores the real DB data
    const [isLoading, setIsLoading] = useState(false);

    // --- FETCH FROM YOUR BACKEND ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                // Connect to your local backend
                const response = await fetch("http://localhost:3000/api/products");
                const data = await response.json();
                
                console.log("Real DB Data:", data);

                // Map DB fields to Frontend fields
                const mappedData = data.map(item => ({
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    originalPrice: item.original_price,
                    image: item.image_url,    // DB uses 'image_url', Card uses 'image'
                    category: item.category_name, // From the JOIN query
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

    if (isLoading) return <div style={{padding: "50px", textAlign: "center"}}><h2>Loading Chaldal...</h2></div>;

    // --- FILTERING LOGIC ---
    const displayedProducts = products.filter(p => {
        // 1. If searching, ignore category and search everything
        if (searchTerm.length > 0) {
            return p.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        // 2. Otherwise, show selected category
        return p.category === selectedCategory;
    });

    // --- HANDLERS ---
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
   
    //updated with supabase
   const handlePlaceOrder = async (customerData) => {
        const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0) + 60; // +60 delivery charge

        const orderPayload = {
            customer: customerData,
            items: cart,
            total: totalAmount
        };

        try {
            const response = await fetch("http://localhost:3000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Order Placed Successfully! Order ID: ${data.orderId}`);
                setCart([]); // Clear Cart
                navigate("/");
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("Something went wrong!");
        }
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
                    <div className="location-selector">
                        <FaMapMarkerAlt style={{ color: "#ff6b6b" }} /> <span>Dhaka</span> <MdKeyboardArrowDown />
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
                            
                            {/* PRODUCT GRID - NOW USING REAL DATA */}
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