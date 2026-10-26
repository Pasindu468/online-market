import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);

    const navigate = useNavigate();


    // ==========================================
    // LOAD ALL ORDERS
    // ==========================================

    const loadOrders = async () => {

        const token = localStorage.getItem("token");

        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        const role = user?.role;

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "ADMIN") {
            setError("Access denied. Admin only.");
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/api/orders/admin/all",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {

                if (response.status === 401) {
                    throw new Error(
                        "Your login session has expired."
                    );
                }

                if (response.status === 403) {
                    throw new Error(
                        "Access denied. Admin privileges required."
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


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadOrders();

    }, []);


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    const updateStatus = async (
        orderId,
        newStatus
    ) => {

        const token = localStorage.getItem("token");

        setUpdating(orderId);
        setError("");

        try {

            const response = await fetch(
                `http://localhost:8080/api/orders/admin/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data ||
                    "Unable to update order status."
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? {
                            ...order,
                            status: data.status
                        }
                        : order
                )
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to update order status."
            );

        } finally {

            setUpdating(null);

        }
    };


    // ==========================================
    // CANCEL ORDER
    // ==========================================

    const cancelOrder = async (orderId) => {

        const confirmed = window.confirm(
            `Are you sure you want to cancel Order #${orderId}?`
        );

        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem("token");

        setUpdating(orderId);
        setError("");

        try {

            const response = await fetch(
                `http://localhost:8080/api/orders/admin/${orderId}/cancel`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data ||
                    "Unable to cancel order."
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? {
                            ...order,
                            status: "CANCELLED"
                        }
                        : order
                )
            );

            setError("");

            alert(
                "Order cancelled and stock restored successfully."
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to cancel order."
            );

        } finally {

            setUpdating(null);

        }
    };


    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {

        return String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => order.status === "PENDING"
    ).length;

    const confirmedOrders = orders.filter(
        (order) => order.status === "CONFIRMED"
    ).length;

    const shippedOrders = orders.filter(
        (order) => order.status === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.status === "DELIVERED"
    ).length;

    const cancelledOrders = orders.filter(
        (order) => order.status === "CANCELLED"
    ).length;


    // ==========================================
    // TOTAL REVENUE
    // ==========================================

    const totalRevenue = orders
        .filter(
            (order) =>
                order.status !== "CANCELLED"
        )
        .reduce(
            (total, order) =>
                total +
                Number(order.totalAmount || 0),
            0
        );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="admin-orders-loading">

                <div className="admin-orders-spinner"></div>

                <h2>
                    Loading Orders...
                </h2>

                <p>
                    Please wait while we retrieve
                    customer orders.
                </p>

            </div>
        );
    }


    // ==========================================
    // ERROR WITH NO ORDERS
    // ==========================================

    if (error && orders.length === 0) {

        return (

            <div className="admin-orders-access-page">

                <div className="admin-orders-error-card">

                    <div className="admin-orders-error-icon">
                        ⚠️
                    </div>

                    <h1>
                        Unable to Load Orders
                    </h1>

                    <p>
                        {error}
                    </p>

                    <div className="admin-orders-error-actions">

                        <button
                            onClick={loadOrders}
                            className="admin-orders-primary-button"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                            className="admin-orders-secondary-button"
                        >
                            Back to Home
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ADMIN ORDERS PAGE
    // ==========================================

    return (

        <div className="admin-orders-dashboard">


            {/* ====================================
                HEADER
                ==================================== */}

            <div className="admin-orders-header">

                <div>

                    <span className="admin-orders-label">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Order Management
                    </h1>

                    <p>
                        Monitor customer orders and
                        manage their order status.
                    </p>

                </div>


                <button
                    className="admin-refresh-button"
                    onClick={loadOrders}
                    disabled={loading}
                >
                    ↻ Refresh Orders
                </button>

            </div>


            {/* ====================================
                ERROR ALERT
                ==================================== */}

            {error && (

                <div className="admin-orders-alert">

                    <span>
                        ⚠️
                    </span>

                    {error}

                </div>

            )}


            {/* ====================================
                STATISTICS
                ==================================== */}

            <div className="admin-orders-stats">


                <div className="admin-order-stat">

                    <div className="admin-order-stat-icon">
                        📦
                    </div>

                    <div>

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {totalOrders}
                        </strong>

                    </div>

                </div>


                <div className="admin-order-stat">

                    <div className="admin-order-stat-icon">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingOrders}
                        </strong>

                    </div>

                </div>


                <div className="admin-order-stat">

                    <div className="admin-order-stat-icon">
                        🚚
                    </div>

                    <div>

                        <span>
                            Shipped
                        </span>

                        <strong>
                            {shippedOrders}
                        </strong>

                    </div>

                </div>


                <div className="admin-order-stat">

                    <div className="admin-order-stat-icon">
                        ✓
                    </div>

                    <div>

                        <span>
                            Delivered
                        </span>

                        <strong>
                            {deliveredOrders}
                        </strong>

                    </div>

                </div>


                <div className="admin-order-stat">

                    <div className="admin-order-stat-icon">
                        💰
                    </div>

                    <div>

                        <span>
                            Revenue
                        </span>

                        <strong>
                            Rs.{" "}
                            {totalRevenue.toLocaleString()}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ====================================
                ORDER SUMMARY
                ==================================== */}

            <div className="admin-orders-overview">

                <div>

                    <h2>
                        Orders Overview
                    </h2>

                    <p>
                        Current order status summary
                    </p>

                </div>


                <div className="admin-status-summary">

                    <span className="summary-item pending">
                        <span></span>
                        Pending {pendingOrders}
                    </span>

                    <span className="summary-item confirmed">
                        <span></span>
                        Confirmed {confirmedOrders}
                    </span>

                    <span className="summary-item shipped">
                        <span></span>
                        Shipped {shippedOrders}
                    </span>

                    <span className="summary-item delivered">
                        <span></span>
                        Delivered {deliveredOrders}
                    </span>

                    <span className="summary-item cancelled">
                        <span></span>
                        Cancelled {cancelledOrders}
                    </span>

                </div>

            </div>


            {/* ====================================
                ORDERS
                ==================================== */}

            {orders.length === 0 ? (

                <div className="admin-orders-empty">

                    <div className="admin-orders-empty-icon">
                        📦
                    </div>

                    <h2>
                        No Orders Found
                    </h2>

                    <p>
                        Customer orders will appear
                        here when they place an order.
                    </p>

                </div>

            ) : (

                <div className="admin-orders-list">

                    {orders.map((order) => (

                        <div
                            className="admin-order-card"
                            key={order.orderId}
                        >


                            {/* ORDER HEADER */}

                            <div className="admin-order-card-header">

                                <div className="admin-order-title">

                                    <div className="admin-order-icon">
                                        📦
                                    </div>

                                    <div>

                                        <span>
                                            ORDER
                                        </span>

                                        <h2>
                                            #{order.orderId}
                                        </h2>

                                        <p>
                                            {new Date(
                                                order.orderDate
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                </div>


                                <span
                                    className={`admin-order-status ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                    <span></span>
                                    {order.status}
                                </span>

                            </div>


                            {/* CUSTOMER + TOTAL */}

                            <div className="admin-order-information">


                                <div className="admin-customer-box">

                                    <span className="admin-info-label">
                                        CUSTOMER
                                    </span>

                                    <div className="admin-customer-details">

                                        <div className="customer-avatar">
                                            {order.customerName
                                                ? order.customerName
                                                    .charAt(0)
                                                    .toUpperCase()
                                                : "?"}
                                        </div>

                                        <div>

                                            <strong>
                                                {order.customerName ||
                                                    "Unknown Customer"}
                                            </strong>

                                            <p>
                                                {order.customerEmail ||
                                                    "No email available"}
                                            </p>

                                        </div>

                                    </div>

                                    <small>
                                        Customer ID:{" "}
                                        {order.customerId}
                                    </small>

                                </div>


                                <div className="admin-total-box">

                                    <span className="admin-info-label">
                                        ORDER TOTAL
                                    </span>

                                    <strong>
                                        Rs.{" "}
                                        {Number(
                                            order.totalAmount
                                        ).toLocaleString()}
                                    </strong>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="admin-order-controls">

                                <div className="status-control">

                                    <label>
                                        Update Order Status
                                    </label>

                                    <select
                                        value={order.status}
                                        disabled={
                                            updating ===
                                                order.orderId ||
                                            order.status ===
                                                "CANCELLED"
                                        }
                                        onChange={(event) =>
                                            updateStatus(
                                                order.orderId,
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="PENDING">
                                            PENDING
                                        </option>

                                        <option value="CONFIRMED">
                                            CONFIRMED
                                        </option>

                                        <option value="SHIPPED">
                                            SHIPPED
                                        </option>

                                        <option value="DELIVERED">
                                            DELIVERED
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELLED
                                        </option>

                                    </select>

                                </div>


                                <div className="admin-order-control-actions">

                                    {updating ===
                                        order.orderId && (

                                        <span className="updating-text">
                                            Updating...
                                        </span>

                                    )}


                                    {order.status !==
                                        "CANCELLED" &&
                                        order.status !==
                                            "DELIVERED" && (

                                            <button
                                                className="admin-cancel-order-button"
                                                disabled={
                                                    updating ===
                                                    order.orderId
                                                }
                                                onClick={() =>
                                                    cancelOrder(
                                                        order.orderId
                                                    )
                                                }
                                            >
                                                {updating ===
                                                order.orderId
                                                    ? "Processing..."
                                                    : "Cancel Order"}
                                            </button>

                                        )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default AdminOrders;