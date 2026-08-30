import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Ticket as TicketIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editCarColor, setEditCarColor] = useState(user?.defaultCarColor || '');
  const [editLicensePlate, setEditLicensePlate] = useState(user?.defaultLicensePlate || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/my-tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setTickets(data);
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, navigate]);
  
  // Update local state if user context updates from API
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditCarColor(user.defaultCarColor || '');
      setEditLicensePlate(user.defaultLicensePlate || '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          defaultCarColor: editCarColor,
          defaultLicensePlate: editLicensePlate
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setIsEditing(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container" style={{ paddingBottom: '0' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', paddingTop: '24px', position: 'relative' }}>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ position: 'absolute', right: 0, top: '24px', background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit
            </button>
          )}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <User size={40} color="var(--primary-color)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{user?.name || 'User'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>

        {isEditing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</label>
              <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Default Car Color</label>
              <input type="text" className="input-field" placeholder="e.g. Red, Black, White" value={editCarColor} onChange={(e) => setEditCarColor(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>Default License Plate</label>
              <input type="text" className="input-field" placeholder="e.g. กข 1234" value={editLicensePlate} onChange={(e) => setEditLicensePlate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button className="btn-primary" style={{ background: 'var(--border-color)', color: 'var(--text-primary)', flex: 1, boxShadow: 'none' }} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TicketIcon size={20} /> My Tickets
            </h2>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading history...</div>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>No booking history found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/ticket', { state: { ticketId: ticket.id } })}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>Slot {ticket.slotId}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {ticket.date} at {ticket.time}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          ${ticket.totalPrice.toFixed(2)}
                        </span>
                        <ChevronRight size={20} color="var(--text-secondary)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ paddingBottom: '24px', marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', 
              background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)',
              border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '8px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
