import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function FloorSelection() {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState(1);

  const floors = [
    { id: 1, name: 'Floor 1', status: 'เต็ม/ว่าง' },
    { id: 2, name: 'Floor 2', status: 'เหลือจอด' },
    { id: 3, name: 'Floor 3', status: 'ว่าง' },
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)', zIndex: 10, 
        padding: '20px 24px', margin: '0 -24px 24px -24px', 
        borderBottom: '1px solid rgba(0,0,0,0.05)' 
      }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', left: '24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <ChevronLeft size={28} color="var(--text-primary)" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Choose floor</h1>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '32px' }}>
        {floors.map((floor) => (
          <div 
            key={floor.id}
            onClick={() => setSelectedFloor(floor.id)}
            style={{ 
              flex: 1, 
              textAlign: 'center', 
              padding: '16px 8px',
              cursor: 'pointer',
              borderBottom: selectedFloor === floor.id ? '3px solid var(--primary-color)' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: selectedFloor === floor.id ? 700 : 500, color: selectedFloor === floor.id ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
              {floor.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              ({floor.status})
            </p>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ 
          width: '100%', 
          height: '280px', 
          background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.15) 100%)', 
          borderRadius: '24px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          marginBottom: '32px',
          boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Simulated parking lines */}
          <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '4px', background: 'white', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '4px', background: 'white', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', top: '20%', bottom: '20%', left: '50%', width: '4px', background: 'white', borderStyle: 'dashed', borderWidth: '4px', borderColor: 'rgba(79, 70, 229, 0.3)' }}></div>
          
          <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '20px', zIndex: 1, background: 'white', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            Map: Floor {selectedFloor}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px', zIndex: 1 }}>Interactive map coming soon</p>
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={() => navigate('/slot')}
      >
        Let's booking
      </button>
    </div>
  );
}
