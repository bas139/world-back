import { Rabbit } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', color: 'var(--text-primary)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '50%', marginBottom: '24px', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <Rabbit size={64} color="var(--primary-color)" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>จองที่จอดรถอัจฉริยะ</h1>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Find your perfect parking spot</p>
      </div>
      
      <div style={{ width: '100%', paddingBottom: '32px' }}>
        <button 
          className="btn-primary" 
          style={{ background: 'white', color: 'var(--primary-color)' }}
          onClick={() => navigate('/login')}
        >
          Park now
        </button>
      </div>
    </div>
  );
}
