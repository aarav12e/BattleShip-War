import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--green)',
          padding: '0.3rem 0.6rem',
          cursor: 'pointer',
          fontFamily: 'var(--font-hud)',
          fontSize: '0.55rem',
          letterSpacing: '0.1em',
          transition: 'all 0.15s',
          minHeight: '32px',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'var(--bg)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--green)'; }}
      >
        <Palette size={13} />
        <span className="theme-label-text">THEME</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px #00000088',
          zIndex: 999,
          minWidth: '160px',
          animation: 'fadeIn 0.15s ease',
        }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: theme === t.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-hud)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: 'var(--text)',
                transition: 'background 0.1s',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = theme === t.id ? 'rgba(255,255,255,0.05)' : 'transparent'}
            >
              {/* Color swatches */}
              <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid #ffffff22' }} />
                ))}
              </div>

              <span style={{ flex: 1 }}>{t.label.toUpperCase()}</span>

              {theme === t.id && <Check size={11} style={{ color: 'var(--green)', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
