import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const API_URL = 'http://localhost:5000/api';

function Products() {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [id]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/products/subcollection/${id}`);
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load products. Please try again later.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (productId) => {
        return `${API_URL}/products/${productId}/image`;
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="container">
                <Link to="/collections" className="back-link">
                    ← Back to Collections
                </Link>

                <h1 className="page-title">Products</h1>

                {products.length === 0 ? (
                    <div className="no-products">
                        <p>No products available in this subcollection yet.</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product.id} className="product-card card">
                                <div className="product-image-wrapper">
                                    <img
                                        src={getImageUrl(product.id)}
                                        alt={product.name}
                                        className="product-image"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                                    {product.description && (
                                        <p className="product-description">{product.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
