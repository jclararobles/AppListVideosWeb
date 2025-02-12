import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link 
          to="/add-video" 
          className={`nav-link ${location.pathname === '/add-video' ? 'active' : ''}`}
        >
          Videos
        </Link>
        <Link 
          to="/lists" 
          className={`nav-link ${location.pathname === '/lists' ? 'active' : ''}`}
        >
          Lists
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} // Ajustado
        >
          Profile
        </Link>
      </div>

      <style jsx>{`
        .navbar {
          background-color: #003049;
          padding: 1rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-link {
          color: #fefae0;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background-color: #fcbf49;
          color: #003049;
        }

        .nav-link.active {
          background-color: #fcbf49;
          color: #003049;
        }

        @media (max-width: 768px) {
          .nav-links {
            gap: 1rem;
          }

          .nav-link {
            font-size: 1rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
