import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isUserAuthenticated, logoutUser } from "../../firebase";
import "./Navbar.css";
import gmLogo from "../../images/gmlogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await isUserAuthenticated();
      setAuthenticated(isAuthenticated);
    };
    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/" className="logo">
        <img src={gmLogo} alt="GM Logo" />
      </Link>
      <div
        className={`menu ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
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
        <li>
          <Link to="/posts-view" className="nav-link">
            Rate My Car
          </Link>
        </li>
        <li>
          <Link to="/organiseevent" className="nav-link">
            Organize an event
          </Link>
        </li>
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
