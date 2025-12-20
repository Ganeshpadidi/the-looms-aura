import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminCollectionManager() {
    // View state: 'collections' | 'subcollections' | 'products'
    const [view, setView] = useState('collections');

    // Selection state
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedSubcollection, setSelectedSubcollection] = useState(null);

    // Data state
    const [items, setItems] = useState([]); // Used for collections & subcollections
    const [products, setProducts] = useState([]); // Used for products view

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form state (Generic for Coll/Subcoll, Specific for Products)
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    // Product Form State
    const [productForm, setProductForm] = useState({ name: '', price: '', description: '', image: null });
    const [productPreview, setProductPreview] = useState(null);

    useEffect(() => {
        if (view === 'products') {
            fetchProducts(selectedSubcollection.id);
        } else {
            fetchItems();
        }
    }, [view, selectedCollection, selectedSubcollection]);

    // --- Collections & Subcollections Logic ---

    const fetchItems = async () => {
        setLoading(true);
        setError('');
        setItems([]);
        try {
            let url = `${API_URL}/collections`;
            if (view === 'subcollections' && selectedCollection) {
                url = `${API_URL}/collections/${selectedCollection.id}/subcollections`;
            }

            const response = await axios.get(url);
            setItems(response.data);
        } catch (err) {
            setError('Failed to fetch items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            let url = `${API_URL}/collections`;
            if (view === 'subcollections' && selectedCollection) {
                url = `${API_URL}/collections/${selectedCollection.id}/subcollections`;
            }

            if (editingItem) {
                // Update
                if (view === 'subcollections') {
                    await axios.put(`${API_URL}/collections/${selectedCollection.id}/subcollections/${editingItem.id}`, formData, { headers });
                } else {
                    await axios.put(`${url}/${editingItem.id}`, formData, { headers });
                }
                setMessage('Item updated successfully');
            } else {
                // Create
                await axios.post(url, formData, { headers });
                setMessage('Item created successfully');
            }

            setFormData({ name: '', description: '' });
            setShowForm(false);
            setEditingItem(null);
            fetchItems();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure? This action is irreversible.')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            if (view === 'collections') {
                await axios.delete(`${API_URL}/collections/${id}`, { headers });
            } else {
                await axios.delete(`${API_URL}/collections/${selectedCollection.id}/subcollections/${id}`, { headers });
            }
            setMessage('Deleted successfully');
            fetchItems();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Failed to delete item');
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (direction, index) => {
        if (index < 0 || index >= items.length) return;

        const newItems = [...items];
        const item = newItems[index];

        if (direction === 'up' && index > 0) {
            newItems[index] = newItems[index - 1];
            newItems[index - 1] = item;
        } else if (direction === 'down' && index < newItems.length - 1) {
            newItems[index] = newItems[index + 1];
            newItems[index + 1] = item;
        } else {
            return;
        }

        setItems(newItems); // Optimistic update

        try {
            const token = localStorage.getItem('adminToken');
            const orderedIds = newItems.map(i => i.id);
            const endpoint = view === 'collections'
                ? `${API_URL}/collections/reorder`
                : `${API_URL}/collections/${selectedCollection.id}/subcollections/reorder`;

            await axios.put(endpoint, { orderedIds }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            setError('Failed to save order');
            fetchItems(); // Revert on error
        }
    };

    // --- Product Logic (Merged from AdminProductManager) ---

    const fetchProducts = async (subId) => {
        setLoading(true);
        setProducts([]);
        try {
            const response = await axios.get(`${API_URL}/products/subcollection/${subId}`);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductForm({ ...productForm, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setProductPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('adminToken');
            const data = new FormData();
            data.append('subcollection_id', selectedSubcollection.id);
            data.append('name', productForm.name);
            data.append('price', productForm.price);
            data.append('description', productForm.description);
            if (productForm.image) {
                data.append('image', productForm.image);
            }

            await axios.post(`${API_URL}/products`, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Product added successfully');
            setShowForm(false);
            setProductForm({ name: '', price: '', description: '', image: null });
            setProductPreview(null);
            fetchProducts(selectedSubcollection.id);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Product deleted successfully');
            fetchProducts(selectedSubcollection.id);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };


    // --- Render Helpers ---

    const renderHeader = () => (
        <div className="manager-header">
            <div className="breadcrumbs">
                <span
                    onClick={() => { setView('collections'); setSelectedCollection(null); setSelectedSubcollection(null); }}
                    className={view !== 'collections' ? 'link' : ''}
                >
                    Collections
                </span>
                {selectedCollection && (
                    <>
                        <span> › </span>
                        <span
                            onClick={() => { setView('subcollections'); setSelectedSubcollection(null); }}
                            className={view === 'products' ? 'link' : ''}
                        >
                            {selectedCollection.name}
                        </span>
                    </>
                )}
                {selectedSubcollection && (
                    <>
                        <span> › </span>
                        <span>{selectedSubcollection.name}</span>
                    </>
                )}
            </div>

            <button className="btn btn-primary" onClick={() => {
                setShowForm(true);
                setEditingItem(null);
                setFormData({ name: '', description: '' });
                setProductForm({ name: '', price: '', description: '', image: null });
                setProductPreview(null);
            }}>
                + Add {view === 'collections' ? 'Collection' : view === 'subcollections' ? 'Subcollection' : 'Product'}
            </button>
        </div>
    );

    return (
        <div className="collection-manager">
            {renderHeader()}

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>
                            {view === 'products' ? 'Add Product' : (editingItem ? 'Edit ' : 'Add ') + (view === 'collections' ? 'Collection' : 'Subcollection')}
                        </h3>

                        {view === 'products' ? (
                            // PRODUCT FORM
                            <form onSubmit={handleSaveProduct}>
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
                                    <label>Image</label>
                                    <input type="file" onChange={handleProductImageChange} required className="form-input" />
                                    {productPreview && (
                                        <div className="image-preview" style={{ marginTop: '10px', height: '150px' }}>
                                            <img src={productPreview} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>Save Product</button>
                                </div>
                            </form>
                        ) : (
                            // COLLECTION/SUBCOLLECTION FORM
                            <form onSubmit={handleSaveItem}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* List View */}
            <div className="items-list fade-in">
                {view !== 'products' && items.map((item, index) => (
                    <div key={item.id} className="row-layout">
                        <div className="row-content">
                            <div className="item-info">
                                <h3>{item.name}</h3>
                                <p>{item.description || 'No description'}</p>
                            </div>
                        </div>

                        <div className="item-actions">
                            <button className="btn-icon" disabled={index === 0} onClick={() => handleReorder('up', index)} title="Move Up">⬆️</button>
                            <button className="btn-icon" disabled={index === items.length - 1} onClick={() => handleReorder('down', index)} title="Move Down">⬇️</button>

                            <button className="btn-small btn-edit" onClick={() => { setEditingItem(item); setFormData({ name: item.name, description: item.description }); setShowForm(true); }}>
                                Edit
                            </button>

                            {view === 'collections' && (
                                <button className="btn-small btn-info" onClick={() => { setSelectedCollection(item); setView('subcollections'); }}>
                                    Subcollections
                                </button>
                            )}

                            {view === 'subcollections' && (
                                <button className="btn-small btn-info" onClick={() => { setSelectedSubcollection(item); setView('products'); }}>
                                    Manage Products
                                </button>
                            )}

                            <button className="btn-small btn-danger" onClick={() => handleDeleteItem(item.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                {/* Product List View */}
                {view === 'products' && products.map((product) => (
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

                {!loading && ((view !== 'products' && items.length === 0) || (view === 'products' && products.length === 0)) && (
                    <p className="empty-message">No items found. Click "+ Add {view === 'collections' ? 'Collection' : view === 'subcollections' ? 'Subcollection' : 'Product'}" to start.</p>
                )}
            </div>
        </div>
    );
}

export default AdminCollectionManager;
