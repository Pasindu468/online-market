import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  useEffect(() => {

    const loadOrders = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        const response = await fetch(
          "http://localhost:8080/api/orders",
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
              "You don't have permission to view orders."
            );
          }

          throw new Error(
            "Unable to load orders."
          );
        }

        const data = await response.json();

        setOrders(data);

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Unable to load orders."
        );

      } finally {

        setLoading(false);

      }
    };

    loadOrders();

  }, [navigate]);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="orders-loading">

        <div className="orders-spinner"></div>

        <h2>
          Loading your orders...
        </h2>

        <p>
          Please wait while we retrieve
          your order history.
        </p>

      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="orders-page">

        <div className="orders-error-card">

          <div className="orders-error-icon">
            ⚠️
          </div>

          <h1>
            Unable to Load Orders
          </h1>

          <p>
            {error}
          </p>

          <button
            className="orders-primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ==========================================
  // NO ORDERS
  // ==========================================

  if (orders.length === 0) {

    return (

      <div className="orders-page">

        <div className="orders-header">

          <div>
            <span className="orders-label">
              ORDER HISTORY
            </span>

            <h1>
              My Orders
            </h1>

            <p>
              Track and manage your previous orders.
            </p>
          </div>

        </div>


        <div className="orders-empty-card">

          <div className="orders-empty-icon">
            📦
          </div>

          <h2>
            No Orders Yet
          </h2>

          <p>
            You haven't placed any orders yet.
            Start shopping and your orders
            will appear here.
          </p>

          <button
            className="orders-primary-button"
            onClick={() => navigate("/products")}
          >
            Start Shopping →
          </button>

        </div>

      </div>
    );
  }


  // ==========================================
  // ORDERS PAGE
  // ==========================================

  return (

    <div className="orders-page">


      {/* ======================================
          HEADER
          ====================================== */}

      <div className="orders-header">

        <div>

          <span className="orders-label">
            ORDER HISTORY
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            Track and manage your previous orders.
          </p>

        </div>

        <button
          className="orders-shop-button"
          onClick={() => navigate("/products")}
        >
          Continue Shopping →
        </button>

      </div>


      {/* ======================================
          ORDER COUNT
          ====================================== */}

      <div className="orders-summary">

        <div className="orders-summary-icon">
          📦
        </div>

        <div>

          <strong>
            {orders.length}{" "}
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </strong>

          <p>
            Your complete order history
          </p>

        </div>

      </div>


      {/* ======================================
          ORDERS LIST
          ====================================== */}

      <div className="orders-list">

        {orders.map((order) => (

          <div
            className="order-card"
            key={order.orderId}
          >


            {/* ORDER HEADER */}

            <div className="order-header">

              <div className="order-title">

                <span className="order-box-icon">
                  📦
                </span>

                <div>

                  <span className="order-number-label">
                    ORDER
                  </span>

                  <h2>
                    #{order.orderId}
                  </h2>

                </div>

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


            {/* ORDER INFO */}

            <div className="order-info">

              <div className="order-info-item">

                <span className="order-info-label">
                  Order Date
                </span>

                <strong>
                  {new Date(
                    order.orderDate
                  ).toLocaleString()}
                </strong>

              </div>


              <div className="order-info-item">

                <span className="order-info-label">
                  Total Amount
                </span>

                <strong className="order-total">
                  Rs.{" "}
                  {Number(
                    order.totalAmount
                  ).toLocaleString()}
                </strong>

              </div>

            </div>


            {/* VIEW BUTTON */}

            <div className="order-card-footer">

              <button
                className="view-order-button"
                onClick={() =>
                  navigate(
                    `/orders/${order.orderId}`
                  )
                }
              >
                View Order Details →
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Orders;