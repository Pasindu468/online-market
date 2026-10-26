```jsx
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">

            {/* ==============================
                HERO SECTION
            ============================== */}

            <section className="home-hero">

                <div className="hero-content">

                    <span className="hero-badge">
                        ✨ Welcome to Online Market
                    </span>

                    <h1>
                        Shop Smart.
                        <br />
                        Live Better.
                    </h1>

                    <p>
                        Discover quality products at great prices,
                        with fast delivery and a secure shopping experience.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/products"
                            className="hero-shop-button"
                        >
                            Shop Now →
                        </Link>

                        <Link
                            to="/products"
                            className="hero-view-button"
                        >
                            View Products
                        </Link>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-circle">
                        🛍️
                    </div>

                    <div className="floating-card card-one">
                        ⭐ Quality
                    </div>

                    <div className="floating-card card-two">
                        🚚 Fast Delivery
                    </div>

                    <div className="floating-card card-three">
                        🔒 Secure
                    </div>

                </div>

            </section>


            {/* ==============================
                FEATURES
            ============================== */}

            <section className="home-features">

                <div className="section-heading">

                    <span>
                        WHY ONLINE MARKET?
                    </span>

                    <h2>
                        Everything You Need in One Place
                    </h2>

                    <p>
                        We make online shopping simple, safe and convenient.
                    </p>

                </div>


                <div className="feature-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🚚
                        </div>

                        <h3>
                            Fast Delivery
                        </h3>

                        <p>
                            Get your products delivered quickly
                            and reliably to your doorstep.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            🔒
                        </div>

                        <h3>
                            Secure Shopping
                        </h3>

                        <p>
                            Your account and shopping experience
                            are protected with secure authentication.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            ⭐
                        </div>

                        <h3>
                            Quality Products
                        </h3>

                        <p>
                            Explore carefully selected products
                            at competitive prices.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            💰
                        </div>

                        <h3>
                            Great Prices
                        </h3>

                        <p>
                            Find products at affordable prices
                            without compromising quality.
                        </p>

                    </div>

                </div>

            </section>


            {/* ==============================
                CALL TO ACTION
            ============================== */}

            <section className="home-cta">

                <div>

                    <h2>
                        Ready to Start Shopping?
                    </h2>

                    <p>
                        Explore our products and find something
                        perfect for you.
                    </p>

                </div>

                <Link
                    to="/products"
                    className="cta-button"
                >
                    Explore Products →
                </Link>

            </section>

        </div>
    );
}

export default Home;
```