import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/profile-menu.css';

/**
 * ProfileMenu component with improved profile picture handling
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with username, email, profile_picture
 * @param {Function} props.onLogout - Function to call when logging out
 * @returns {JSX.Element} The profile menu component
 */
function ProfileMenu({ user, onLogout }) {
  let navigate = useNavigate();
  let [showMenu, setShowMenu] = useState(false);
  let [imageLoaded, setImageLoaded] = useState(false);
  let [imageFailed, setImageFailed] = useState(false);
  let menuRef = useRef(null);
  let profileRef = useRef(null);

  if (user && user.profile_picture) {
  }

  useEffect(() => {
    let handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  let toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  let handleLogout = () => {
    onLogout();
    setShowMenu(false);
  };

  let handleManageAccount = () => {
    navigate('/account');
    setShowMenu(false);
  };

  if (!user) return null;

  const hasProfilePicture = user.profile_picture && !imageFailed;

  return (
    <div className="profile-menu-container">
      <div 
        className="profile-image-container" 
        onClick={toggleMenu}
        ref={profileRef}
        title={`Logged in as ${user.username}`}
      >
        {hasProfilePicture ? (
          <>
            <img 
              src={`${process.env.REACT_APP_STATIC_BASE}${user.profile_picture}`} 
              alt={`${user.username}'s profile`} 
              className="header-profile-image"
              onLoad={() => {
                setImageLoaded(true);
              }}
              onError={(e) => {
                setImageFailed(true);
              }}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            {!imageLoaded && !imageFailed && (
              <div className="profile-initial">
                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </>
        ) : (
          <div className="profile-initial">
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
      
      {showMenu && (
        <div className="profile-dropdown-menu" ref={menuRef}>
          <div className="menu-user-info">
            <div className="menu-username">{user.username}</div>
            <div className="menu-email">{user.email}</div>
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" onClick={handleManageAccount}>
            <i className="menu-icon account-icon"></i>
            Manage Account
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <i className="menu-icon logout-icon"></i>
            Logout
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;