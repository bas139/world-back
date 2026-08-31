import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, Landmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Information() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  
  const slotId = location.state?.slotId;
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    carColor: user?.defaultCarColor || '',
    licensePlate: user?.defaultLicensePlate || '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  });
  
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hourlyRate = 25.00;
  const parkingFee = duration * hourlyRate;
  const tax = parkingFee * 0.07;
  const totalPrice = parkingFee + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!slotId) {
      setError("No slot selected");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slotId,
          ...formData,
          duration,
          totalPrice
        })
      });
      
      const data = await res.json();
      setLoading(false);
      
      if (res.ok) {
        navigate('/ticket', { state: { ticketId: data.ticketId } });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="page-container" style={{ overflowY: 'auto', paddingTop: 0 }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)', zIndex: 10, 
        padding: '20px 24px', margin: '0 -24px 24px -24px', 
        borderBottom: '1px solid rgba(0,0,0,0.05)' 
      }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', left: '24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <ChevronLeft size={28} color="var(--text-primary)" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Information</h1>
      </div>

      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Name</label>
          <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="Sompong" style={{ marginBottom: 0 }} />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Car color</label>
          <input type="text" name="carColor" className="input-field" value={formData.carColor} onChange={handleChange} placeholder="Red" style={{ marginBottom: 0 }} />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Vehicle License Plate</label>
          <input type="text" name="licensePlate" className="input-field" value={formData.licensePlate} onChange={handleChange} placeholder="กข 1234" style={{ marginBottom: 0 }} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Check-in date</label>
            <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} style={{ marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Time</label>
            <input type="time" name="time" className="input-field" value={formData.time} onChange={handleChange} style={{ marginBottom: 0 }} />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', marginLeft: '4px' }}>Duration</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="number"
              className="input-field" 
              value={duration || ''} 
              onChange={(e) => setDuration(Math.max(1, Math.min(24, Number(e.target.value))))}
              min="1"
              max="24"
              style={{ marginBottom: 0, paddingRight: '72px' }}
            />
            <span style={{ position: 'absolute', right: '16px', color: 'var(--text-secondary)' }}>
              Hour(s)
            </span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Pay by</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {[
          { id: 'card', icon: CreditCard, label: 'Credit / Debit Card' },
          { id: 'wallet', icon: Wallet, label: 'E-Wallet' },
          { id: 'bank', icon: Landmark, label: 'Bank Transfer' }
        ].map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <div 
              key={method.id} 
              onClick={() => setPaymentMethod(method.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px', 
                border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'white',
                cursor: 'pointer'
              }}
            >
              <method.icon size={24} color={isSelected ? 'var(--primary-color)' : 'var(--text-secondary)'} />
              <span style={{ fontWeight: 500, color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)' }}>{method.label}</span>
              <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`, padding: '2px' }}>
                {isSelected && <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary-color)' }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
          <span>Parking ({duration} {duration > 1 ? 'hours' : 'hour'} @ ฿{hourlyRate.toFixed(2)})</span>
          <span>฿{parkingFee.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
          <span>Tax (7%)</span>
          <span>฿{tax.toFixed(2)}</span>
        </div>
        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px' }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary-color)' }}>฿{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button className="btn-primary" onClick={handlePayment} disabled={loading || !formData.name || !formData.licensePlate}>
        {loading ? 'Processing Payment...' : 'Pay now'}
      </button>
    </div>
  );
}
