import React, { useEffect } from "react";
import "./css/navbar.css";
import { Link, useLocation } from "react-router-dom";
import { useMenu } from "./MenuContext";

/**
 * Renders the main site navigation bar.
 * Uses React Router's Link component for client-side navigation.
 * @returns {JSX.Element} The navigation bar component.
*/
function NavBar() {
  const { menuOpen, toggleMenu, setMenuOpen } = useMenu();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="navbar desktop-nav">
        <ul className="nav-links">
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">Home</Link>
          </li>
          <li className={location.pathname === "/buying" ? "active" : ""}>
            <Link to="/buying">Buying</Link>
          </li>
          <li className={location.pathname === "/selling" ? "active" : ""}>
            <Link to="/selling">Selling</Link>
          </li>
          <li className={location.pathname === "/bookmarks" ? "active" : ""}>
            <Link to="/bookmarks">Bookmarks</Link>
          </li>
          <li className={location.pathname === "/messages" ? "active" : ""}>
            <Link to="/messages">Messages</Link>
          </li>
        </ul>
      </nav>

      {menuOpen && <div className="mobile-overlay" onClick={toggleMenu}></div>}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav>
          <ul>
            <li className={location.pathname === "/" ? "active" : ""}>
              <Link to="/">Home</Link>
            </li>
            <li className={location.pathname === "/buying" ? "active" : ""}>
              <Link to="/buying">Buying</Link>
            </li>
            <li className={location.pathname === "/selling" ? "active" : ""}>
              <Link to="/selling">Selling</Link>
            </li>
            <li className={location.pathname === "/bookmarks" ? "active" : ""}>
              <Link to="/bookmarks">Bookmarks</Link>
            </li>
            <li className={location.pathname === "/messages" ? "active" : ""}>
              <Link to="/messages">Messages</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
export default NavBar;