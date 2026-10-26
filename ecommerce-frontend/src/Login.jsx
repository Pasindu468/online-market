import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!email.trim() || !password.trim()) {

      setError(
        "Please enter email and password."
      );

      setLoading(false);

      return;
    }


    try {

      const response = await fetch(
        "http://localhost:8080/api/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );


      const data = await response.json();




      if (!response.ok) {

        throw new Error(
          data.message ||
          "Invalid email or password."
        );
      }


      if (!data.token) {

        throw new Error(
          "Login successful, but no authentication token was received."
        );
      }


      // ==========================================
      // SAVE JWT TOKEN
      // ==========================================

      localStorage.setItem(
        "token",
        data.token
      );


      // ==========================================
      // SAVE USER
      // ==========================================

      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      };

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );





      // ==========================================
      // REDIRECT
      // ==========================================

      window.location.href = "/products";


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
        "Login failed. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================
  // LOGIN PAGE
  // ==========================================

  return (

    <div className="auth-page">

      {/* LEFT SIDE */}

      <div className="auth-intro">

        <div className="auth-intro-content">

          <div className="auth-brand">
            🛍️ Online Market
          </div>

          <h2>
            Welcome back!
          </h2>

          <p>
            Sign in to continue shopping,
            manage your orders and enjoy
            a better experience with Online Market.
          </p>

          <div className="auth-benefits">

            <div>
              <span>✓</span>
              Secure account
            </div>

            <div>
              <span>✓</span>
              Easy shopping
            </div>

            <div>
              <span>✓</span>
              Track your orders
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="auth-form-area">

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-mobile-logo">
              🛍️
            </div>

            <h1>
              Sign in
            </h1>

            <p className="auth-subtitle">
              Enter your details to access your account.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>

          )}


          {/* FORM */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}

            </button>

          </form>


          {/* REGISTER */}

          <p className="auth-footer">

            Don't have an account?

            {" "}

            <Link to="/register">
              Create an account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;