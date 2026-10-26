
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
  });

  const token = localStorage.getItem("token");

  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role;
    } catch {
      return null;
    }
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // LOAD PRODUCTS AND CATEGORIES
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/categories`),
        ]);

      if (!productsResponse.ok) {
        throw new Error(
          `Products API error: HTTP ${productsResponse.status}`
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          `Categories API error: HTTP ${categoriesResponse.status}`
        );
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!Array.isArray(productsData)) {
        throw new Error("Products API returned an unexpected response.");
      }

      if (!Array.isArray(categoriesData)) {
        throw new Error("Categories API returned an unexpected response.");
      }

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Admin products loading error:", err);
      setError(err.message || "Unable to load products and categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (getUserRole() !== "ADMIN") {
      navigate("/");
      return;
    }

    loadData();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
    });

    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
    setShowForm(false);
  };

  // ADD PRODUCT FORM
  const handleAddProduct = () => {
    setError("");
    setSuccess("");
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");

    setForm({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
    });

    setShowForm(true);
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setError("");
    setSuccess("");
    setEditingProduct(product);
    setImageFile(null);

    setImagePreview(
      product.imageUrl
        ? getImageUrl(product.imageUrl)
        : ""
    );

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      categoryId: product.category?.id
        ? String(product.category.id)
        : "",
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // HANDLE TEXT INPUTS
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SELECT AND PREVIEW IMAGE
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.onerror = () => {
      setError("Unable to preview the selected image.");
    };

    reader.readAsDataURL(file);
  };

  // UPLOAD IMAGE AFTER SAVING PRODUCT
  const uploadImage = async (productId) => {
    if (!imageFile) return null;

    const imageFormData = new FormData();
    imageFormData.append("file", imageFile);

    const response = await fetch(
      `${API_URL}/api/products/${productId}/image`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: imageFormData,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Image upload failed: HTTP ${response.status}`
      );
    }

    return data.imageUrl;
  };

  // ADD OR UPDATE PRODUCT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("Enter a valid product price.");
      return;
    }

    if (
      form.stockQuantity === "" ||
      !Number.isInteger(Number(form.stockQuantity)) ||
      Number(form.stockQuantity) < 0
    ) {
      setError("Enter a valid stock quantity.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a product category.");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        category: {
          id: Number(form.categoryId),
        },
      };

      const isEditing = Boolean(editingProduct);

      const url = isEditing
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Product save failed: HTTP ${response.status}`
        );
      }

      const savedProduct = await response.json();

      if (imageFile) {
        await uploadImage(savedProduct.id);
      }

      setSuccess(
        isEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  // REMOVE PRODUCT FROM THE STORE
  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Remove this product from the store? Past orders will keep their product history."
    );
    if (!confirmed) return;
    setError("");
    setSuccess("");
    setDeletingProductId(productId);
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const text = await response.text();
        let message = text;
        try { message = JSON.parse(text).message || text; } catch { /* keep response text */ }
        throw new Error(message || `Delete failed: HTTP ${response.status}`);
      }
      setSuccess("Product removed from the store. Past orders are preserved.");
      await loadData();
    } catch (err) {
      console.error("Product delete error:", err);
      setError(err.message || "Unable to remove product from the store.");
    } finally {
      setDeletingProductId(null);
    }
  };

  // BUILD IMAGE URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="admin-products">
        <p>Loading products and categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <div>
          <h1>Manage Products</h1>
          <p>Add, edit, and manage your store products.</p>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="admin-add-button"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="admin-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-message success">
          {success}
        </div>
      )}

      {showForm && (
        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
          <h2>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          <label htmlFor="price">Price *</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label htmlFor="stockQuantity">Stock Quantity *</label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={handleChange}
            required
          />

          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <div className="admin-image-upload">
            <label htmlFor="productImage">
              Product Image
            </label>

            <input
              id="productImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />

            <small>
              JPG, PNG, or WEBP. Maximum size: 5 MB.
            </small>

            {imagePreview && (
              <div className="admin-image-preview">
                <img
                  src={imagePreview}
                  alt="Selected product preview"
                />
              </div>
            )}
          </div>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingProduct
                  ? "Update Product"
                  : "Save Product"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-products-table-wrapper">
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.imageUrl ? (
                      <img
                        className="admin-product-thumbnail"
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                      />
                    ) : (
                      <span className="admin-no-image">
                        No image
                      </span>
                    )}
                  </td>

                  <td>
                    <strong>{product.name}</strong>
                    <p>{product.description}</p>
                  </td>

                  <td>
                    Rs. {Number(product.price).toFixed(2)}
                  </td>

                  <td>{product.stockQuantity}</td>

                  <td>
                    {product.category?.name || "Uncategorized"}
                  </td>

                  <td>
                    <div className="admin-product-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? "Removing..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
