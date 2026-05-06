import { Anchor } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg)',
      gap: '1.5rem',
    }}>
      {/* Animated anchor icon */}
      <div style={{ animation: 'loadSpin 1.4s ease-in-out infinite', color: 'var(--green)', filter: 'drop-shadow(0 0 12px var(--green))' }}>
        <Anchor size={52} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.1rem',
        fontWeight: 900,
        color: 'var(--green)',
        letterSpacing: '0.25em',
        textShadow: 'var(--glow)',
      }}>
        BATTLESHIP WAR
      </div>

      {/* Subtitle with blinking dots */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '0.6rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.3em',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        INITIALIZING SYSTEMS...
      </div>

      {/* Progress bar */}
      <div style={{
        width: '160px',
        height: '2px',
        background: 'var(--bg2)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--green)',
          boxShadow: 'var(--glow)',
          animation: 'loadBar 1.4s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes loadSpin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes loadBar {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 70%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
