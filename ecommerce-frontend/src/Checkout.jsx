import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout() {

  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {

    const loadCart = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
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

        if (!response.ok) {
          throw new Error(
            "Unable to load cart."
          );
        }

        const data = await response.json();

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

    loadCart();

  }, [navigate]);


  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    setError("");


    try {

      const response = await fetch(
        "http://localhost:8080/api/orders/checkout",
        {
          method: "POST",

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
          "Checkout failed."
        );
      }




      // ==========================================
      // SAVE LAST ORDER
      // ==========================================

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(data)
      );


      // ==========================================
      // GO TO SUCCESS PAGE
      // ==========================================

      navigate("/order-success");


    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Checkout failed."
      );

    } finally {

      setProcessing(false);

    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="checkout-loading">

        <div className="checkout-spinner"></div>

        <h2>
          Preparing checkout...
        </h2>

        <p>
          Please wait while we load your cart.
        </p>

      </div>

    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error && !cart) {

    return (

      <div className="checkout-page">

        <div className="checkout-error-card">

          <div className="checkout-status-icon">
            ⚠️
          </div>

          <h1>
            Unable to Load Checkout
          </h1>

          <p>
            {error}
          </p>

          <button
            className="checkout-secondary-button"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>

        </div>

      </div>

    );
  }


  // ==========================================
  // EMPTY CART
  // ==========================================

  if (!cart || cart.items.length === 0) {

    return (

      <div className="checkout-page">

        <div className="checkout-empty-card">

          <div className="checkout-empty-icon">
            🛒
          </div>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Add some products to your cart
            before checking out.
          </p>

          <button
            className="checkout-secondary-button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping →
          </button>

        </div>

      </div>

    );
  }


  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  return (

    <div className="checkout-page">


      {/* ======================================
          HEADER
          ====================================== */}

      <div className="checkout-header">

        <div>

          <span className="checkout-label">
            ORDER CHECKOUT
          </span>

          <h1>
            Complete Your Order
          </h1>

          <p>
            Review your items and place your order.
          </p>

        </div>


        <button
          className="back-cart-button"
          onClick={() => navigate("/cart")}
        >
          ← Back to Cart
        </button>

      </div>


      {/* ======================================
          ERROR
          ====================================== */}

      {error && (

        <div className="checkout-error">
          <span>⚠️</span>
          {error}
        </div>

      )}


      <div className="checkout-container">


        {/* ====================================
            ORDER ITEMS
            ==================================== */}

        <div className="checkout-items">

          <div className="checkout-section-title">

            <div>

              <h2>
                Order Summary
              </h2>

              <p>
                {cart.items.length}{" "}
                {cart.items.length === 1
                  ? "item"
                  : "items"}{" "}
                in your order
              </p>

            </div>

            <span className="checkout-lock">
              🔒 Secure
            </span>

          </div>


          <div className="checkout-item-list">

            {cart.items.map((item) => (

              <div
                className="checkout-item"
                key={item.cartItemId}
              >

                <div className="checkout-product-icon">
                  🛍️
                </div>


                <div className="checkout-product-info">

                  <h3>
                    {item.productName}
                  </h3>

                  <p>
                    Rs.{" "}
                    {Number(item.price)
                      .toLocaleString()}
                    {" "}×{" "}
                    {item.quantity}
                  </p>

                </div>


                <div className="checkout-item-total">

                  <strong>
                    Rs.{" "}
                    {Number(item.subtotal)
                      .toLocaleString()}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ====================================
            TOTAL / PLACE ORDER
            ==================================== */}

        <div className="checkout-summary">

          <h2>
            Payment Summary
          </h2>


          <div className="checkout-summary-row">

            <span>
              Items
            </span>

            <span>
              {cart.items.length}
            </span>

          </div>


          <div className="checkout-summary-row">

            <span>
              Subtotal
            </span>

            <span>
              Rs.{" "}
              {Number(cart.total)
                .toLocaleString()}
            </span>

          </div>


          <div className="checkout-divider"></div>


          <div className="checkout-total">

            <span>
              Total Amount
            </span>

            <strong>
              Rs.{" "}
              {Number(cart.total)
                .toLocaleString()}
            </strong>

          </div>


          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={processing}
          >

            {processing ? (

              <>
                <span className="button-spinner"></span>
                Processing Order...
              </>

            ) : (

              <>
                Place Order →
              </>

            )}

          </button>


          <div className="checkout-security">

            <span>
              🔒
            </span>

            <div>

              <strong>
                Secure Checkout
              </strong>

              <p>
                Your order is processed securely.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;