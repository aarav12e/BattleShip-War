import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: 'Orbitron, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                boxShadow: 'var(--glow)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' },
                style: {
                  background: 'var(--bg2)',
                  border: '1px solid var(--green)',
                  color: 'var(--text)',
                },
              },
              error: {
                iconTheme: { primary: 'var(--red)', secondary: 'var(--bg)' },
                style: {
                  background: 'var(--bg2)',
                  border: '1px solid var(--red)',
                  color: '#ffcccc',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
