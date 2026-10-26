import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function OrderDetails() {

  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // LOAD ORDER DETAILS
  // ==========================================

  useEffect(() => {

    const loadOrder = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        const response = await fetch(
          `http://localhost:8080/api/orders/${orderId}`,
          {
            method: "GET",

            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {

          if (response.status === 401) {
            throw new Error(
              "Your login session has expired. Please login again."
            );
          }

          if (response.status === 403) {
            throw new Error(
              "You cannot view this order."
            );
          }

          if (response.status === 404) {
            throw new Error(
              "Order not found."
            );
          }

          throw new Error(
            "Unable to load order details."
          );
        }

        const data = await response.json();


        setOrder(data);

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Unable to load order details."
        );

      } finally {

        setLoading(false);

      }
    };

    loadOrder();

  }, [orderId, navigate]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="order-details-loading">

        <div className="order-details-spinner"></div>

        <h2>
          Loading Order Details...
        </h2>

        <p>
          Please wait while we retrieve your order.
        </p>

      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="order-details-page">

        <div className="order-details-error">

          <div className="order-details-error-icon">
            ⚠️
          </div>

          <h1>
            Unable to Load Order
          </h1>

          <p>
            {error}
          </p>

          <button
            className="order-details-primary-button"
            onClick={() => navigate("/orders")}
          >
            ← Back to My Orders
          </button>

        </div>

      </div>
    );
  }


  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const totalItems = order.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );


  // ==========================================
  // ORDER DETAILS PAGE
  // ==========================================

  return (

    <div className="order-details-page">


      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <div className="order-details-header">

        <div>

          <span className="order-details-label">
            ORDER DETAILS
          </span>

          <h1>
            Order #{order.orderId}
          </h1>

          <p>
            Placed on{" "}
            {new Date(
              order.orderDate
            ).toLocaleString()}
          </p>

        </div>


        <span
          className={`order-status ${String(
            order.status
          ).toLowerCase()}`}
        >

          <span className="order-status-dot"></span>

          {order.status}

        </span>

      </div>


      {/* ======================================
          ORDER PROGRESS
          ====================================== */}

      <div className="order-progress-card">

        <div className="order-progress-title">

          <div>

            <h2>
              Order Status
            </h2>

            <p>
              Current status of your order
            </p>

          </div>

          <span className="current-status-text">
            {order.status}
          </span>

        </div>


        <div className="order-progress-line">

          <div
            className={`progress-step ${
              ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >

            <div className="progress-icon">
              ✓
            </div>

            <span>
              Placed
            </span>

          </div>


          <div
            className={`progress-connector ${
              ["CONFIRMED", "SHIPPED", "DELIVERED"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          ></div>


          <div
            className={`progress-step ${
              ["CONFIRMED", "SHIPPED", "DELIVERED"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >

            <div className="progress-icon">
              ✓
            </div>

            <span>
              Confirmed
            </span>

          </div>


          <div
            className={`progress-connector ${
              ["SHIPPED", "DELIVERED"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          ></div>


          <div
            className={`progress-step ${
              ["SHIPPED", "DELIVERED"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >

            <div className="progress-icon">
              🚚
            </div>

            <span>
              Shipped
            </span>

          </div>


          <div
            className={`progress-connector ${
              order.status === "DELIVERED"
                ? "active"
                : ""
            }`}
          ></div>


          <div
            className={`progress-step ${
              order.status === "DELIVERED"
                ? "active"
                : ""
            }`}
          >

            <div className="progress-icon">
              ✓
            </div>

            <span>
              Delivered
            </span>

          </div>

        </div>

      </div>


      {/* ======================================
          MAIN CONTENT
          ====================================== */}

      <div className="order-details-grid">


        {/* ====================================
            PRODUCTS
            ==================================== */}

        <div className="order-products">

          <div className="order-section-header">

            <div>

              <h2>
                Order Items
              </h2>

              <p>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}{" "}
                in this order
              </p>

            </div>

            <span className="items-count">
              {totalItems}
            </span>

          </div>


          <div className="order-product-list">

            {order.items.map((item) => (

              <div
                className="order-product"
                key={item.orderItemId}
              >

                <div className="order-product-icon">
                  🛍️
                </div>


                <div className="order-product-info">

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


                <div className="order-product-subtotal">

                  Rs.{" "}
                  {Number(item.subtotal)
                    .toLocaleString()}

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ====================================
            ORDER SUMMARY
            ==================================== */}

        <div className="order-summary">

          <h2>
            Order Summary
          </h2>


          <div className="summary-row">

            <span>
              Total Items
            </span>

            <strong>
              {totalItems}
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Order Status
            </span>

            <strong>
              {order.status}
            </strong>

          </div>


          <div className="summary-divider"></div>


          <div className="summary-row total-row">

            <span>
              Total Amount
            </span>

            <strong>
              Rs.{" "}
              {Number(order.totalAmount)
                .toLocaleString()}
            </strong>

          </div>


          <div className="order-secure-info">

            <span>
              🔒
            </span>

            <div>

              <strong>
                Secure Order
              </strong>

              <p>
                Your order information is
                protected.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          ACTIONS
          ====================================== */}

      <div className="order-actions">

        <Link
          to="/orders"
          className="orders-button"
        >
          ← Back to My Orders
        </Link>


        <Link
          to="/products"
          className="shop-button"
        >
          Continue Shopping
        </Link>

      </div>

    </div>
  );
}

export default OrderDetails;