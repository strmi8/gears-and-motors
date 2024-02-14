import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isUserAuthenticated, logoutUser } from "../../firebase";
import gmLogo from "../../images/gmlogo.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hamburgerClicked, setHamburgerClicked] = useState(false);
  const [rateCarMenuOpen, setRateCarMenuOpen] = useState(false);
  const [eventsMenuOpen, setEventsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 750);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 750);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await isUserAuthenticated();
      setAuthenticated(isAuthenticated);
    };
    checkAuthentication();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSmallScreen) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !event.target.classList.contains("menu")
        ) {
          setMenuOpen(false);
          setRateCarMenuOpen(false);
          setEventsMenuOpen(false);
        }
      } else {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !event.target.classList.contains("menu") &&
          !event.target.closest(".rate-car-container") &&
          !event.target.closest(".events-container")
        ) {
          setMenuOpen(false);
          setRateCarMenuOpen(false);
          setEventsMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSmallScreen]);

  const handleLogout = async () => {
    await logoutUser();
    setAuthenticated(false);
    navigate("/login");
  };

  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!menuOpen) {
      setMenuOpen(true);
      setHamburgerClicked(true);
      setRateCarMenuOpen(false);
      setEventsMenuOpen(false);
    } else {
      setMenuOpen(false);
      setHamburgerClicked(false);
    }
  };

  const toggleRateCarMenu = () => {
    setRateCarMenuOpen((prevRateCarMenuOpen) => !prevRateCarMenuOpen);
    setEventsMenuOpen(false);
  };

  const toggleEventsMenu = () => {
    setEventsMenuOpen((prevEventsMenuOpen) => !prevEventsMenuOpen);
    setRateCarMenuOpen(false);
  };

  return (
    <nav>
      <Link to="/" className="logo">
        <img src={gmLogo} alt="GM Logo" />
      </Link>
      <div
        className={`menu ${menuOpen ? "open" : ""}`}
        onMouseDown={(event) => toggleMenu(event)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""} ref={dropdownRef}>
        <li>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/gallery" className="nav-link">
            Gallery
          </Link>
        </li>
        {isSmallScreen && hamburgerClicked && (
          <>
            <li>
              <Link to="/create-post" className="nav-link">
                Create Post
              </Link>
            </li>
            <li>
              <Link to="/posts-view" className="nav-link">
                View Posts
              </Link>
            </li>
            <li>
              <Link to="/view-events" className="nav-link">
                View events
              </Link>
            </li>
            <li>
              <Link to="/organize-event" className="nav-link">
                Organize an event
              </Link>
            </li>
          </>
        )}
        {!isSmallScreen && (
          <>
            <li className={`dropdown ${rateCarMenuOpen ? "highlight" : ""}`}>
              <div className="rate-car-container">
                <span
                  className={`nav-link ${rateCarMenuOpen ? "highlighted" : ""}`}
                  onClick={toggleRateCarMenu}
                >
                  Rate my car
                </span>
                <ul
                  className={
                    rateCarMenuOpen ? "dropdown-menu open" : "dropdown-menu"
                  }
                >
                  <li>
                    <Link to="/create-post" className="nav-link">
                      Create Post
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts-view" className="nav-link">
                      View Posts
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li className={`dropdown ${eventsMenuOpen ? "highlight" : ""}`}>
              <div className="events-container">
                <span
                  className={`nav-link ${eventsMenuOpen ? "highlighted" : ""}`}
                  onClick={toggleEventsMenu}
                >
                  Events
                </span>
                <ul
                  className={
                    eventsMenuOpen ? "dropdown-menu open" : "dropdown-menu"
                  }
                >
                  <li>
                    <Link to="/view-events" className="nav-link">
                      View events
                    </Link>
                  </li>
                  <li>
                    <Link to="/organize-event" className="nav-link">
                      Organize an event
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </>
        )}

        {authenticated ? (
          <li>
            <Link className="nav-link" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
