import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);


  // ==========================================
  // GET CART
  // ==========================================

  const loadCart = async () => {

    const token = localStorage.getItem("token");

    if (!token) {

      setError("Please login to view your cart.");
      setLoading(false);

      return;
    }

    try {

      const response = await fetch(
        "http://localhost:8080/api/cart",
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load cart."
        );
      }

      setCart(data);

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Unable to load cart."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadCart();

  }, []);


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = async (
    cartItemId,
    quantity
  ) => {

    const token = localStorage.getItem("token");

    if (quantity <= 0) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:8080/api/cart/update/${cartItemId}?quantity=${quantity}`,
        {
          method: "PUT",

          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to update cart."
        );
      }

      loadCart();

    } catch (error) {

      console.error(error);

      setError(error.message);
    }
  };


  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = async (cartItemId) => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        `http://localhost:8080/api/cart/remove/${cartItemId}`,
        {
          method: "DELETE",

          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.text();

      if (!response.ok) {

        throw new Error(
          data ||
          "Unable to remove item."
        );
      }

      loadCart();

    } catch (error) {

      console.error(error);

      setError(error.message);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="cart-loading">

        <div className="cart-spinner"></div>

        <p>
          Loading your cart...
        </p>

      </div>
    );
  }


  // ==========================================
  // ERROR / NOT LOGGED IN
  // ==========================================

  if (error && !cart) {

    return (

      <div className="cart-page">

        <div className="cart-login-message">

          <div className="cart-message-icon">
            🛒
          </div>

          <h1>
            Your Shopping Cart
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/login"
            className="cart-login-button"
          >
            Login to Continue
          </Link>

        </div>

      </div>
    );
  }


  // ==========================================
  // CART PAGE
  // ==========================================

  return (

    <div className="cart-page">

      {/* HEADER */}

      <div className="cart-page-header">

        <div>

          <span className="cart-label">
            SHOPPING CART
          </span>

          <h1>
            Your Shopping Cart
          </h1>

          <p>
            Review your items before checkout.
          </p>

        </div>

        <Link
          to="/products"
          className="continue-shopping"
        >
          ← Continue Shopping
        </Link>

      </div>


      {/* ERROR */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* EMPTY CART */}

      {cart && cart.items.length === 0 ? (

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            You haven't added anything to your cart yet.
          </p>

          <Link
            to="/products"
            className="empty-cart-button"
          >
            Start Shopping →
          </Link>

        </div>

      ) : (

        <div className="cart-container">

          {/* CART ITEMS */}

          <div className="cart-items">

            <div className="cart-items-header">

              <span>
                Product
              </span>

              <span>
                Quantity
              </span>

              <span>
                Subtotal
              </span>

            </div>


            {cart.items.map((item) => (

              <div
                className="cart-item"
                key={item.cartItemId}
              >

                {/* PRODUCT */}

                <div className="cart-product">

                  <div className="cart-product-image">
                    {item.imageUrl ? <img src={`http://localhost:8080${item.imageUrl.startsWith("/") ? "" : "/"}${item.imageUrl}`} alt={item.productName} /> : "🛍️"}
                  </div>

                  <div className="cart-item-info">

                    <h2>
                      {item.productName}
                    </h2>

                    <p>
                      Rs.{" "}
                      {Number(item.price)
                        .toLocaleString()}
                      {" "}each
                    </p>

                  </div>

                </div>


                {/* QUANTITY */}

                <div className="quantity-controls">

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.cartItemId,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.cartItemId,
                        item.quantity + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>


                {/* SUBTOTAL */}

                <div className="cart-subtotal">

                  <strong>
                    Rs.{" "}
                    {Number(item.subtotal)
                      .toLocaleString()}
                  </strong>

                  <button
                    className="remove-button"
                    onClick={() =>
                      removeItem(item.cartItemId)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}

          </div>


          {/* CART SUMMARY */}

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>
                Items
              </span>

              <span>
                {cart.items.length}
              </span>

            </div>

            <div className="summary-divider"></div>

            <div className="cart-total">

              <span>
                Total
              </span>

              <strong>
                Rs.{" "}
                {Number(cart.total)
                  .toLocaleString()}
              </strong>

            </div>

            <button
              className="checkout-button"
              onClick={() =>
                window.location.href = "/checkout"
              }
            >
              Proceed to Checkout →
            </button>

            <p className="secure-checkout">
              🔒 Secure checkout
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default Cart;