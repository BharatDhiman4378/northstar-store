
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  getMyCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
} from "../../../api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Convert a backend cart item into the shape used by the UI.
  // Product details are fetched separately from Product Service.
  const normalizeCart = useCallback(async (cartData) => {
    const productIds = [
      ...new Set((cartData.items || []).map((item) => item.product_id)),
    ];

    const { getProductById } = await import("../../../api/product");

    const products = await Promise.all(
      productIds.map(async (id) => {
        try {
          return await getProductById(id);
        } catch {
          return null;
        }
      })
    );

    const productMap = new Map(
      products.filter(Boolean).map((product) => [product.id, product])
    );

    return (cartData.items || []).map((cartItem) => {
      const product = productMap.get(cartItem.product_id);

      return {
        ...product,
        id: cartItem.product_id,
        cartItemId: cartItem.id,
        quantity: cartItem.quantity,
        price: product?.price ?? "0.00",
        name: product?.name ?? product?.title ?? "Unavailable product",
        stock_quantity: product?.stock_quantity ?? 0,
        isUnavailable: !product,
      };
    });
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const cartData = await getMyCart();
      const normalizedItems = await normalizeCart(cartData);
      setItems(normalizedItems);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your cart. Please sign in and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [normalizeCart]);

  // Load the saved cart when the provider mounts.
  useEffect(() => {
  const accessToken = sessionStorage.getItem("northstar_access");

  if (accessToken) {
    refreshCart();
  } else {
    setItems([]);
    setError("");
  }
}, [refreshCart]);

  async function addToCart(product) {
    if (!product || !product.id) {
      return { success: false, message: "Invalid product." };
    }

    if (product.stock_quantity <= 0) {
      return { success: false, message: "This product is out of stock." };
    }

    const existingItem = items.find((item) => item.id === product.id);
    const nextQuantity = (existingItem?.quantity || 0) + 1;

    if (nextQuantity > product.stock_quantity) {
      return { success: false, message: "No more stock is available." };
    }

    try {
      const cartData = await addToCartApi(product.id, 1);
      setItems(await normalizeCart(cartData));

      return { success: true, message: "Added to your bag." };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.detail ||
          "Unable to add this product. Please try again.",
      };
    }
  }

  async function updateQuantity(productId, quantity) {
    const item = items.find((entry) => entry.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    if (quantity > item.stock_quantity) {
      setError("The requested quantity exceeds available stock.");
      return;
    }

    try {
      const cartData = await updateCartItemApi(item.cartItemId, quantity);
      setItems(await normalizeCart(cartData));
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update cart quantity."
      );
    }
  }

  async function removeFromCart(productId) {
    const item = items.find((entry) => entry.id === productId);
    if (!item) return;

    try {
      await removeCartItemApi(item.cartItemId);
      setItems((currentItems) =>
        currentItems.filter((entry) => entry.id !== productId)
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to remove this item."
      );
    }
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
        loading,
        error,
        refreshCart,
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
