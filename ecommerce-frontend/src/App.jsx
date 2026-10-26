import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import { useState } from "react";

import Products from "./Products";
import Cart from "./Cart";
import Login from "./Login";
import Register from "./Register";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import Orders from "./Orders";
import OrderDetails from "./OrderDetails";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import ProductDetails from "./ProductDetails";
import Wishlist from "./Wishlist";
import AdminDashboard from "./AdminDashboard";

import "./App.css";


// ==========================================
// HOME PAGE
// ==========================================

function Home() {

  return (

    <div className="home-page">

      <h1>
        Welcome to Online Market
      </h1>

      <p>
        Discover quality products at affordable prices.
      </p>

      <Link
        to="/products"
        className="shop-button"
      >
        Shop Now
      </Link>

    </div>

  );
}


// ==========================================
// NAVIGATION BAR
// ==========================================

function NavigationBar() {

  const navigate = useNavigate();

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {

      try {

        return JSON.parse(savedUser);

      } catch {

        console.error(
          "Invalid user data"
        );

        return null;
      }
    }

    return null;
  });


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };


  return (

    <nav className="navbar">

      {/* =====================================
          LOGO
          ===================================== */}

      <div className="logo">

        🛍️ Online Market

      </div>


      {/* =====================================
          NAVIGATION LINKS
          ===================================== */}

      <div className="nav-links">

        <Link to="/">
          Home
        </Link>


        <Link to="/products">
          Products
        </Link>


        <Link to="/cart">
          🛒 Cart
        </Link>
        {user && <Link to="/wishlist">♡ Wishlist</Link>}


        {/* =====================================
            USER ORDERS
            ===================================== */}

        {user && (

          <Link to="/orders">
            My Orders
          </Link>

        )}


        {/* =====================================
            ADMIN LINKS
            ===================================== */}

        {user &&
          user.role === "ADMIN" && (

          <>

            <Link to="/admin/products">
              Admin Products
            </Link>

            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/orders">
              Admin Orders
            </Link>

          </>

        )}


        {/* =====================================
            USER INFORMATION
            ===================================== */}

        {user ? (

          <>

            <span className="welcome-user">

              👋 {user.name}

            </span>


            <button
              onClick={handleLogout}
              className="logout-button"
            >

              Logout

            </button>

          </>

        ) : (

          <>

            <Link to="/login">
              Login
            </Link>


            <Link to="/register">
              Register
            </Link>

          </>

        )}

      </div>

    </nav>

  );
}


// ==========================================
// CONDITIONAL NAVIGATION BAR
// ==========================================

function ConditionalNavigationBar() {

  const location = useLocation();


  // ==========================================
  // HIDE NAVBAR ON LOGIN / REGISTER
  // ==========================================

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";


  if (hideNavbar) {

    return null;

  }


  return (
    <NavigationBar />
  );
}


// ==========================================
// MAIN APP
// ==========================================

function App() {

  return (

    <BrowserRouter>

      {/* =====================================
          CONDITIONAL NAVIGATION
          ===================================== */}

      <ConditionalNavigationBar />


      {/* =====================================
          ROUTES
          ===================================== */}

      <Routes>


        {/* =====================================
            HOME
            ===================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =====================================
            PRODUCTS
            ===================================== */}

        <Route
          path="/products"
          element={<Products />}
        />


        {/* =====================================
            CART
            ===================================== */}

        <Route
          path="/cart"
          element={<Cart />}
        />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />


        {/* =====================================
            LOGIN
            ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================================
            REGISTER
            ===================================== */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================
            CHECKOUT
            ===================================== */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />


        {/* =====================================
            ORDER SUCCESS
            ===================================== */}

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />


        {/* =====================================
            MY ORDERS
            ===================================== */}

        <Route
          path="/orders"
          element={<Orders />}
        />


        {/* =====================================
            ORDER DETAILS
            ===================================== */}

        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />


        {/* =====================================
            ADMIN PRODUCTS
            ===================================== */}

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />


        {/* =====================================
            ADMIN ORDERS
            ===================================== */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />
        
        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />
        </Routes>

    </BrowserRouter>

  );
}


export default App;