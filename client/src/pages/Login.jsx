import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Anchor, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.profileComplete) navigate('/');
      else navigate('/setup-profile');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.username, formData.email, formData.password);
      }

      if (!result.success) {
        toast.error(result.error || 'Something went wrong');
      } else if (!isLogin) {
        toast.success('Account created! Setting up your profile...');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
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

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
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
      ctx.strokeStyle = '#00ff4118'; ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(f => { ctx.beginPath(); ctx.arc(cx, cy, radius * f, 0, Math.PI * 2); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();

      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, -0.6, 0); ctx.closePath();
      ctx.fillStyle = '#00ff4122'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(radius, 0);
      ctx.strokeStyle = '#00ff41cc'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();

      dots.forEach(d => {
        const dx = (d.x * 2 - 1) * radius, dy = (d.y * 2 - 1) * radius;
        if (Math.sqrt(dx * dx + dy * dy) > radius) return;
        const dotAngle = Math.atan2(dy, dx);
        let diff = (angle - dotAngle) % (Math.PI * 2); if (diff < 0) diff += Math.PI * 2;
        const fade = 1 - diff / (Math.PI * 2); if (fade < 0.05) return;
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, d.r + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,65,${fade * 0.9})`; ctx.fill();
      });

      angle += 0.012;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="login-root grid-bg">
      <canvas ref={canvasRef} className="login-radar" />

      <div className="login-panel fade-in">
        {/* Header */}
        <div className="login-header">
          <Anchor size={44} style={{ color: 'var(--green)', filter: 'drop-shadow(0 0 8px var(--green))', marginBottom: '0.4rem' }} />
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
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
            <LogIn size={12} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />LOGIN
          </button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
            <UserPlus size={12} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />SIGNUP
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-field">
              <label className="form-label">USERNAME</label>
              <input type="text" name="username" className="form-input"
                placeholder="Choose a username" value={formData.username}
                onChange={handleInputChange} required={!isLogin} />
            </div>
          )}

          <div className="form-field">
            <label className="form-label">EMAIL</label>
            <input type="email" name="email" className="form-input"
              placeholder="Enter your email" value={formData.email}
              onChange={handleInputChange} required />
          </div>

          <div className="form-field">
            <label className="form-label">PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} name="password" className="form-input"
                placeholder="Enter your password" value={formData.password}
                onChange={handleInputChange} required minLength={6}
                style={{ width: '100%', paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span className="login-spinner" /> PROCESSING...
                </span>
              : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'
            }
          </button>
        </form>

        <div className="login-footer">
          <span className="pulse" style={{ color: 'var(--green)' }}>●</span>
          &nbsp; SYSTEM ONLINE &nbsp;·&nbsp; SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
}
