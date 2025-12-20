import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCollectionManager from '../components/AdminCollectionManager';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => navigate('/')} className="btn btn-secondary">View Live Site</button>
                        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="card">
                        {/* Unified Manager for Collections > Subcollections > Products */}
                        <AdminCollectionManager />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
