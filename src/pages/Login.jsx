import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronLeft, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let res;
    if (isRegister) {
      res = await register(email, password, name);
    } else {
      res = await login(email, password, rememberMe);
    }
    
    setLoading(false);
    
    if (res.success) {
      navigate('/home');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate(-1)} type="button">
        <ChevronLeft size={24} />
        Back
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 className="title" style={{ fontSize: '32px', textAlign: 'center', marginBottom: '40px' }}>
          {isRegister ? 'Register' : 'Log in'}
        </h1>
        
        {error && <div style={{ color: 'var(--danger-color)', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          {!isRegister && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 16px 4px' }}>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>
          )}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Log in')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have account? "}
          </span>
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '16px' }}
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
