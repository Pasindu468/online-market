import { useEffect, useState } from "react";
import api from "../services/api";

function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            const response = await api.get("/products");

            setProducts(response.data);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to load products."
            );

        } finally {

            setLoading(false);

        }
    };


    if (loading) {

        return (
            <div>
                <h2>Loading products...</h2>
            </div>
        );

    }


    if (error) {

        return (
            <div>
                <h2>{error}</h2>
                <p>
                    Make sure your Spring Boot backend
                    is running on port 8080.
                </p>
            </div>
        );

    }


    return (
        <div>

            <h1>Our Products</h1>

            {products.length === 0 ? (

                <p>
                    No products available.
                </p>

            ) : (

                <div>

                    {products.map((product) => (

                        <div key={product.id}>

                            <h2>
                                {product.name}
                            </h2>

                            <p>
                                {product.description}
                            </p>

                            <p>
                                Price: Rs. {product.price}
                            </p>

                            <p>
                                Stock: {product.stockQuantity}
                            </p>

                            <button>
                                Add to Cart
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Products;