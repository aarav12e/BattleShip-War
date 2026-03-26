import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params]  = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (error === 'gmail_only') {
      navigate('/login?error=gmail_only');
      return;
    }
    if (token) {
      loginWithToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',flexDirection:'column',gap:'1.5rem',
    }}>
      <div style={{
        width:56,height:56,border:'3px solid #004410',
        borderTop:'3px solid #00ff41',borderRadius:'50%',
        animation:'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{fontFamily:'Orbitron,monospace',color:'#00ff41',fontSize:'0.75rem',letterSpacing:'0.3em'}}>
        AUTHENTICATING...
      </p>
    </div>
  );
}
