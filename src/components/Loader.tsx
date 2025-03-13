import React from 'react';
import { motion } from 'framer-motion';
import { LoaderProps } from '../types';

export const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <motion.div 
        className="loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="spinner">
          <svg viewBox="0 0 50 50">
            <circle 
              className="path" 
              cx="25" 
              cy="25" 
              r="20" 
              fill="none" 
              strokeWidth="4"
            />
          </svg>
        </div>
        <motion.p 
          className="loading-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loader;
