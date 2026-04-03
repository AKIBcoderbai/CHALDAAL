import { useState, useEffect } from "react";

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [checkoutMeta, setCheckoutMeta] = useState({
    couponCode: "",
    discount: 0,
    deliveryCharge: 60,
    tax: 0,
    subtotal: 0,
    total: 0,
  });


  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        setIsLoaded(true);
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/cart", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status == 401 || response.status == 403) {
          window.dispatchEvent(new Event('session_expired'));
          setIsLoaded(true);
          return;
        }
        if (response.ok) {
          const cartItems = await response.json();
          setCart(cartItems);
        } else {
          setCart([]);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCart([]);
      } finally {
        setIsLoaded(true); // Always unlock after the first fetch!
      }
    };
    fetchCart();
  }, []);

 
  useEffect(() => {
    if (!isLoaded) return; 

    // Wait 500ms after the user STOPS clicking before saving to the DB
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch("http://localhost:3000/api/cart/sync", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ cart }) 
        }).catch(err => console.error("Sync failed:", err));
      }
    }, 500);

    return () => clearTimeout(timer); 
  }, [cart, isLoaded]);

  const handleAddToCart = (product) => {
    const userStr = localStorage.getItem("chaldal_user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.role === 'admin' || userObj.role === 'seller' || userObj.role === 'rider') {
          alert("You must be a standard customer to add items to the cart.");
          return;
        }
      } catch (err) {}
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
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

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart, setCart,
    isCartOpen, setIsCartOpen,
    checkoutMeta, setCheckoutMeta,
    handleAddToCart,
    handleUpdateQty,
    clearCart
  };
}