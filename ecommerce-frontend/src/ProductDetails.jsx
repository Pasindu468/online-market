
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// Convert backend image paths into full image URLs.
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `http://localhost:8080${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [wishlistSaved, setWishlistSaved] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(""), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/wishlist", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.ok ? response.json() : [])
        .then((items) => setWishlistSaved(items.some((item) => String(item.id) === String(id))))
        .catch(() => setWishlistSaved(false));
    } else {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      window.setTimeout(() => setWishlistSaved(saved.some((item) => String(item) === String(id))), 0);
    }
  }, [id]);

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const response = await fetch(`http://localhost:8080/api/wishlist${wishlistSaved ? `/${id}` : ""}`, {
          method: wishlistSaved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          ...(wishlistSaved ? {} : { body: JSON.stringify({ productId: Number(id) }) }),
        });
        if (!response.ok) throw new Error("Unable to update wishlist.");
      }
      const ids = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const next = wishlistSaved ? ids.filter((item) => String(item) !== String(id)) : [...new Set([...ids, Number(id)])];
      localStorage.setItem("wishlist", JSON.stringify(next));
      setWishlistSaved(!wishlistSaved);
      setMessage(wishlistSaved ? "Removed from your wishlist." : "Saved to your wishlist.");
    } catch (err) { setError(err.message); }
  };
  // LOAD PRODUCT DETAILS
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:8080/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : "Unable to load product details."
          );
        }

        const data = await response.json();
        setProduct(data);
        setQuantity(1);

        const reviewResponse = await fetch(`http://localhost:8080/api/products/${id}/reviews`);
        if (reviewResponse.ok) setReviews(await reviewResponse.json());
      } catch (err) {
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const submitReview = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const response = await fetch(`http://localhost:8080/api/products/${id}/reviews`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: reviewText }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.message || "Unable to submit review."); return; }
    setReviews((current) => [data, ...current]); setReviewText(""); setMessage("Review submitted.");
  };
  // ADD TO CART
  const addToCart = async () => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!product || Number(product.stockQuantity) < quantity) {
      setError("The selected quantity is not available.");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/add?productId=${product.id}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();
      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || "Unable to add product to cart."
        );
      }

      setMessage("Product added to your cart successfully! 🛒");
    } catch (err) {
      setError(err.message || "Unable to add product to cart.");
    } finally {
      setAdding(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="product-details-state">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error && !product) {
    return (
      <div className="product-details-state">
        <div className="product-details-state-icon">⚠️</div>
        <h2>Unable to Load Product</h2>
        <p>{error}</p>

        <Link to="/products" className="details-back-button">
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stock = Number(product.stockQuantity) || 0;
  const price = Number(product.price) || 0;
  const subtotal = price * quantity;

  return (
    <main className="product-details-page">
      <Link to="/products" className="details-back-link">
        ← Back to Products
      </Link>

      <div className="product-details-card">
        {/* PRODUCT IMAGE */}
        <div className="product-details-image">
          {product.imageUrl ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-details-placeholder">🛍️</div>
          )}

          {stock <= 0 && (
            <span className="details-out-of-stock">
              Out of Stock
            </span>
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <section className="product-details-info">
          <span className="details-category">
            {product.category?.name || "Online Market Collection"}
          </span>

          <h1>{product.name}</h1>

          <div className="details-price">
            Rs. {price.toLocaleString()}
          </div>
          <button type="button" className="details-wishlist-button" aria-pressed={wishlistSaved} onClick={toggleWishlist}>{wishlistSaved ? "♥ Saved to Wishlist" : "♡ Add to Wishlist"}</button>

          <div
            className={
              stock > 0
                ? "details-stock details-stock-available"
                : "details-stock details-stock-unavailable"
            }
          >
            {stock > 0
              ? `✓ ${stock} items available`
              : "✕ Currently out of stock"}
          </div>

          <div className="details-divider"></div>

          <h2>Product Description</h2>

          <p className="details-description">
            {product.description ||
              "Discover this quality product from Online Market."}
          </p>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="details-success-message toast-notification" role="status" aria-live="polite">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="details-error-message" role="alert">
              {error}
            </div>
          )}

          {/* QUANTITY AND ADD TO CART */}
          {stock > 0 && (
            <>
              <label className="details-quantity-label">
                Quantity
              </label>

              <div className="details-purchase-row">
                <div className="details-quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    disabled={quantity <= 1 || adding}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(stock, current + 1)
                      )
                    }
                    disabled={quantity >= stock || adding}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="details-add-cart-button"
                  onClick={addToCart}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add to Cart 🛒"}
                </button>
              </div>

              <div className="details-subtotal">
                Subtotal:{" "}
                <strong>
                  Rs. {subtotal.toLocaleString()}
                </strong>
              </div>
            </>
          )}

          <section className="product-reviews">
            <h2>Customer reviews ({reviews.length})</h2>
            {reviews.map((review) => <article key={review.id}><strong>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</strong><p>{review.comment}</p><small>{review.userName} · {new Date(review.createdAt).toLocaleDateString()}</small></article>)}
            <form onSubmit={submitReview}>
              <label>Rating <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option value={value} key={value}>{value} stars</option>)}</select></label>
              <label>Review <textarea value={reviewText} maxLength={1000} required onChange={(event) => setReviewText(event.target.value)} /></label>
              <button type="submit">Submit Review</button>
            </form>
          </section>
          {/* BENEFITS */}
          <div className="details-benefits">
            <div>
              <span>✓</span>
              <p>Secure Shopping</p>
            </div>

            <div>
              <span>✓</span>
              <p>Stock Availability</p>
            </div>
          </div>

          <Link to="/cart" className="details-view-cart">
            View Shopping Cart →
          </Link>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
