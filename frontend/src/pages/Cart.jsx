import { useCartStore } from '../store/cartStore'

function Cart() {
  const items = useCartStore(state => state.items)
  const removeFromCart = useCartStore(state => state.removeFromCart)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      <h1>Your Cart</h1>
      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.name} × {item.quantity} — ৳{item.price * item.quantity}
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <h2>Total: ৳{total}</h2>
    </div>
  )
}

export default Cart
