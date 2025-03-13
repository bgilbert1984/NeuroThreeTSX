import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation = ({ webXRSupported }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Handle scroll events to change nav styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <motion.nav 
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="nav-container">
        <Link to="/" className="logo">
          WebXR<span>Portfolio</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Desktop
          </Link>
          
          {webXRSupported && (
            <Link 
              to="/xr" 
              className={location.pathname === '/xr' ? 'active' : ''}
            >
              WebXR Experience
            </Link>
          )}
          
          {!webXRSupported && (
            <span className="xr-unavailable" title="WebXR not supported on this device">
              WebXR (unavailable)
            </span>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-button ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Desktop Experience
            </Link>
            
            {webXRSupported && (
              <Link to="/xr" onClick={() => setMenuOpen(false)}>
                WebXR Experience
              </Link>
            )}
            
            {!webXRSupported && (
              <span className="xr-unavailable-mobile">
                WebXR Experience (unavailable on this device)
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
