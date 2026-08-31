import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SlotSelection() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [selectedRange, setSelectedRange] = useState('0-20');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100'];

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      setSlots(data);
      
      if (user) {
        setSelectedSlot(prev => {
          if (!prev) {
            const lockedSlot = data.find(s => s.status === 'locked' && s.lockedBy === user.id);
            return lockedSlot ? lockedSlot.id : null;
          }
          return prev;
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchSlots();
    // Poll every 3 seconds for real-time feel
    const interval = setInterval(fetchSlots, 3000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const handleSlotClick = async (slot) => {
    // Only allow clicking available or already locked by this user
    if (slot.status === 'occupied' || (slot.status === 'locked' && slot.lockedBy !== user.id)) {
      return;
    }

    const isLockedByMe = slot.status === 'locked' && slot.lockedBy === user.id;

    try {
      if (isLockedByMe) {
        // Unlock the slot
        const res = await fetch(`/api/slots/${slot.id}/unlock`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          if (selectedSlot === slot.id) {
            setSelectedSlot(null);
          }
          fetchSlots(); // Refresh immediately
        }
      } else {
        // Lock the slot
        const res = await fetch(`/api/slots/${slot.id}/lock`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedSlot(slot.id);
          fetchSlots(); // Refresh immediately
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContinue = () => {
    // Navigate to information page and pass the selected slot ID
    navigate('/information', { state: { slotId: selectedSlot } });
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)', zIndex: 10, 
        padding: '20px 24px', margin: '0 -24px 24px -24px', 
        borderBottom: '1px solid rgba(0,0,0,0.05)' 
      }}>
        <button aria-label="Go back" onClick={() => navigate(-1)} style={{ position: 'absolute', left: '24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', margin: '-8px' }}>
          <ChevronLeft size={28} color="var(--text-primary)" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Choose slot</h1>
      </div>

      <div role="tablist" style={{ display: 'flex', overflowX: 'auto', gap: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', WebkitOverflowScrolling: 'touch' }}>
        {ranges.map(range => (
          <button 
            key={range}
            role="tab"
            aria-selected={selectedRange === range}
            onClick={() => setSelectedRange(range)}
            style={{ 
              whiteSpace: 'nowrap',
              color: selectedRange === range ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: selectedRange === range ? 700 : 500,
              position: 'relative',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '8px 4px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          >
            {range}
            {selectedRange === range && (
              <div style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '3px', background: 'var(--primary-color)', borderRadius: '3px' }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} aria-live="polite">Loading slots...</div>
        ) : (
          <div role="radiogroup" aria-label="Parking slots" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {slots.map(slot => {
              const isLockedByMe = slot.status === 'locked' && slot.lockedBy === user?.id;
              const isUnavailable = slot.status === 'occupied' || (slot.status === 'locked' && !isLockedByMe);
              const isSelected = selectedSlot === slot.id || isLockedByMe;

              return (
                <button 
                  key={slot.id}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isUnavailable}
                  aria-label={`Slot ${slot.id}, ${isUnavailable ? 'unavailable' : isSelected ? 'selected' : 'available'}`}
                  onClick={() => handleSlotClick(slot)}
                  style={{ 
                    height: '80px',
                    border: `2px ${isUnavailable ? 'dashed' : 'solid'} ${isUnavailable ? 'var(--locked-color)' : isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: isUnavailable ? 'rgba(148, 163, 184, 0.1)' : isSelected ? 'rgba(188, 160, 220, 0.1)' : 'white',
                    cursor: isUnavailable ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                    padding: 0
                  }}
                >
                  {isUnavailable ? (
                    <Lock size={24} color="var(--locked-color)" aria-hidden="true" />
                  ) : isSelected ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Check size={20} color="white" aria-hidden="true" />
                    </div>
                  ) : (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{slot.id}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ paddingTop: '24px', marginTop: 'auto' }}>
        <button 
          className="btn-primary" 
          disabled={!selectedSlot}
          style={{ opacity: selectedSlot ? 1 : 0.5 }}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
