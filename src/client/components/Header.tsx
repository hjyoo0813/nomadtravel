import React from 'react';
import { Compass, Sparkles, Map, Train, Plane } from 'lucide-react';

interface HeaderProps {
  currentScenario: string;
  onLoadPreset: (presetKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScenario, onLoadPreset }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid var(--border-glass)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <Compass size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', lineHeight: 1.1 }}>
            NOMAD<span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FLOW</span>
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
            AI ITINERARY OPTIMIZATION SERVICE
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} color="#fbbf24" />
          데모 시나리오 불러오기:
        </span>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => onLoadPreset('scenario1')}
            className={`btn ${currentScenario === 'scenario1' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            ✈️ 제주·우도 (5일)
          </button>
          <button
            onClick={() => onLoadPreset('scenario2')}
            className={`btn ${currentScenario === 'scenario2' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            🚇 도쿄 (4일)
          </button>
          <button
            onClick={() => onLoadPreset('scenario3')}
            className={`btn ${currentScenario === 'scenario3' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            🇪🇸 스페인 (8일)
          </button>
        </div>
      </div>
    </header>
  );
};
