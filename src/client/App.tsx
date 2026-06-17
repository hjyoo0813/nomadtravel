import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { TripConfigForm } from './components/TripConfigForm.js';
import { PlaceRegistry } from './components/PlaceRegistry.js';
import { ItineraryTimeline } from './components/ItineraryTimeline.js';
import { MapView } from './components/MapView.js';
import { TripConfig, OptimizationResult, Place } from './types.js';
import { DEMO_PRESETS } from './constants/presets.js';
import { Cpu, RefreshCw, Layers, Map as MapIcon, Calendar, CheckCircle, Save } from 'lucide-react';

const DEFAULT_CONFIG: TripConfig = {
  id: 'new-trip',
  title: '새로운 여행 계획',
  countries: ['KR'],
  cities: ['제주'],
  startDate: '2026-07-01',
  endDate: '2026-07-05',
  transportMode: 'car',
  accommodations: [],
  places: []
};

export default function App() {
  const [config, setConfig] = useState<TripConfig>(DEFAULT_CONFIG);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [activeDay, setActiveDay] = useState<number>(0);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Initial Load: LocalStorage or Default
  useEffect(() => {
    const savedConfig = localStorage.getItem('nomadflow_trip_config');
    const savedResult = localStorage.getItem('nomadflow_opt_result');
    const savedScenario = localStorage.getItem('nomadflow_current_scenario');

    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
    if (savedResult) {
      try {
        setOptimizationResult(JSON.parse(savedResult));
      } catch (e) {
        console.error('Failed to parse saved optimization result', e);
      }
    }
    if (savedScenario) {
      setCurrentScenario(savedScenario);
    }
  }, []);

  // 2. Auto-save to LocalStorage when config changes
  useEffect(() => {
    if (config.id !== 'new-trip' || config.places.length > 0) {
      localStorage.setItem('nomadflow_trip_config', JSON.stringify(config));
    }
  }, [config]);

  // Helper: Trigger optimization API call
  const handleOptimize = async (targetConfig = config) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Validate config before sending
    if (targetConfig.places.length === 0) {
      setError('최적화할 방문지 장소가 없습니다. 장소를 추가하거나 데모 시나리오를 로드하세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(targetConfig)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '최적화 요청 실패');
      }

      const result: OptimizationResult = await response.json();
      setOptimizationResult(result);
      localStorage.setItem('nomadflow_opt_result', JSON.stringify(result));
      setSuccessMsg('Node.js 서버에서 AI 일정 최적화가 완벽하게 완료되었습니다!');
      
      // Auto reset active day to 0
      setActiveDay(0);
      
      // Clear success message after 4s
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Node.js 백엔드 서버와 통신하는 중 문제가 발생했습니다. 서버가 실행 중인지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Load Preset Scenario
  const handleLoadPreset = (presetKey: string) => {
    const preset = DEMO_PRESETS[presetKey];
    if (preset) {
      const clonedPreset = JSON.parse(JSON.stringify(preset)) as TripConfig;
      setConfig(clonedPreset);
      setCurrentScenario(presetKey);
      localStorage.setItem('nomadflow_current_scenario', presetKey);
      
      // Run optimization immediately on the loaded preset
      handleOptimize(clonedPreset);
    }
  };

  // 4. Modify configuration callback
  const handleConfigChange = (newConfig: TripConfig) => {
    setConfig(newConfig);
    // If user changes dates, reset current scenario name since it's now custom
    if (currentScenario) {
      setCurrentScenario('');
      localStorage.removeItem('nomadflow_current_scenario');
    }
  };

  // 5. Add custom Place
  const handleAddPlace = (newPlace: Place) => {
    const updatedPlaces = [...config.places, newPlace];
    const newConfig = {
      ...config,
      places: updatedPlaces
    };
    setConfig(newConfig);
    
    // Auto-update accommodation list if we added an accommodation
    if (newPlace.category === 'Accommodation') {
      // If we don't have accommodations mapped yet, we can let user select, no auto-inject
    }
  };

  // 6. Remove Place
  const handleRemovePlace = (id: string) => {
    const updatedPlaces = config.places.filter(p => p.id !== id);
    // Also clean up any daily accommodation assignments using this place
    const updatedAccs = config.accommodations.filter(a => a.placeId !== id);

    setConfig({
      ...config,
      places: updatedPlaces,
      accommodations: updatedAccs
    });
  };

  // 7. Reset entire state
  const handleReset = () => {
    if (window.confirm('현재 입력된 모든 데이터를 지우고 초기화하시겠습니까?')) {
      setConfig(DEFAULT_CONFIG);
      setOptimizationResult(null);
      setCurrentScenario('');
      localStorage.clear();
      setError(null);
      setSuccessMsg(null);
    }
  };

  // Extract currently active day itinerary for Map
  const activeItinerary = optimizationResult && optimizationResult.itineraries
    ? (optimizationResult.itineraries[activeDay] || null)
    : null;

  return (
    <div className="app-container">
      <Header currentScenario={currentScenario} onLoadPreset={handleLoadPreset} />

      <main className="main-content">
        {/* Left side: Inputs form & Registry scrollbar */}
        <div className="sidebar-scroll">
          
          {/* Optimization Controller Button */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={16} color="var(--primary)" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>최적화 엔진 상태</span>
              </div>
              <span style={{ fontSize: '11px', color: loading ? 'var(--primary)' : 'var(--success)', background: loading ? 'var(--primary-glow)' : 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid' }}>
                {loading ? '● 연산 중...' : '● 준비 완료'}
              </span>
            </div>

            <button 
              onClick={() => handleOptimize()} 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <RefreshCw size={18} className={loading ? 'spin-anim' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? '일정 자동 최적화 계산 중...' : 'AI 일정 최적화 시작'}
            </button>

            {error && (
              <div style={{ fontSize: '12px', color: '#f87171', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div style={{ fontSize: '12px', color: '#34d399', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> {successMsg}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>
                전체 초기화
              </button>
              <button onClick={() => handleOptimize()} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Save size={12} /> 현재 상태 저장
              </button>
            </div>
          </div>

          <TripConfigForm config={config} onChangeConfig={handleConfigChange} />

          <PlaceRegistry 
            config={config} 
            onAddPlace={handleAddPlace} 
            onRemovePlace={handleRemovePlace} 
          />
        </div>

        {/* Right side: Map (Top) & Timeline Tabs (Bottom) */}
        <div style={{ display: 'grid', gridTemplateRows: '1.1fr 1fr', gap: '20px', height: '100%', overflow: 'hidden' }}>
          
          {/* Map Section */}
          <div className="glass-panel" style={{ overflow: 'hidden', padding: '12px' }}>
            <MapView 
              activeItinerary={activeItinerary} 
              places={config.places} 
            />
          </div>

          {/* Timeline Section */}
          <div style={{ overflow: 'hidden', height: '100%' }}>
            <ItineraryTimeline 
              optimizationResult={optimizationResult}
              places={config.places}
              startDate={config.startDate}
            />
          </div>
        </div>
      </main>

      {/* Embedded CSS animation for spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
