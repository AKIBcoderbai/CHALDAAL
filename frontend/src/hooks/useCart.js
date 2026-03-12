import { useState } from "react";

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
    cart,
    isCartOpen, setIsCartOpen,
    checkoutMeta, setCheckoutMeta,
    handleAddToCart,
    handleUpdateQty,
    clearCart
  };
}