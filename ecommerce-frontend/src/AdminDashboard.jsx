import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api";
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ products: [], orders: [] });
  const [error, setError] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "ADMIN") { navigate("/"); return; }
    Promise.all([
      fetch(`${API}/products`).then((response) => { if (!response.ok) throw new Error("Could not load products"); return response.json(); }),
      fetch(`${API}/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => { if (!response.ok) throw new Error("Could not load orders"); return response.json(); }),
    ]).then(([products, orders]) => setData({ products, orders })).catch((err) => setError(err.message));
  }, [navigate]);
  const activeOrders = data.orders.filter((order) => order.status !== "CANCELLED");
  const revenue = activeOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const lowStock = data.products.filter((product) => Number(product.stockQuantity) <= 5);
  const stats = [
    ["Products", data.products.length], ["Orders", data.orders.length],
    ["Revenue", `Rs. ${revenue.toLocaleString()}`], ["Low stock", lowStock.length],
  ];
  return <main className="admin-dashboard-page">
    <header className="admin-dashboard-header"><div><span>STORE OVERVIEW</span><h1>Admin Dashboard</h1><p>Quick view of inventory, order activity, and sales.</p></div><nav><Link to="/admin/products">Manage products</Link><Link to="/admin/orders">Manage orders</Link></nav></header>
    {error && <p className="admin-message error" role="alert">{error}</p>}
    <section className="admin-dashboard-stats">{stats.map(([label, value]) => <article className="admin-dashboard-stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="admin-dashboard-panels">
      <article className="admin-dashboard-panel"><h2>Recent orders</h2>{data.orders.slice(0, 5).map((order) => <div className="dashboard-row" key={order.orderId}><span>#{order.orderId} · {order.customerName || order.customerEmail}</span><strong>{order.status} · Rs. {Number(order.totalAmount).toLocaleString()}</strong></div>)}{!data.orders.length && <p>No orders yet.</p>}<Link to="/admin/orders">View all orders →</Link></article>
      <article className="admin-dashboard-panel"><h2>Low stock products</h2>{lowStock.slice(0, 6).map((product) => <div className="dashboard-row" key={product.id}><span>{product.name}</span><strong>{product.stockQuantity} left</strong></div>)}{!lowStock.length && <p>All products have more than 5 items in stock.</p>}<Link to="/admin/products">Review inventory →</Link></article>
    </section>
  </main>;
}
