
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist") || "[]"));

  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(""), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:8080/api/wishlist", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Wishlist could not be loaded.")))
      .then((items) => setWishlist(items.map((item) => item.id)))
      .catch((err) => setError(err.message));
  }, []);

  const toggleWishlist = async (id) => {
    const token = localStorage.getItem("token");
    const selected = wishlist.includes(id);
    try {
      if (token) {
        const response = await fetch(`http://localhost:8080/api/wishlist${selected ? `/${id}` : ""}`, {
          method: selected ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          ...(selected ? {} : { body: JSON.stringify({ productId: id }) }),
        });
        if (!response.ok) throw new Error("Unable to update wishlist.");
      }
      const next = selected ? wishlist.filter((item) => item !== id) : [...wishlist, id];
      setWishlist(next);
      localStorage.setItem("wishlist", JSON.stringify(next));
    } catch (err) { setError(err.message); }
  };
  const [addingProductId, setAddingProductId] = useState(null);

  // LOAD PRODUCTS
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/products"
        );

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Load products error:", err);
        setError(
          "Unable to load products. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ADD TO CART
  const addToCart = async (product) => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (Number(product.stockQuantity) <= 0) {
      setError("This product is currently out of stock.");
      return;
    }

    if (addingProductId !== null) {
      return;
    }

    setAddingProductId(product.id);

    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/add?productId=${product.id}&quantity=1`,
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
        const errorMessage =
          typeof data === "string"
            ? data
            : data?.message ||
              data?.error ||
              "Unable to add product to cart.";

        throw new Error(errorMessage);
      }

      setMessage(
        `${product.name} added to your cart successfully! 🛒`
      );
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(err.message || "Unable to add product to cart.");
    } finally {
      setAddingProductId(null);
    }
  };

  // GET CATEGORIES
  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category?.name)
        .filter(Boolean)
    ),
  ];

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "All" ||
      product.category?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === "price-asc") return Number(a.price) - Number(b.price);
    if (sortOrder === "price-desc") return Number(b.price) - Number(a.price);
    if (sortOrder === "name") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  // LOADING
  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // ERROR WHILE LOADING PRODUCTS
  if (error && products.length === 0) {
    return (
      <div className="products-error">
        <div className="error-icon">⚠️</div>
        <h2>Unable to Load Products</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* HEADER */}
      <div className="products-header">
        <div>
          <span className="products-label">OUR COLLECTION</span>
          <h1>Discover Our Products</h1>
          <p>Explore quality products at great prices.</p>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="products-toolbar">
        <div className="search-box">
          <span className="search-icon">🔎</span>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="category-filter">
          <label>Category</label>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="category-filter">
          <label htmlFor="product-sort">Sort by</label>
          <select id="product-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="success-message toast-notification" role="status" aria-live="polite">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* RESULT COUNT */}
      <div className="products-result-count">
        <span>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const stock = Number(product.stockQuantity) || 0;
            const isAdding = addingProductId === product.id;

            return (
              <div className="product-card" key={product.id}>
                <button type="button" className="wishlist-button" aria-label="Toggle wishlist" aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product.id)}>
                  {wishlist.includes(product.id) ? "♥ Saved" : "♡ Add to Wishlist"}
                </button>
                {/* PRODUCT IMAGE */}
                <div className="product-image">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="no-image">🛍️</div>
                  )}

                  {stock <= 0 && (
                    <span className="out-of-stock-badge">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="product-info">
                  <h2>{product.name}</h2>

                  <button
                    type="button"
                    className="view-details-button"
                    onClick={() =>
                      navigate(`/products/${product.id}`)
                    }
                  >
                    View Details →
                  </button>

                  <p className="description">
                    {product.description ||
                      "Quality product from Online Market."}
                  </p>

                  {/* PRICE */}
                  <div className="product-price">
                    Rs. {Number(product.price).toLocaleString()}
                  </div>

                  {/* STOCK */}
                  <div
                    className={
                      stock > 0
                        ? "stock available"
                        : "stock unavailable"
                    }
                  >
                    {stock > 0
                      ? `✓ ${stock} available`
                      : "✕ Out of Stock"}
                  </div>

                  {/* ADD TO CART */}
                  <button
                    type="button"
                    className="cart-button"
                    disabled={stock <= 0 || isAdding}
                    onClick={() => addToCart(product)}
                  >
                    {stock <= 0
                      ? "Out of Stock"
                      : isAdding
                        ? "Adding..."
                        : "Add to Cart 🛒"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-products">
          <div className="no-products-icon">🔍</div>
          <h2>No Products Found</h2>
          <p>Try changing your search or category filter.</p>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
