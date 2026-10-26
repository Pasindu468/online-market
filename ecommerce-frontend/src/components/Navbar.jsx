import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="logo">
                    <span className="logo-icon">🛍️</span>
                    <span>Online Market</span>
                </Link>


                {/* Navigation Links */}
                <div className="nav-links">

                    <Link to="/" className="nav-link">
                        Home
                    </Link>

                    <Link to="/products" className="nav-link">
                        Products
                    </Link>

                    <Link to="/cart" className="nav-link cart-link">
                        🛒 Cart
                    </Link>


                    {/* Logged In User */}
                    {token && user ? (

                        <>
                            <Link
                                to="/orders"
                                className="nav-link"
                            >
                                📦 My Orders
                            </Link>


                            {/* Admin Links */}
                            {user.role === "ADMIN" && (
                                <>
                                    <Link
                                        to="/admin/products"
                                        className="nav-link admin-link"
                                    >
                                        👑 Products
                                    </Link>

                                    <Link
                                        to="/admin/orders"
                                        className="nav-link admin-link"
                                    >
                                        📋 Orders
                                    </Link>
                                </>
                            )}


                            {/* User Name */}
                            <span className="nav-user">
                                Hi, {user.name}
                            </span>


                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="nav-logout"
                            >
                                Logout
                            </button>
                        </>

                    ) : (

                        <>
                            {/* Not Logged In */}

                            <Link
                                to="/login"
                                className="nav-login"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="nav-register"
                            >
                                Register
                            </Link>

                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;