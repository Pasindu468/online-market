import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {

  const [order, setOrder] = useState(null);


  // ==========================================
  // LOAD LAST ORDER
  // ==========================================

  useEffect(() => {

    const savedOrder =
      localStorage.getItem("lastOrder");

    if (savedOrder) {

      try {

        setOrder(
          JSON.parse(savedOrder)
        );

      } catch (error) {

        console.error(
          "Unable to read order:",
          error
        );

      }
    }

  }, []);


  // ==========================================
  // ORDER SUCCESS PAGE
  // ==========================================

  return (

    <div className="order-success-page">

      <div className="success-card">


        {/* ====================================
            SUCCESS ICON
            ==================================== */}

        <div className="success-icon">
          ✓
        </div>


        {/* ====================================
            TITLE
            ==================================== */}

        <span className="success-label">
          ORDER CONFIRMED
        </span>

        <h1>
          Order Placed Successfully!
        </h1>

        <p className="success-message-text">
          Thank you for your purchase.
          Your order has been received and
          is now being processed.
        </p>


        {/* ====================================
            ORDER DETAILS
            ==================================== */}

        {order && (

          <div className="order-details">

            {order.orderId && (

              <div className="success-detail-row">

                <span>
                  Order ID
                </span>

                <strong>
                  #{order.orderId}
                </strong>

              </div>

            )}


            {order.totalAmount !== undefined && (

              <div className="success-detail-row">

                <span>
                  Total Amount
                </span>

                <strong>
                  Rs.{" "}
                  {Number(order.totalAmount)
                    .toLocaleString()}
                </strong>

              </div>

            )}


            {order.status && (

              <div className="success-detail-row">

                <span>
                  Status
                </span>

                <span className="success-status">

                  <span className="status-dot"></span>

                  {order.status}

                </span>

              </div>

            )}

          </div>

        )}


        {/* ====================================
            INFORMATION
            ==================================== */}

        <div className="success-info">

          <span className="success-info-icon">
            📦
          </span>

          <div>

            <strong>
              What's next?
            </strong>

            <p>
              You can track your order from
              the My Orders section.
            </p>

          </div>

        </div>


        {/* ====================================
            ACTIONS
            ==================================== */}

        <div className="success-actions">

          <Link
            to="/orders"
            className="orders-button"
          >
            View My Orders →
          </Link>


          <Link
            to="/products"
            className="shop-button"
          >
            Continue Shopping
          </Link>

        </div>

      </div>

    </div>
  );
}

export default OrderSuccess;