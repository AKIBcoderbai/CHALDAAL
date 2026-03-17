import { useState,useEffect } from "react";

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [checkoutMeta, setCheckoutMeta] = useState({
    couponCode: "",
    discount: 0,
    deliveryCharge: 60,
    tax: 0,
    subtotal: 0,
    total: 0,
  });

  useEffect(() =>{
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart([]);
        return;
      }
      try{
        const response = await fetch("http://localhost:3000/api/cart", {
          headers: {
            "Authorization": `Bearer ${token}`}
          });

        if(response.status==401 || response.status==403) { 
          window.dispatchEvent(new Event('session_expired'));
          return;
        }
        if (response.ok) {
          const cartItems = await response.json();
          console.log("Fetched cart items:", cartItems);
          setCart(cartItems);
        } else {
          setCart([]);
        }
      }
      catch(err){
        console.error("Failed to fetch cart:", err);
        setCart([]);
      }
    };
    fetchCart();

    window.addEventListener('login_success', fetchCart);
    window.addEventListener('logout_success', () => setCart([]));
    window.addEventListener('focus', fetchCart); // Refresh cart when user returns to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchCart();
      }
    });
    return () => {
      window.removeEventListener('login_success', fetchCart);
      window.removeEventListener('logout_success', () => setCart([]));
      window.removeEventListener('focus', fetchCart);
      document.removeEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          fetchCart();
        }
      });
    };
  }, []);

  const handleAddToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
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

    //optimistically update server cart
    //now handle the real database stuff
      const token = localStorage.getItem("token");
      if(token)
      {
        fetch("http://localhost:3000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id, quantity: 1,price:product.price })
        }).catch(err => {
          console.error("Failed to update cart on server:", err);
        });
      }
  };

  const handleUpdateQty = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + amount } : item,
        )
        .filter((item) => item.qty > 0),
    );

    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/api/cart/update", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ product_id: id, amount: amount })
      }).catch(err => console.error("database sync failed"));
    }

  };

  const clearCart = () => {
    setCart([]);
    //clear server cart
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/api/cart/clear", {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error("Failed to clear cart on server:", err));
    }
  };

  return {
    cart,
    isCartOpen, setIsCartOpen,
    checkoutMeta, setCheckoutMeta,
    handleAddToCart,
    handleUpdateQty,
    clearCart
  };
}