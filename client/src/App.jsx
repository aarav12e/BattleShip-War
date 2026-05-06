import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

// ── Guards ─────────────────────────────────────────────────────────────────────

// Shows spinner while AuthContext is loading
const Loader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', flexDirection: 'column', gap: '1rem',
  }}>
    <div style={{
      width: 48, height: 48, border: '3px solid #004410',
      borderTop: '3px solid #00ff41', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ fontFamily: 'Orbitron,monospace', color: '#00ff41', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
      LOADING...
    </p>
  </div>
);

// Requires sign-in AND completed profile setup
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user?.profileComplete) return <Navigate to="/setup-profile" replace />;
  return children;
};

// Only for the setup page: must be signed in, but profile must NOT be complete yet
const SetupRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user?.profileComplete) return <Navigate to="/" replace />;
  return children;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { user } = useAuth();

  // Only show Navbar when signed in AND profile is complete
  const showNavbar = user?.profileComplete;

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login"         element={<Login />} />

        {/* Profile setup — shown exactly once on first sign-up */}
        <Route path="/setup-profile" element={
          <SetupRoute><ProfileSetup /></SetupRoute>
        } />

        {/* Protected game routes */}
        <Route path="/"              element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/leaderboard"   element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
