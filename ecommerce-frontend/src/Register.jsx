import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  // ==========================================
  // REGISTER USER
  // ==========================================

  const handleRegister = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {

      setError(
        "Please fill in all fields."
      );

      setLoading(false);

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      setLoading(false);

      return;
    }


    try {

      // ==========================================
      // SEND REGISTER REQUEST
      // ==========================================

      const response = await fetch(
        "http://localhost:8080/api/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password
          })
        }
      );


      const data = await response.json();


      // ==========================================
      // CHECK RESPONSE
      // ==========================================

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Registration failed."
        );
      }




      // ==========================================
      // SUCCESS MESSAGE
      // ==========================================

      setSuccess(
        "Registration successful! You can now login."
      );


      // ==========================================
      // CLEAR FORM
      // ==========================================

      setName("");
      setEmail("");
      setPassword("");


      // ==========================================
      // GO TO LOGIN
      // ==========================================

      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
        "Registration failed."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================
  // REGISTER PAGE
  // ==========================================

  return (

    <div className="auth-page">

      {/* ======================================
          LEFT SIDE
          ====================================== */}

      <div className="auth-intro">

        <div className="auth-intro-content">

          <div className="auth-brand">
            🛍️ Online Market
          </div>

          <h2>
            Join Online Market today!
          </h2>

          <p>
            Create your account and start
            discovering quality products at
            great prices.
          </p>


          {/* BENEFITS */}

          <div className="auth-benefits">

            <div>
              <span>✓</span>
              Quick and easy registration
            </div>

            <div>
              <span>✓</span>
              Secure account
            </div>

            <div>
              <span>✓</span>
              Easy order tracking
            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          RIGHT SIDE
          ====================================== */}

      <div className="auth-form-area">

        <div className="auth-card">

          {/* HEADER */}

          <div className="auth-card-header">

            <div className="auth-mobile-logo">
              🛍️
            </div>

            <h1>
              Create account
            </h1>

            <p className="auth-subtitle">
              Fill in your details to create your
              Online Market account.
            </p>

          </div>


          {/* ==================================
              ERROR MESSAGE
              ================================== */}

          {error && (

            <div className="auth-error">

              <span>
                ⚠️
              </span>

              {error}

            </div>

          )}


          {/* ==================================
              SUCCESS MESSAGE
              ================================== */}

          {success && (

            <div className="auth-success">

              <span>
                ✓
              </span>

              {success}

            </div>

          )}


          {/* ==================================
              REGISTER FORM
              ================================== */}

          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
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

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <p className="password-hint">
                Password must contain at least 6 characters.
              </p>

            </div>


            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="button-spinner"></span>
                  Creating account...
                </>

              ) : (

                "Create account"

              )}

            </button>

          </form>


          {/* ==================================
              LOGIN LINK
              ================================== */}

          <p className="auth-footer">

            Already have an account?

            {" "}

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;