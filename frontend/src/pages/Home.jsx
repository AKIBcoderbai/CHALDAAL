import { useMemo, useState } from "react";
import CategorySidebar from "../components/CategorySidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { FaArrowLeft, FaShoppingBag, FaPlus, FaMinus } from "react-icons/fa";

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
  setIsCartOpen, isCartOpen
}) {
  const [showCatalog, setShowCatalog] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

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

  const faqs = [
    { q: "How fast is the delivery?", a: "We aim to deliver within 30-45 minutes in selected metropolitan areas." },
    { q: "What is the return policy?", a: "If you are unsatisfied with any product, return it to the delivery rider immediately, or contact support within 24 hours." },
    { q: "Are the vegetables strictly organic?", a: "We source directly from local farmers. Look for the 'Organic' badge on specific items in the catalog." },
    { q: "Can I pay using Mobile Banking?", a: "Yes, we accept bKash, Nagad, Rocket, as well as all major credit/debit cards." }
  ];

  const openCategoryView = (category) => {
    handleSelectCategory(category);
    setShowCatalog(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
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
        
        {/* Floating Cart - Hidden when cart sidebar is open */}
        {!isCartOpen && (
          <div className="floating-cart-wrapper">
            <button className="floating-cart-pill" onClick={() => setIsCartOpen(true)}>
              <div className="floating-cart-icon">
                <FaShoppingBag />
              </div>
              <div className="floating-cart-text">
                <div className="cart-qty-text">{cartQty} Items</div>
                <div className="cart-total-text">৳ {Math.round(cartTotal)}</div>
              </div>
            </button>
          </div>
        )}

        {!showCatalog ? (
          <div className="beast-homepage">
            {/* HERO BENTO GRID */}
            <section className="hero-bento-grid">
              <div className="home-hero 3d-element">
                <div className="home-hero-copy">
                  <h1 className="text-gradient">Grocery Delivered at your Doorstep</h1>
                  <p className="hero-subtitle">
                    Fresh groceries, fastest delivery, and curated daily essentials for your family. Skip the lines and shop online.
                  </p>
                  <button className="hero-cta" onClick={() => openCategoryView("All")}>
                    Explore Catalog
                  </button>
                </div>
                
                {/* Overlapping Image Stack */}
                <div className="hero-image-stack">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" alt="Fresh Produce" className="hero-img-main" />
                  <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80" alt="Supermarket" className="hero-img-secondary" />
                </div>
              </div>
              
              <div className="home-side-banner 3d-element">
                <BannerCarousel />
              </div>
            </section>

            {/* BRAND MARQUEE */}
            <section className="brands-section 3d-element">
              <p className="brands-title">Trusted by Global & Local Brands</p>
              <div className="marquee-container">
                <div className="marquee-track">
                  <img src="https://cdn-icons-png.flaticon.com/512/882/882747.png" alt="Nestle" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969087.png" alt="Unilever" />
                  <img src="https://cdn-icons-png.flaticon.com/512/731/731985.png" alt="Coca Cola" />
                  <img src="https://cdn-icons-png.flaticon.com/512/882/882704.png" alt="Samsung" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969178.png" alt="PepsiCo" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969058.png" alt="Google" />
                </div>
                <div className="marquee-track" aria-hidden="true">
                  <img src="https://cdn-icons-png.flaticon.com/512/882/882747.png" alt="Nestle" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969087.png" alt="Unilever" />
                  <img src="https://cdn-icons-png.flaticon.com/512/731/731985.png" alt="Coca Cola" />
                  <img src="https://cdn-icons-png.flaticon.com/512/882/882704.png" alt="Samsung" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969178.png" alt="PepsiCo" />
                  <img src="https://cdn-icons-png.flaticon.com/512/5969/5969058.png" alt="Google" />
                </div>
              </div>
            </section>

            {/* CATEGORIES */}
            <section className="home-categories">
              <div className="home-section-head">
                <h2>Explore Categories</h2>
                <button className="neon-text-btn" onClick={() => openCategoryView("All")}>View All</button>
              </div>
              <div className="home-category-grid">
                {landingCategories.map((category) => (
                  <button
                    key={category.name}
                    className="home-category-card 3d-element"
                    onClick={() => openCategoryView(category.name)}
                  >
                    <div className="icon-glow-ring">
                      <img src={category.logo} alt={category.name} />
                    </div>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* FEATURE ROW */}
            <section className="home-feature-row">
              <article className="3d-element glass-card">
                <div className="feature-icon">💎</div>
                <h3>Shop & Earn Points</h3>
                <p>Earn rewards on every purchase and unlock premium offers.</p>
              </article>
              <article className="3d-element glass-card">
                <div className="feature-icon">🔥</div>
                <h3>Deal of the Day</h3>
                <p>Daily hand-picked discounts on high-demand essentials.</p>
              </article>
              <article className="3d-element glass-card">
                <div className="feature-icon">🛡️</div>
                <h3>Premium Care</h3>
                <p>Fast support from our dedicated operations team.</p>
              </article>
            </section>

{/* APP STRIP */}
<section className="home-app-strip 3d-element">
  <div className="app-strip-content">
    <h2>Download the Chaldal App Now</h2>
    <p>Get exclusive app-only offers and faster repeat checkout. Available on iOS and Android.</p>
    <div className="app-buttons">
      <a 
        href="https://apps.apple.com/us/app/chaldal-grocery-delivery/id839174092" 
        target="_blank" 
        rel="noopener noreferrer"
        className="store-btn"
      >
        App Store
      </a>
      <a 
        href="https://play.google.com/store/apps/details?id=com.chaldal.client" 
        target="_blank" 
        rel="noopener noreferrer"
        className="store-btn"
      >
        Google Play
      </a>
    </div>
  </div>
  <img
    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80"
    alt="Chaldal app"
    className="floating-img"
  />
</section>

            {/* Q&A SECTION */}
            <section className="home-faq-section">
              <div className="home-section-head">
                <h2>Frequently Asked Questions</h2>
              </div>
              <div className="faq-container 3d-element">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="faq-question">
                      {faq.q}
                      {activeFaq === index ? <FaMinus className="faq-icon" /> : <FaPlus className="faq-icon" />}
                    </div>
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* CATALOG VIEW */
          <div className="catalog-view">
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
          </div>
        )}

        <Footer user={user} handleLogout={handleLogout} />
      </main>
    </div>
  );
}

export default Home;