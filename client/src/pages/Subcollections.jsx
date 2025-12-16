import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './Subcollections.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Subcollections() {
    const { id } = useParams();
    const [subcollections, setSubcollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubcollections();
    }, [id]);

    const fetchSubcollections = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/collections/${id}/subcollections`);
            setSubcollections(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load subcollections. Please try again later.');
            console.error('Error fetching subcollections:', err);
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
        <div className="subcollections-page">
            <div className="container">
                <Link to="/collections" className="back-link">
                    ← Back to Collections
                </Link>

                <h1 className="page-title">Subcollections</h1>

                <div className="subcollections-grid">
                    {subcollections.map((subcollection) => (
                        <Link
                            key={subcollection.id}
                            to={`/subcollections/${subcollection.id}/products`}
                            className="subcollection-card card"
                        >
                            <div className="subcollection-content">
                                <h2>{subcollection.name}</h2>
                                <p>{subcollection.description}</p>
                                <span className="subcollection-link">
                                    View Products →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Subcollections;
