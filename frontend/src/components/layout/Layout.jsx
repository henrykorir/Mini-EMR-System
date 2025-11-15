// src/components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-show sidebar on desktop, hide on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 1025 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;