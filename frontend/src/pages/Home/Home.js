import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Your AI-Powered
                <span className="gradient-text"> Career Guide</span>
              </h1>
              <p className="hero-description">
                Get personalized career counseling, discover opportunities, and plan your future with our intelligent AI counsellor designed for students from all backgrounds.
              </p>
              <div className="hero-buttons">
                {user ? (
                  <Link to="/chat" className="btn btn-primary">
                    Continue Counseling
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      Get Started Free
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose AI Career Counsellor?</h2>
            <p className="section-description">
              Our platform bridges the gap in career guidance accessibility
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Powered Guidance</h3>
              <p className="feature-description">
                Get personalized career recommendations based on your interests, skills, and academic performance.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Smart Matching</h3>
              <p className="feature-description">
                Advanced algorithms match you with careers that align with your unique profile and aspirations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">
                Monitor your journey with detailed dashboards showing courses, applications, and achievements.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Local Opportunities</h3>
              <p className="feature-description">
                Discover scholarships, courses, and job opportunities available in your area.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;