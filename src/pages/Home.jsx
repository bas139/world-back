import { useState } from 'react';
import { MapPin, Bell, Search, Bike, Car, Truck } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Home() {
  const [vehicle, setVehicle] = useState('car');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-container" style={{ paddingBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <MapPin size={20} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>ตำแหน่ง</span>
          </div>
          <Bell size={24} color="var(--text-primary)" />
        </div>

        <h1 className="title" style={{ fontSize: '32px', lineHeight: 1.2, marginBottom: '24px' }}>
          Find best<br/>Parking space
        </h1>

        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Find parking Area..." 
            style={{ paddingLeft: '48px', marginBottom: 0, borderRadius: '24px' }} 
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--primary-color)', padding: '8px', borderRadius: '50%', display: 'flex', color: 'white' }}>
            <Search size={16} />
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Your Vehicle Type</h2>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
          {[
            { id: 'bike', icon: Bike, label: 'Bike' },
            { id: 'car', icon: Car, label: 'Car' },
            { id: 'truck', icon: Truck, label: 'Truck' }
          ].map((v) => (
            <div 
              key={v.id}
              onClick={() => setVehicle(v.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 8px',
                borderRadius: '16px',
                border: `2px solid ${vehicle === v.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                background: vehicle === v.id ? 'rgba(79, 70, 229, 0.05)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: vehicle === v.id ? 1 : 0.6
              }}
            >
              <v.icon size={48} color={vehicle === v.id ? 'var(--primary-color)' : 'var(--text-secondary)'} style={{ marginBottom: '16px' }} />
              <span style={{ fontWeight: 500, color: vehicle === v.id ? 'var(--primary-color)' : 'var(--text-secondary)' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
