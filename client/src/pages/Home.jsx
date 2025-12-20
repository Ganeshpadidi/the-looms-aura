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
                    <h1 className="hero-title fade-in" style={{ animationDelay: '0.3s' }}>
                        Welcome to The Looms Aura
                    </h1>
                    <p className="hero-subtitle fade-in" style={{ animationDelay: '0.5s' }}>
                        Where tradition meets contemporary sophistication
                    </p>
                    <Link to="/collections" className="btn btn-primary fade-in" style={{ animationDelay: '0.7s' }}>
                        Explore Collections
                    </Link>
                </div>
            </section>

            <section className="our-story fade-in">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-content">
                            <h2 className="gradient-text">Our Story</h2>
                            <p className="story-lead">
                                Step into a world where threads weave tales of tradition, and every garment is a masterpiece of timeless elegance.
                            </p>
                            <p>
                                At The Looms Aura, we believe in more than just weaving fabrics; we craft stories. Each stroke of the shuttle, each intricate pattern, carries with it the essence of centuries-old artistry, passed down through generations of skilled artisans. From the vibrant hues of our sarees to the intricate embroidery of our lehengas, every creation is a labor of love, meticulously crafted to adorn you in unmatched grace and style.
                            </p>
                            <p>
                                Our journey is not just about preserving tradition; it's about reinventing it. Through innovative designs and modern techniques, we breathe new life into age-old crafts, ensuring that every piece resonates with the pulse of contemporary fashion while staying true to our roots.
                            </p>
                            <p>
                                Step into our world of handlooms, where every thread tells a story, and every garment is a testament to the timeless beauty of Indian craftsmanship. Indulge in the luxury of tradition with The Looms Aura – where artistry meets elegance, and every creation is a masterpiece in its own right.
                            </p>
                        </div>
                        <div className="story-image">
                            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="The Looms Aura" className="faded-logo" />
                        </div>
                    </div>
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
