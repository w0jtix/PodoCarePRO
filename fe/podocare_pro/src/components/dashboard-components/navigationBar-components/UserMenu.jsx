import React from 'react'
import { useState, useEffect, useRef } from 'react';

const UserMenu = () => {

  const [isMenuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef && !menuRef.current.contains(event.target)) {
        setMenuVisible(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => { document.removeEventListener('mousedown', handleClickOutside)
  };
  }, []);

  
  return (
    <div className="user-menu" ref={menuRef}>
      <div className="user-menu-header" onClick={toggleMenu}>
        <img src="src/assets/user_profile_picture.png" alt="profile picture" className="nav-pfp"/>
        <h2 className="username">User</h2>       
        <button className="dropdown-button">
            <img 
              src="src/assets/arrow_down.svg" 
              alt="arrow down" 
              className={`arrow-down ${isMenuVisible ? 'rotated' : ''}`}/>
        </button>
      </div>
      
        {isMenuVisible && (       
          <div  
            className="user-menu-dropdown dropdown-menu visible"
            onClick={(e) => e.stopPropagation()} 
          >
            <button className="user-menu-button">
              <a href="/profile">Profile</a>
            </button>
            <button className="user-menu-button">
              <a href="/settings">Settings</a>
            </button>
            <button className="user-menu-button">
              <a href="/logout" className="logout-a">Logout</a>
            </button>
          </div>             
      )}
    </div>
  )
}

export default UserMenu
