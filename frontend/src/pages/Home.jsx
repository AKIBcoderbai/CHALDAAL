import { useMemo, useState } from "react";
import CategorySidebar from "../components/CategorySidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { FaArrowLeft, FaShoppingBag } from "react-icons/fa";

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
  user, handleLogout,
  setIsCartOpen
}) {
  const [showCatalog, setShowCatalog] = useState(false);
  const cartQty = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.qty || 0), 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0), 0),
    [cart]
  );

  const landingCategories = useMemo(() => {
    const logos = {
      Grocery: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
      Beverage: "https://cdn-icons-png.flaticon.com/512/2738/2738730.png",
      Pharmacy: "https://cdn-icons-png.flaticon.com/512/4320/4320371.png",
      Electronics: "https://cdn-icons-png.flaticon.com/512/3659/3659898.png",
      Clothing: "https://cdn-icons-png.flaticon.com/512/3159/3159614.png",
      Cooking: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
      Food: "https://cdn-icons-png.flaticon.com/512/5787/5787100.png",
      All: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
    };
    return quickCategories
      .filter(Boolean)
      .slice(0, 8)
      .map((name) => ({ name, logo: logos[name] || logos.All }));
  }, [quickCategories]);

  const openCategoryView = (category) => {
    handleSelectCategory(category);
    setShowCatalog(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="main-layout" style={{ display: "flex" }}>
      <CategorySidebar
        activeCategory={selectedCategory}
        onSelectCategory={openCategoryView}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <main className="main-content">
        <button className="floating-cart-pill" onClick={() => setIsCartOpen(true)}>
          <div className="floating-cart-icon">
            <FaShoppingBag />
          </div>
          <div>
            <strong>{cartQty} Items</strong>
            <span>৳ {Math.round(cartTotal)}</span>
          </div>
        </button>

        {!showCatalog ? (
          <>
            <section className="home-hero">
              <div className="home-hero-copy">
                <h1>Grocery Delivered at your Doorstep</h1>
                <p>
                  Fresh groceries, fastest delivery, and curated daily essentials
                  for your family.
                </p>
              </div>
              <div className="home-hero-gallery">
                {[
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
                  "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80",
                  "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&w=600&q=80",
                  "https://chaldn.com/asset/egg-chaldal-web-release-id-29425/https/Default/stores/chaldal/components/landingPage2/LandingPage/images/shop_and_get_More/dailyDealsShopInfo.jpg?q=low",
                ].map((img) => (
                  <img key={img} src={img} alt="Chaldal lifestyle" />
                ))}
              </div>
            </section>

            <section className="home-categories">
              <div className="home-section-head">
                <h2>Popular Categories</h2>
                <button onClick={() => openCategoryView("All")}>View All</button>
              </div>
              <div className="home-category-grid">
                {landingCategories.map((category) => (
                  <button
                    key={category.name}
                    className="home-category-card"
                    onClick={() => openCategoryView(category.name)}
                  >
                    <img src={category.logo} alt={category.name} />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="home-feature-row">
              <article>
                <h3>Shop & Earn Points</h3>
                <p>Earn rewards on every purchase and unlock premium offers.</p>
              </article>
              <article>
                <h3>Deal of the Day</h3>
                <p>Daily hand-picked discounts on high-demand essentials.</p>
              </article>
              <article>
                <h3>Premium Care</h3>
                <p>Fast support from our dedicated operations team.</p>
              </article>
            </section>

            <section className="home-banner-showcase">
              <div className="home-section-head">
                <h2>Trending Deals</h2>
                <button onClick={() => openCategoryView("All")}>Shop All</button>
              </div>
              <BannerCarousel />
            </section>

            <section className="home-app-strip">
              <div>
                <h2>Download the Chaldal App Now</h2>
                <p>Get exclusive app-only offers and faster repeat checkout.</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80"
                alt="Chaldal app"
              />
            </section>
          </>
        ) : (
          <>
            <section className="discovery-toolbar">
              <div className="discover-left">
                <button className="discover-back-btn" onClick={() => setShowCatalog(false)}>
                  <FaArrowLeft /> Back to Homepage
                </button>
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
              Showing <strong>{displayedProducts.length}</strong> products in{" "}
              <strong>{selectedCategory}</strong>
            </div>

            <div className="products-scroll-wrapper">
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
                    <p>Try another category from quick filters.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
       <Footer user={user} handleLogout={handleLogout} />
      </main>
    </div>
  );
}

export default Home;
