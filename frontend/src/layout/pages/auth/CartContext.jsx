
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product) {
    if (product.stock_quantity <= 0) {
      return { success: false, message: "This product is out of stock." };
    }

    const existingItem = items.find(
      (item) => item.id === product.id
    );

    if (existingItem && existingItem.quantity >= product.stock_quantity) {
      return { success: false, message: "No more stock is available." };
    }

    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });

    return { success: true, message: "Added to your bag." };
  }

  function updateQuantity(productId, quantity) {
    const item = items.find((entry) => entry.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > item.stock_quantity) return;

    setItems((currentItems) =>
      currentItems.map((entry) =>
        entry.id === productId
          ? { ...entry, quantity }
          : entry
      )
    );
  }

  function removeFromCart(productId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  }

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
