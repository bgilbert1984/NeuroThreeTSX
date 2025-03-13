import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavigationProps } from '../types';

export const Navigation: React.FC<NavigationProps> = ({ webXRSupported }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          WebXR Portfolio
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Desktop
          </Link>
          
          {webXRSupported && (
            <Link to="/xr" className={location.pathname === '/xr' ? 'active' : ''}>
              Try in VR/AR
            </Link>
          )}
          
          {!webXRSupported && (
            <span className="xr-unsupported">
              VR/AR Not Supported
            </span>
          )}
        </div>
        
        <button 
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Desktop View
          </Link>
          {webXRSupported && (
            <Link to="/xr" onClick={() => setMenuOpen(false)}>
              VR/AR Experience
            </Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navigation;
