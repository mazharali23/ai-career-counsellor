import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-icon">🎯</span>
          <span className="logo-text">AI Career Counsellor</span>
        </Link>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/chat" 
                className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Chat
              </Link>
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/opportunities" 
                className={`nav-link ${location.pathname === '/opportunities' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Opportunities
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="nav-link register-btn"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
        
        <div className="hamburger" onClick={toggleMenu}>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'active' : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
