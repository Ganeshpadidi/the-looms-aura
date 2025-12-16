import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <div className="hero-logo-container fade-in">
                        <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="The Looms Aura" className="hero-logo" />
                    </div>
                    <Link to="/collections" className="btn btn-primary fade-in" style={{ animationDelay: '0.3s' }}>
                        Explore Collections
                    </Link>
                    <h1 className="hero-title fade-in" style={{ animationDelay: '0.5s' }}>
                        Discover Timeless Elegance
                    </h1>
                    <p className="hero-subtitle fade-in" style={{ animationDelay: '0.7s' }}>
                        Exquisite handcrafted ethnic wear that celebrates tradition and modern aesthetics
                    </p>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose The Looms Aura</h2>
                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">✨</div>
                            <h3>Premium Quality</h3>
                            <p>Handpicked fabrics and meticulous craftsmanship in every piece</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🎨</div>
                            <h3>Unique Designs</h3>
                            <p>Exclusive collections that blend traditional artistry with contemporary style</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🌟</div>
                            <h3>Curated Selection</h3>
                            <p>Carefully selected pieces for every occasion and celebration</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="gradient-text">Ready to Find Your Perfect Look?</h2>
                        <p>Browse our stunning collections of sarees, kurtis, and salwar suits</p>
                        <Link to="/collections" className="btn btn-primary">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
