import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Navbar() {
    const [showCollections, setShowCollections] = useState(false);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showCollections && collections.length === 0) {
            fetchCollections();
        }
    }, [showCollections]);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/collections`);
            setCollections(response.data);
        } catch (err) {
            console.error('Error fetching collections:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div
                    className="navbar-brand-wrapper"
                    onMouseEnter={() => setShowCollections(true)}
                    onMouseLeave={() => setShowCollections(false)}
                >
                    <Link to="/" className="navbar-brand">
                        <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="The Looms Aura Logo" className="navbar-logo" />
                        <h1 className="gradient-text">The Looms Aura</h1>
                    </Link>

                    {showCollections && (
                        <div className="collections-dropdown">
                            <div className="dropdown-header">
                                <h3>Explore Collections</h3>
                            </div>
                            {loading ? (
                                <div className="dropdown-loading">
                                    <div className="mini-spinner"></div>
                                </div>
                            ) : (
                                <div className="dropdown-content">
                                    {collections.map((collection) => (
                                        <Link
                                            key={collection.id}
                                            to={`/collections/${collection.id}/subcollections`}
                                            className="dropdown-item"
                                        >
                                            <span className="dropdown-item-icon">✨</span>
                                            <div>
                                                <div className="dropdown-item-title">{collection.name}</div>
                                                <div className="dropdown-item-desc">{collection.description}</div>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link to="/collections" className="dropdown-view-all">
                                        View All Collections →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/collections" className="nav-link">Collections</Link>
                    <Link to="/admin/login" className="nav-link">Admin</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
