import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SignInButton } from '@clerk/clerk-react';
import './Login.css';

export default function Login() {
  const { isSignedIn } = useAuth();
  const navigate       = useNavigate();
  const canvasRef      = useRef(null);

  useEffect(() => { if (isSignedIn) navigate('/'); }, [isSignedIn]);

  /* ── Animated radar canvas ────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
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
      ctx.lineWidth   = 1;
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
      const grad = ctx.createConicalGradient
        ? null
        : (() => {
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          g.addColorStop(0, '#00ff4133');
          g.addColorStop(1, 'transparent');
          return g;
        })();

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
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      // ── blips ──
      dots.forEach(d => {
        const dx   = (d.x * 2 - 1) * radius;
        const dy   = (d.y * 2 - 1) * radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) return;

        const dotAngle  = Math.atan2(dy, dx);
        let   diff      = (angle - dotAngle) % (Math.PI * 2);
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

        {/* Clerk Sign In */}
        <SignInButton mode="redirect">
          <button className="login-google-btn">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 19.000 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            SIGN IN WITH GOOGLE
          </button>
        </SignInButton>

        <p className="login-note">
          ⚡ Powered by Clerk &nbsp;·&nbsp; Secure Authentication
        </p>

        <div className="login-footer">
          <span className="pulse" style={{color:'#00ff41'}}>●</span>
          &nbsp; SYSTEM ONLINE &nbsp;·&nbsp; SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
}
