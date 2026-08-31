import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}
        onClick={() => navigate('/home')}
        style={{ cursor: 'pointer' }}
      >
        <HomeIcon size={24} />
      </div>
      <div 
        className="nav-item"
        style={{ 
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', 
          color: 'var(--text-primary)', 
          borderRadius: '50%', 
          padding: '12px',
          marginTop: '-24px',
          boxShadow: '0 4px 10px rgba(188, 160, 220, 0.4)'
        }}
        onClick={() => navigate('/floor')}
      >
        <ChevronRight size={24} />
      </div>
      <div 
        className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer' }}
      >
        <User size={24} />
      </div>
    </div>
  );
}
