import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('product');
    const [collections, setCollections] = useState([]);
    const [subcollections, setSubcollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Product Form State
    const [productForm, setProductForm] = useState({
        subcollection_id: '',
        name: '',
        price: '',
        description: '',
        image: null
    });
    const [preview, setPreview] = useState(null);

    // Collection Form State
    const [collectionForm, setCollectionForm] = useState({
        name: '',
        description: ''
    });

    // Subcollection Form State
    const [subcollectionForm, setSubcollectionForm] = useState({
        collection_id: '',
        name: '',
        description: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        fetchCollections();
        fetchSubcollections();
        fetchProducts();
    }, [navigate]);

    const fetchCollections = async () => {
        try {
            const response = await axios.get(`${API_URL}/collections`);
            setCollections(response.data);
        } catch (err) {
            console.error('Error fetching collections:', err);
        }
    };

    const fetchSubcollections = async () => {
        try {
            const response = await axios.get(`${API_URL}/products/subcollections/all`);
            setSubcollections(response.data);
        } catch (err) {
            console.error('Error fetching subcollections:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }
            setProductForm(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCollectionChange = (e) => {
        const { name, value } = e.target;
        setCollectionForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubcollectionChange = (e) => {
        const { name, value } = e.target;
        setSubcollectionForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!productForm.subcollection_id || !productForm.name || !productForm.price || !productForm.image) {
            setMessage({ type: 'error', text: 'Please fill all required fields' });
            return;
        }

        const token = localStorage.getItem('adminToken');
        const formDataToSend = new FormData();
        Object.keys(productForm).forEach(key => {
            formDataToSend.append(key, productForm[key]);
        });

        try {
            setLoading(true);
            await axios.post(`${API_URL}/products`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Product added successfully!' });
            setProductForm({ subcollection_id: '', name: '', price: '', description: '', image: null });
            setPreview(null);
            document.getElementById('image').value = '';
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create product' });
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionSubmit = async (e) => {
        e.preventDefault();
        if (!collectionForm.name) {
            setMessage({ type: 'error', text: 'Name is required' });
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            setLoading(true);
            await axios.post(`${API_URL}/collections`, collectionForm, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Collection added successfully!' });
            setCollectionForm({ name: '', description: '' });
            fetchCollections(); // Refresh list
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create collection' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubcollectionSubmit = async (e) => {
        e.preventDefault();
        if (!subcollectionForm.collection_id || !subcollectionForm.name) {
            setMessage({ type: 'error', text: 'Collection and Name are required' });
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            setLoading(true);
            await axios.post(`${API_URL}/collections/${subcollectionForm.collection_id}/subcollections`, subcollectionForm, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Subcollection added successfully!' });
            setSubcollectionForm({ collection_id: '', name: '', description: '' });
            fetchSubcollections(); // Refresh list
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create subcollection' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCollection = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all subcollections and products under it.`)) {
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/collections/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Collection deleted successfully!' });
            fetchCollections();
            fetchSubcollections();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete collection' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubcollection = async (collectionId, subcollectionId, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all products under it.`)) {
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/collections/${collectionId}/subcollections/${subcollectionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Subcollection deleted successfully!' });
            fetchSubcollections();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete subcollection' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        const token = localStorage.getItem('adminToken');
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Product deleted successfully!' });
            fetchProducts();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete product' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">Manage your store content</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('product'); setMessage({ type: '', text: '' }); }}
                    >
                        Add Product
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'collection' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('collection'); setMessage({ type: '', text: '' }); }}
                    >
                        Add Collection
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'subcollection' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('subcollection'); setMessage({ type: '', text: '' }); }}
                    >
                        Add Subcollection
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'manage-collections' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('manage-collections'); setMessage({ type: '', text: '' }); }}
                    >
                        Manage Collections
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'manage-subcollections' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('manage-subcollections'); setMessage({ type: '', text: '' }); }}
                    >
                        Manage Subcollections
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'manage-products' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('manage-products'); setMessage({ type: '', text: '' }); }}
                    >
                        Manage Products
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="card">
                        <h2>
                            {activeTab === 'product' && 'Add New Product'}
                            {activeTab === 'collection' && 'Add New Collection'}
                            {activeTab === 'subcollection' && 'Add New Subcollection'}
                            {activeTab === 'manage-collections' && 'Manage Collections'}
                            {activeTab === 'manage-subcollections' && 'Manage Subcollections'}
                            {activeTab === 'manage-products' && 'Manage Products'}
                        </h2>

                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'product' && (
                            <form onSubmit={handleProductSubmit} className="product-form">
                                <div className="form-group">
                                    <label>Subcollection *</label>
                                    <select name="subcollection_id" value={productForm.subcollection_id} onChange={handleProductChange} className="form-input" required>
                                        <option value="">Select Subcollection</option>
                                        {subcollections.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.collection_name} - {sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input type="text" name="name" value={productForm.name} onChange={handleProductChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input type="number" name="price" value={productForm.price} onChange={handleProductChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={productForm.description} onChange={handleProductChange} className="form-input form-textarea" rows="4" />
                                </div>
                                <div className="form-group">
                                    <label>Image *</label>
                                    <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="form-input" required />
                                </div>
                                {preview && <div className="image-preview"><img src={preview} alt="Preview" /></div>}
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
                            </form>
                        )}

                        {activeTab === 'collection' && (
                            <form onSubmit={handleCollectionSubmit} className="product-form">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input type="text" name="name" value={collectionForm.name} onChange={handleCollectionChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={collectionForm.description} onChange={handleCollectionChange} className="form-input form-textarea" rows="4" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Collection'}</button>
                            </form>
                        )}

                        {activeTab === 'subcollection' && (
                            <form onSubmit={handleSubcollectionSubmit} className="product-form">
                                <div className="form-group">
                                    <label>Parent Collection *</label>
                                    <select name="collection_id" value={subcollectionForm.collection_id} onChange={handleSubcollectionChange} className="form-input" required>
                                        <option value="">Select Collection</option>
                                        {collections.map(col => (
                                            <option key={col.id} value={col.id}>{col.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input type="text" name="name" value={subcollectionForm.name} onChange={handleSubcollectionChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={subcollectionForm.description} onChange={handleSubcollectionChange} className="form-input form-textarea" rows="4" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Subcollection'}</button>
                            </form>
                        )}

                        {activeTab === 'manage-collections' && (
                            <div className="manage-section">
                                {collections.length === 0 ? (
                                    <p className="empty-message">No collections found. Add one from the "Add Collection" tab.</p>
                                ) : (
                                    <div className="items-list">
                                        {collections.map(collection => (
                                            <div key={collection.id} className="item-card">
                                                <div className="item-info">
                                                    <h3>{collection.name}</h3>
                                                    <p>{collection.description || 'No description'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                                                    className="btn btn-danger"
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'manage-subcollections' && (
                            <div className="manage-section">
                                {subcollections.length === 0 ? (
                                    <p className="empty-message">No subcollections found. Add one from the "Add Subcollection" tab.</p>
                                ) : (
                                    <div className="items-list">
                                        {subcollections.map(subcollection => (
                                            <div key={subcollection.id} className="item-card">
                                                <div className="item-info">
                                                    <h3>{subcollection.name}</h3>
                                                    <p className="item-parent">Parent: {subcollection.collection_name}</p>
                                                    <p>{subcollection.description || 'No description'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSubcollection(subcollection.collection_id, subcollection.id, subcollection.name)}
                                                    className="btn btn-danger"
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'manage-products' && (
                            <div className="manage-section">
                                {products.length === 0 ? (
                                    <p className="empty-message">No products found. Add one from the "Add Product" tab.</p>
                                ) : (
                                    <div className="items-list">
                                        {products.map(product => (
                                            <div key={product.id} className="item-card product-card">
                                                <div className="item-image" style={{ width: '60px', height: '60px', marginRight: '1rem' }}>
                                                    <img
                                                        src={`${API_URL}/products/${product.id}/image`}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div className="item-info">
                                                    <h3>{product.name}</h3>
                                                    <p style={{ fontWeight: 'bold' }}>₹{product.price}</p>
                                                    <p className="item-parent">{product.collection_name} &gt; {product.subcollection_name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    className="btn btn-danger"
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
