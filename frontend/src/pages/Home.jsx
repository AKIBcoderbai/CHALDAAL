import { useNavigate } from "react-router-dom";
import CategorySidebar from "../components/CategorySidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductCard from "../components/ProductCard";

function Home({
  selectedCategory, handleSelectCategory,
  isMenuOpen, setIsMenuOpen,
  quickCategories,
  inStockOnly, setInStockOnly,
  priceCap, setPriceCap, maxProductPrice,
  sortBy, setSortBy,
  displayedProducts, isLoading,
  cart, handleAddToCart, handleUpdateQty,
  wishlistIds, toggleWishlist,
  user, handleLogout
}) {
  const navigate = useNavigate();

  return (
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
            <div style={{ padding: "20px", color: "#666", gridColumn: "1 / -1" }}>
              <h3>No products found in {selectedCategory}</h3>
              <p>Check the database if you added products for this category!</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
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
      </main>
    </div>
  );
}

export default Home;
