import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Collections.css';

const API_URL = 'http://localhost:5000/api';

function Collections() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/collections`);
            setCollections(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load collections. Please try again later.');
            console.error('Error fetching collections:', err);
        } finally {
            setLoading(false);
        }
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
        <div className="collections-page">
            <div className="container">
                <h1 className="page-title">Our Collections</h1>
                <p className="page-subtitle">Discover our curated collection of timeless ethnic wear</p>

                <div className="collections-grid">
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            to={`/collections/${collection.id}/subcollections`}
                            className="collection-card card"
                        >
                            <div className="collection-content">
                                <h2>{collection.name}</h2>
                                <p>{collection.description}</p>
                                <span className="collection-link">
                                    Explore →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Collections;
