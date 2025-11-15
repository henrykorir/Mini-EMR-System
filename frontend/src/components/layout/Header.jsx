// src/components/layout/Header.js
import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-button"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search patients, visits, medications..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="notification-container">
          <button 
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <span className="badge">{notifications.length}</span>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={32} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-content">
                        <p className="notification-title">{notification.title}</p>
                        <p className="notification-time">{notification.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-menu">
          <div className="user-avatar small">
            <User size={16} />
          </div>
          <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'Doctor'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;