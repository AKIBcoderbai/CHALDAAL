 import { useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaSearch, FaMapMarkerAlt, FaUser, FaShoppingBag } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import ThemeToggle from "./ThemeToggle"; // Make sure path is correct

function Header({ 
    isMenuOpen, setIsMenuOpen, inputValue, setInputValue, 
    handleInputChange, handleSearchKey, handleSearchKeyBtn, 
    showSuggestions, setShowSuggestions, suggestions, setSearchTerm, 
    setIsMapOpen, userAddress, user, handleLogout, cart, setIsCartOpen 
}){

    const location=useLocation();
    const navigate=useNavigate();
    return (
        <>
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

        </>
    )

}


export default Header;