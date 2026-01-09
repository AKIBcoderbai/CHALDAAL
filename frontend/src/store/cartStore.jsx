import { create } from 'zustand'

export const useCartStore = create(set => ({
  items: [],
  addToCart: product =>
    set(state => {
      const exists = state.items.find(i => i.id === product.id)
      if (exists) {
        return {
          items: state.items.map(i =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...state.items, { ...product, quantity: 1 }] }
    }),
  removeFromCart: id =>
    set(state => ({
      items: state.items.filter(i => i.id !== id),
    })),
  clearCart: () => set({ items: [] }),
}))
