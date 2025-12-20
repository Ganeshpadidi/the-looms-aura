import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="instagram-strip">
                    <div className="social-links">
                        <span className="instagram-label">Follow On Instagram</span>
                        <a href="https://www.instagram.com/the_looms_aura" target="_blank" rel="noopener noreferrer" className="instagram-handle">
                            the_looms_aura
                        </a>
                    </div>
                    <div className="contact-info">
                        <span className="contact-label">WhatsApp Us:</span>
                        <a href="https://wa.me/917396102659" target="_blank" rel="noopener noreferrer" className="contact-number">
                            <span className="whatsapp-icon">💬</span> +91 73961 02659
                        </a>
                    </div>
                </div>

                <div className="footer-features">
                    <div className="feature-item">
                        <div className="feature-icon">🚚</div>
                        <div className="feature-text">
                            <h4>Fast Shipping</h4>
                            <p>Standard Shipping</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🔒</div>
                        <div className="feature-text">
                            <h4>Secure Payment</h4>
                            <p>100% risk-free shopping</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">💬</div>
                        <div className="feature-text">
                            <h4>Customer Service</h4>
                            <p>Give us feedback</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} The Looms Aura. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
