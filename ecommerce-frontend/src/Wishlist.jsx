import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8080";
export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const load = token
      ? fetch(`${API}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load wishlist.")))
      : fetch(`${API}/api/products`).then((response) => response.json()).then((all) => {
        const ids = JSON.parse(localStorage.getItem("wishlist") || "[]");
        return all.filter((product) => ids.includes(product.id));
      });
    load.then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);
  const remove = async (id) => {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(`${API}/api/wishlist/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
    }
    const ids = JSON.parse(localStorage.getItem("wishlist") || "[]").filter((item) => item !== id);
    localStorage.setItem("wishlist", JSON.stringify(ids));
    setProducts((current) => current.filter((product) => product.id !== id));
  };
  return (
    <main className="wishlist-page">
      <header className="wishlist-hero">
        <div className="wishlist-hero-icon">♡</div>
        <div><span>YOUR SAVED PICKS</span><h1>My Wishlist</h1><p>Keep the things you love close by.</p></div>
        <div className="wishlist-count"><strong>{products.length}</strong><span>{products.length === 1 ? "item" : "items"} saved</span></div>
      </header>
      {loading ? <div className="wishlist-empty"><p>Loading your saved items…</p></div> : products.length ? (
        <section className="wishlist-grid" aria-label="Saved products">
          {products.map((product) => (
            <article className="wishlist-card" key={product.id}>
              <Link className="wishlist-card-image" to={`/products/${product.id}`}>
                {product.imageUrl ? <img src={`${API}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`} alt={product.name} /> : <span>🛍️</span>}
              </Link>
              <div className="wishlist-card-content">
                <span className="wishlist-category">{product.category?.name || "ONLINE MARKET PICK"}</span>
                <h2>{product.name}</h2>
                <p className="wishlist-card-description">{product.description || "A little something worth keeping."}</p>
                <div className="wishlist-card-bottom"><strong>Rs. {Number(product.price).toLocaleString()}</strong><span className={Number(product.stockQuantity) > 0 ? "wishlist-in-stock" : "wishlist-out-stock"}>{Number(product.stockQuantity) > 0 ? "In stock" : "Sold out"}</span></div>
                <div className="wishlist-card-actions"><Link to={`/products/${product.id}`}>View product <span>→</span></Link><button type="button" onClick={() => remove(product.id)} aria-label={`Remove ${product.name} from wishlist`}>Remove</button></div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="wishlist-empty"><div>♡</div><h2>Your wishlist is waiting</h2><p>Tap “Add to Wishlist” on anything you like and it’ll be saved here.</p><Link to="/products">Explore the collection <span>→</span></Link></section>
      )}
    </main>
  );
}
