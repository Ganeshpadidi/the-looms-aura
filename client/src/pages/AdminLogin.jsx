import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/auth/login`, formData);

            // Store token in localStorage
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminUsername', response.data.username);

            // Redirect to dashboard
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="container">
                <div className="login-wrapper">
                    <div className="login-card card">
                        <h1 className="login-title">Admin Login</h1>
                        <p className="login-subtitle">Access the admin dashboard</p>

                        <form onSubmit={handleSubmit} className="login-form">
                            {error && <div className="error-alert">{error}</div>}

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    className="form-input"
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="form-input"
                                    autoComplete="current-password"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="login-hint">
                            <p>Default credentials: admin / secret</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
