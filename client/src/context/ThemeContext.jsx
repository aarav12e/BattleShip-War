import { createContext, useContext, useEffect, useState } from 'react';

// ── 5 Themes ─────────────────────────────────────────────────────────
export const THEMES = [
  {
    id: 'forest',
    label: 'Forest',
    daisy: 'forest',
    accent: '#00ff41',
    bg: '#060b14',
    preview: ['#060b14', '#00ff41', '#004410'],
  },
  {
    id: 'night',
    label: 'Night',
    daisy: 'night',
    accent: '#4f8ef7',
    bg: '#0c0e1a',
    preview: ['#0c0e1a', '#4f8ef7', '#1e3a6e'],
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    daisy: 'cyberpunk',
    accent: '#ffcc00',
    bg: '#0f0f0f',
    preview: ['#0f0f0f', '#ffcc00', '#ff0055'],
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    daisy: 'synthwave',
    accent: '#e779c1',
    bg: '#1a0533',
    preview: ['#1a0533', '#e779c1', '#58c7f3'],
  },
  {
    id: 'black',
    label: 'Stealth',
    daisy: 'black',
    accent: '#a0a0a0',
    bg: '#000000',
    preview: ['#000000', '#a0a0a0', '#333333'],
  },
];

// ── CSS variable overrides per theme ─────────────────────────────────
const THEME_VARS = {
  forest: {
    '--green':      '#00ff41',
    '--green-dim':  '#00aa2a',
    '--green-dark': '#004410',
    '--bg':         '#060b14',
    '--bg2':        '#0a1220',
    '--bg3':        '#0f1a2e',
    '--text':       '#ccffcc',
    '--text-dim':   '#668866',
    '--border':     '#00ff4133',
    '--glow':       '0 0 8px #00ff4166, 0 0 16px #00ff4133',
    '--glow-red':   '0 0 8px #ff222266, 0 0 16px #ff222233',
  },
  night: {
    '--green':      '#4f8ef7',
    '--green-dim':  '#2860cc',
    '--green-dark': '#0d2a5e',
    '--bg':         '#0c0e1a',
    '--bg2':        '#12162a',
    '--bg3':        '#181d38',
    '--text':       '#c0d4ff',
    '--text-dim':   '#4a6080',
    '--border':     '#4f8ef733',
    '--glow':       '0 0 8px #4f8ef766, 0 0 16px #4f8ef733',
    '--glow-red':   '0 0 8px #ff222266, 0 0 16px #ff222233',
  },
  cyberpunk: {
    '--green':      '#ffcc00',
    '--green-dim':  '#cc9900',
    '--green-dark': '#664d00',
    '--bg':         '#0f0f0f',
    '--bg2':        '#1a1a1a',
    '--bg3':        '#222222',
    '--text':       '#fff5cc',
    '--text-dim':   '#806030',
    '--border':     '#ffcc0033',
    '--glow':       '0 0 8px #ffcc0066, 0 0 16px #ffcc0033',
    '--glow-red':   '0 0 8px #ff005566, 0 0 16px #ff005533',
  },
  synthwave: {
    '--green':      '#e779c1',
    '--green-dim':  '#b84e96',
    '--green-dark': '#5a1f4a',
    '--bg':         '#1a0533',
    '--bg2':        '#23094a',
    '--bg3':        '#2d0e5c',
    '--text':       '#f5ccee',
    '--text-dim':   '#7a4070',
    '--border':     '#e779c133',
    '--glow':       '0 0 8px #e779c166, 0 0 16px #e779c133',
    '--glow-red':   '0 0 8px #ff006666, 0 0 16px #ff006633',
  },
  black: {
    '--green':      '#a0a0a0',
    '--green-dim':  '#707070',
    '--green-dark': '#303030',
    '--bg':         '#000000',
    '--bg2':        '#0a0a0a',
    '--bg3':        '#111111',
    '--text':       '#d0d0d0',
    '--text-dim':   '#505050',
    '--border':     '#a0a0a033',
    '--glow':       '0 0 8px #a0a0a066, 0 0 16px #a0a0a033',
    '--glow-red':   '0 0 8px #ff222266, 0 0 16px #ff222233',
  },
};

// ── Apply theme to document ───────────────────────────────────────────
function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const vars = THEME_VARS[themeId] || THEME_VARS.forest;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.daisy);
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ── Context ───────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('bsw-theme') || 'forest';
  });

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem('bsw-theme', id);
    applyTheme(id);
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
