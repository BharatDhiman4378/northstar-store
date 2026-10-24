
import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../../../api/product";
import "./ProductsPage.css";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [ordering, setOrdering] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { addToCart, cartCount } = useCart();
    const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const data = await getCategories();
        if (!ignore) {
          setCategories(
            Array.isArray(data) ? data : data.results ?? []
          );
        }
      } catch {
        // Product listing can still work if category loading fails.
      }
    }

    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (ordering) params.ordering = ordering;

        const data = await getProducts(params);

        if (!ignore) {
          setProducts(
            Array.isArray(data) ? data : data.results ?? []
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.detail ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [search, category, ordering]);

  return (
    <main className="products-page">
        <header className="products-header">
            <p className="cart-count">
                <Link to="/cart" className="view-cart-link">
                    View bag ({cartCount})
                </Link>
            </p>
        <p className="products-eyebrow">THE NORTHSTAR COLLECTION</p>
        <h1>Thoughtful pieces for everyday living.</h1>
        <p>Discover considered essentials for your home and life.</p>
      </header>

      <section className="product-toolbar" aria-label="Product filters">
        <input
          id = "search"
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          id = "category"
          aria-label="Filter by category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          id = "sort"
          aria-label="Sort products"
          value={ordering}
          onChange={(event) => setOrdering(event.target.value)}
        >
          <option value="">Default sorting</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </section>

      {loading && <p>Loading products...</p>}

      {!loading && error && (
        <p className="products-error" role="alert">{error}</p>
      )}
        {cartMessage && (
            <p className="cart-message" role="status">
                {cartMessage}
            </p>
        )}
          {!loading && !error && (
              
        <section className="product-grid">
          {products.length === 0 ? (
            <p>No products match your search.</p>
          ) : (
            products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      NORTHSTAR
                    </div>
                  )}
                </div>

                <p className="product-category">
                  {product.category_name}
                </p>
                <h2>
                    <Link to={`/products/${product.id}`}>
                        {product.name}
                    </Link>
                </h2>
                <p className="product-price">
                  ₹{Number(product.price).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {/* {product.stock_quantity === 0 && (
                  <p className="stock-status">Out of stock</p>
                )} */}
                <button
                    type="button"
                    className="add-to-bag-button"
                    disabled={product.stock_quantity === 0}
                    onClick={() => {
                            const result = addToCart(product);
                            setCartMessage(result.message);
                           window.setTimeout(() => setCartMessage(""), 5000
                        );
                        }}>
                        {product.stock_quantity > 0 ? "Add to bag" : "Out of stock"}
                </button>
              </article>
            ))
          )}
        </section>
        )}
          
        
    </main>
  );
}
