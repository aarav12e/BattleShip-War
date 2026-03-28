import { Link, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user }         = useAuth();
  const { signOut }      = useClerk();
  const { pathname }     = useLocation();

  const handleLogout = () => signOut({ redirectUrl: '/login' });

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-anchor">⚓</span>
        <span className="navbar-title glow">BATTLESHIP WAR</span>
      </Link>

      <div className="navbar-links">
        <Link to="/"            className={`nav-link ${pathname === '/'            ? 'nav-active' : ''}`}>PLAY</Link>
        <Link to="/leaderboard" className={`nav-link ${pathname === '/leaderboard' ? 'nav-active' : ''}`}>LEADERBOARD</Link>
        <Link to="/profile"     className={`nav-link ${pathname === '/profile'     ? 'nav-active' : ''}`}>PROFILE</Link>
      </div>

      <div className="navbar-user">
        {user?.picture && <img src={user.picture} alt="" className="navbar-avatar" />}
        <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
        <button className="btn btn-danger navbar-logout" onClick={handleLogout}>LOGOUT</button>
      </div>
    </nav>
  );
}
