
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useCart } from "../../../layout/pages/auth/CartContext";
import "./StoreLayout.css";

function StoreLayout() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(sessionStorage.getItem("northstar_access"))
  );

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(
        Boolean(sessionStorage.getItem("northstar_access"))
      );
    }

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("northstar-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("northstar-auth-changed", syncAuthState);
    };
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("northstar_access");
    sessionStorage.removeItem("northstar_refresh");

    window.dispatchEvent(new Event("northstar-auth-changed"));

    navigate("/products", { replace: true });
  }

  return (
    <div className="store-layout">
      <header className="store-header">
        <Link to="/products" className="store-logo">
          NORTHSTAR<span>.</span>
        </Link>

        <nav className="store-nav" aria-label="Main navigation">
          <NavLink to="/products">Shop</NavLink>
        </nav>

        <div className="store-actions">
          <Link to="/cart" className="store-cart">
            Bag <span className="cart-count">{cartCount}</span>
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/home" className="store-account">
                My Account
              </Link>
              <button
                type="button"
                className="store-auth-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="store-auth-button">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="store-main">
        <Outlet />
      </main>

      <footer className="store-footer">
        <Link to="/products" className="store-logo">
          NORTHSTAR<span>.</span>
        </Link>
        <p>Thoughtfully selected. Made for everyday living.</p>
        <span>© {new Date().getFullYear()} Northstar Store</span>
      </footer>
    </div>
  );
}

export default StoreLayout;
