import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, LogOut, Trophy, Swords, UserCircle } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Anchor size={18} className="navbar-anchor-icon" strokeWidth={2} />
        <span className="navbar-title glow">BATTLESHIP WAR</span>
      </Link>

      <div className="navbar-links">
        <Link to="/"            className={`nav-link ${pathname === '/'            ? 'nav-active' : ''}`}>
          <Swords size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />PLAY
        </Link>
        <Link to="/leaderboard" className={`nav-link ${pathname === '/leaderboard' ? 'nav-active' : ''}`}>
          <Trophy size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />BOARD
        </Link>
        <Link to="/profile"     className={`nav-link ${pathname === '/profile'     ? 'nav-active' : ''}`}>
          <UserCircle size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />ME
        </Link>
      </div>

      <div className="navbar-user">
        <ThemeSwitcher />
        {user?.picture && <img src={user.picture} alt="" className="navbar-avatar" />}
        <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
        <button className="btn btn-danger navbar-logout" onClick={handleLogout}>
          <LogOut size={13} />
        </button>
      </div>
    </nav>
  );
}
