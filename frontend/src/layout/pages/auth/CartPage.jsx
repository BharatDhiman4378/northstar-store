import { Link } from "react-router-dom";
import { useCart } from "../../../layout/pages/auth/CartContext";
import "./CartPage.css";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
    
    if (items.length === 0) {
       return (
        <main className="cart-page">
            <p className="cart-eyebrow">YOUR NORTHSTAR BAG</p>
            <h1>Your bag is empty.</h1>
            <p>Discover something thoughtful for your everyday life.</p>
            <Link className="continue-shopping" to="/products">
            Continue shopping
            </Link>
        </main>
        );
    }
  
    return (
        <main className="cart-page">
        <p className="cart-eyebrow">YOUR NORTHSTAR BAG</p>
        <h1>Your shopping bag</h1>
        <p className="cart-subtitle">
            Review your selected pieces before checkout.
        </p>
            <div className="cart-layout">
                <section className="cart-items">
                    {items.map((item) =>
                        <article className="cart-item" key={item.id}>
                            <div className="cart-item-image">
                                {item.image_url ? (
                                <img src={item.image_url} alt={item.name} />
                                ) : (
                                <span>NORTHSTAR</span>
                                )}
                            </div>
                            <div className="cart-item-details">
                                <h2>{item.name}</h2>
                                <h2>{item.category_name}</h2>
                                <p className="cart-item-price">
                                     ₹{Number(item.price).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                                <p className="quantity-control">
                                    <button
                                        type="button"
                                        aria-label={`Decrease quantity of ${item.name}`}
                                        onClick={() =>
                                        updateQuantity(item.id,item.quantity-1)
                                    }>
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        type="button"
                                        aria-label={`Increase quantity of ${item.name}`}
                                        onClick={() =>
                                        updateQuantity(item.id,item.quantity+1)
                                    }>
                                        +
                                    </button>

                                    <button
                                        type="button"
                                        className="remove-item"
                                        onClick={() => removeFromCart(item.id)}>
                                        Remove
                                    </button>
                                </p>
                            </div>
                            <p className="cart-line-total">
                                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                    )}
                            </p>
                        </article>
                        
                    )}
                </section>
                <aside className="cart-summry">
                    <span>Order summary</span>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>
                        ₹{cartTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Calculated at Checkout</span>
                    </div>
                    <div className="summary-total">
                        <span>Total before shipping</span>
                        <span>
                            ₹{cartTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="checkout-button"
                        disabled
                        title="Checkout will be implemented in a later milestone">
                        Checkout — coming soon
                    </button>
                    <Link className="continue-shopping" to="/products">
                        Continue shopping
                    </Link>
                </aside>
            </div>
        </main>
    );
}