import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminProductManager() {
    const [step, setStep] = useState(1); // 1: Collection, 2: Subcollection, 3: Products
    const [collections, setCollections] = useState([]);
    const [subcollections, setSubcollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedSubcollection, setSelectedSubcollection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Product Form
    const [showForm, setShowForm] = useState(false);
    const [productForm, setProductForm] = useState({ name: '', price: '', description: '', image: null });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await axios.get(`${API_URL}/collections`);
            setCollections(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCollectionSelect = async (col) => {
        setSelectedCollection(col);
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/collections/${col.id}/subcollections`);
            setSubcollections(response.data);
            setStep(2);
        } catch (err) {
            console.error(err);
            setMessage('Error fetching subcollections');
        } finally {
            setLoading(false);
        }
    };

    const handleSubcollectionSelect = async (sub) => {
        setSelectedSubcollection(sub);
        setLoading(true);
        // Reset products before fetching to avoid stale data flicker
        setProducts([]);

        try {
            await fetchProducts(sub.id);
            setStep(3);
        } catch (err) {
            console.error("Error in subcollection select:", err);
            // Even if fetch fails, we should modify step so user isn't stuck, 
            // but arguably we should show error. 
            // For now, let's allow entering the step so they can try to add even if list is empty/broken?
            // Actually, if fetch fails, list is empty, same result.
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (subId) => {
        try {
            // Using the specific endpoint for subcollection products
            const response = await axios.get(`${API_URL}/products/subcollection/${subId}`);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]); // Clear on error
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProducts(selectedSubcollection.id);
            setMessage('Product deleted successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to delete product');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductForm({ ...productForm, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const data = new FormData();
            data.append('subcollection_id', selectedSubcollection.id);
            data.append('name', productForm.name);
            data.append('price', productForm.price);
            data.append('description', productForm.description);
            data.append('image', productForm.image);

            await axios.post(`${API_URL}/products`, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Product added successfully');
            setTimeout(() => setMessage(''), 3000);
            setShowForm(false);
            setProductForm({ name: '', price: '', description: '', image: null });
            setPreview(null);
            fetchProducts(selectedSubcollection.id);
        } catch (err) {
            console.error(err);
            setMessage('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-manager">
            {message && <div className="alert alert-success">{message}</div>}

            <div className="breadcrumbs">
                <span onClick={() => setStep(1)} className={step >= 1 ? 'link' : ''}>Collections</span>
                {step >= 2 && (
                    <>
                        <span> › </span>
                        <span onClick={() => setStep(2)} className={step >= 2 ? 'link' : ''}>{selectedCollection?.name}</span>
                    </>
                )}
                {step >= 3 && (
                    <>
                        <span> › </span>
                        <span>{selectedSubcollection?.name}</span>
                    </>
                )}
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            )}

            {!loading && step === 1 && (
                <div className="fade-in">
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Select a Collection</h2>
                    <div className="grid">
                        {collections.map(col => (
                            <div key={col.id} className="selection-card" onClick={() => handleCollectionSelect(col)}>
                                <h3>{col.name}</h3>
                                <p>{col.description || 'No description'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && step === 2 && (
                <div className="fade-in">
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Select a Subcollection</h2>
                    <div className="grid">
                        {subcollections.map(sub => (
                            <div key={sub.id} className="selection-card" onClick={() => handleSubcollectionSelect(sub)}>
                                <h3>{sub.name}</h3>
                                <p>{sub.description || 'No description'}</p>
                            </div>
                        ))}
                        {subcollections.length === 0 && (
                            <div className="empty-message">
                                No subcollections found. Go back to collections management to add one.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!loading && step === 3 && (
                <div className="fade-in">
                    <div className="manager-header">
                        <h2>Products in {selectedSubcollection?.name}</h2>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
                    </div>

                    {showForm && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Add New Product</h3>
                                <form onSubmit={handleProductSubmit}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input className="form-input" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input type="number" className="form-input" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea className="form-input form-textarea" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Product Image</label>
                                        <input type="file" onChange={handleImageChange} required className="form-input" />
                                        {preview && (
                                            <div className="image-preview" style={{ marginTop: '10px', height: '200px' }}>
                                                <img src={preview} alt="Preview" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>Add Product</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="items-list">
                        {products.map(product => (
                            <div key={product.id} className="row-layout">
                                <div className="row-content">
                                    <img
                                        src={`${API_URL}/products/${product.id}/image`}
                                        className="item-thumbnail"
                                        alt={product.name}
                                    />
                                    <div className="item-info">
                                        <h3>{product.name}</h3>
                                        <p style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>₹{product.price}</p>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-small btn-danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <p className="empty-message">No products found in this subcollection.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProductManager;
