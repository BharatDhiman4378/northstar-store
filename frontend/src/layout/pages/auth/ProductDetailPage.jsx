
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../../../api/product";
import "./ProductDetailPage.css";
import { useCart } from "./CartContext";

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { addToCart, cartCount } = useCart();
    const [ cartMessage, setCartMessage ] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id);

        if (!ignore) setProduct(data);
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.status === 404
              ? "This product could not be found."
              : "Unable to load this product. Please try again."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <main className="product-detail">Loading product...</main>;
  }

  if (error || !product) {
    return (
      <main className="product-detail">
        <p role="alert">{error || "Product not found."}</p>
        <Link to="/products">Back to products</Link>
      </main>
    );
  }
    
async function handleAddToCart(product) {
  const accessToken = sessionStorage.getItem("northstar_access");

  // Stop before calling the Cart Service if logged out.
  if (!accessToken) {
    setCartMessage("Please login to add products to your cart.");
    window.setTimeout(() => setCartMessage(""), 5000);
    return;
  }

  try {
    const result = await addToCart(product);

    if (result.success) {
      setCartMessage(result.message || "Added to your bag.");
    } else {
      setCartMessage(
        result.message || "Unable to add this product to your cart."
      );
    }
  } catch (error) {
    if (error.response?.status === 401) {
      setCartMessage("Please login to add products to your cart.");
    } else {
      setCartMessage(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to add product to cart."
      );
    }
  }

  window.setTimeout(() => setCartMessage(""), 5000);
}

  return (
    <main className="product-detail">
      <Link className="back-link" to="/products">
        ← Back to collection
      </Link>
        {cartMessage && (
            <p className="cart-message" role="status">
                {cartMessage}
            </p>
        )}
      <section className="product-detail-layout">
        <div className="detail-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              NORTHSTAR
            </div>
          )}
        </div>

        <div className="detail-information">
          <p className="product-eyebrow">
            {product.category_name || "NORTHSTAR COLLECTION"}
          </p>

          <h1>{product.name}</h1>

          <p className="detail-price">
            ₹{Number(product.price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="detail-description">
            {product.description || "A considered essential for everyday living."}
          </p>

          <p>
            {product.stock_quantity > 0
              ? "In stock"
              : "Currently out of stock"}
          </p>

          <p className="detail-sku">SKU: {product.sku}</p>

          <button
            type="button"
            disabled={product.stock_quantity === 0}
            onClick={() => handleAddToCart(product)}>
            {product.stock_quantity > 0
              ? "Add to bag"
              : "Out of stock"}
          </button>
        </div>
      </section>
    </main>
  );
}
