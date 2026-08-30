import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Ticket() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const ticketId = location.state?.ticketId;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !ticketId) {
      navigate('/home');
      return;
    }

    const fetchTicket = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/ticket/${ticketId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setTicket(data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, token, navigate]);

  if (loading) return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading your ticket...</div>;
  if (error) return <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', color: 'red' }}>Error: {error}</div>;
  if (!ticket) return null;

  return (
    <div className="page-container" style={{ background: 'var(--primary-color)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px 24px', width: '100%', color: 'var(--text-primary)', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '16px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Thank you!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Here is your ticket #{ticket.id}</p>
          </div>

          <div style={{ borderTop: '2px dashed var(--border-color)', margin: '0 -24px 24px -24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
            <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Floor</p>
              <p style={{ fontWeight: 600, fontSize: '18px' }}>0{ticket.floor}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Parking space</p>
              <p style={{ fontWeight: 600, fontSize: '18px' }}>{ticket.slotId}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>{ticket.date}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Time</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>{ticket.time}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Duration</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>{ticket.duration} {ticket.duration > 1 ? 'hrs' : 'hr'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>License Plate / Color</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>{ticket.licensePlate} / {ticket.carColor}</p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total Price</span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--primary-color)' }}>${ticket.totalPrice.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '80%', height: '40px', 
              background: 'repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px, #000 8px, #000 12px, transparent 12px, transparent 14px)',
              marginBottom: '8px', opacity: 0.8
            }}></div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '2px' }}>{ticket.id.toString().padStart(12, '0')}</span>
          </div>

        </div>

      </div>

      <div style={{ paddingTop: '32px' }}>
        <button 
          className="btn-primary" 
          style={{ background: 'white', color: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          onClick={() => navigate('/home')}
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>

    </div>
  );
}
