import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.profileComplete) {
        navigate('/');
      } else {
        navigate('/setup-profile');
      }
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.username, formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /* ── Animated radar canvas ────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 30 }, () => ({
      x: Math.random(), y: Math.random(),
      born: Math.random() * Math.PI * 2,
      r: 1 + Math.random() * 2,
    }));

    const draw = () => {
      const { width: W, height: H } = canvas;
      const cx = W / 2, cy = H / 2;
      const radius = Math.min(W, H) * 0.42;

      ctx.clearRect(0, 0, W, H);

      // ── grid rings ──
      ctx.strokeStyle = '#00ff4118';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * f, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ── crosshairs ──
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // ── sweep ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -0.6, 0);
      ctx.closePath();
      ctx.fillStyle = '#00ff4122';
      ctx.fill();

      // sweep line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.strokeStyle = '#00ff41cc';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // ── blips ──
      dots.forEach(d => {
        const dx = (d.x * 2 - 1) * radius;
        const dy = (d.y * 2 - 1) * radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) return;

        const dotAngle = Math.atan2(dy, dx);
        let diff = (angle - dotAngle) % (Math.PI * 2);
        if (diff < 0) diff += Math.PI * 2;
        const fade = 1 - diff / (Math.PI * 2);
        if (fade < 0.05) return;

        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, d.r + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,65,${fade * 0.9})`;
        ctx.fill();
      });

      angle += 0.012;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="login-root grid-bg">
      {/* Radar bg */}
      <canvas ref={canvasRef} className="login-radar" />

      <div className="login-panel fade-in">
        {/* Header */}
        <div className="login-header">
          <div className="login-anchor">⚓</div>
          <h1 className="login-title glow">BATTLESHIP WAR</h1>
          <p className="login-sub">NAVAL COMBAT SIMULATION v2.0</p>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span /><span className="login-divider-text">FLEET COMMAND</span><span />
        </div>

        {/* Stats strip */}
        <div className="login-stats">
          {['13×14 GRID','6 SHIPS','AI ENEMY','LEADERBOARD'].map(s => (
            <div key={s} className="login-stat-chip">{s}</div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            LOGIN
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            SIGNUP
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-field">
              <label className="form-label">USERNAME</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-field">
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGNUP')}
          </button>
        </form>

        <div className="login-footer">
          <span className="pulse" style={{color:'#00ff41'}}>●</span>
          &nbsp; SYSTEM ONLINE &nbsp;·&nbsp; SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
}
