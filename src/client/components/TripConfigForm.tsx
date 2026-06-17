import React from 'react';
import { Calendar, MapPin, Car, Briefcase } from 'lucide-react';
import { TripConfig, Place, TransportMode } from '../types.js';

interface TripConfigFormProps {
  config: TripConfig;
  onChangeConfig: (newConfig: TripConfig) => void;
}

export const TripConfigForm: React.FC<TripConfigFormProps> = ({ config, onChangeConfig }) => {
  const accommodations = config.places.filter(p => p.category === 'Accommodation');

  // Handle standard input updates
  const handleInputChange = (field: keyof TripConfig, value: any) => {
    onChangeConfig({
      ...config,
      [field]: value
    });
  };

  // Calculate total days
  const start = new Date(config.startDate);
  const end = new Date(config.endDate);
  const totalDays = isNaN(start.getTime()) || isNaN(end.getTime()) 
    ? 0 
    : Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Validate dates (max 10 days)
  const handleDateChange = (isStart: boolean, dateVal: string) => {
    const nextStart = isStart ? dateVal : config.startDate;
    const nextEnd = !isStart ? dateVal : config.endDate;

    const s = new Date(nextStart);
    const e = new Date(nextEnd);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 10) {
        alert('MVP 제약사항: 여행 기간은 최대 10일까지만 설정할 수 있습니다.');
        return;
      }
      if (days < 1) {
        alert('종료일은 시작일보다 빠를 수 없습니다.');
        return;
      }
    }

    onChangeConfig({
      ...config,
      startDate: nextStart,
      endDate: nextEnd
    });
  };

  // Validate cities (max 3 cities)
  const handleCitiesChange = (val: string) => {
    const list = val.split(',').map(c => c.trim()).filter(Boolean);
    if (list.length > 3) {
      alert('MVP 제약사항: 여행 도시는 최대 3개까지만 등록할 수 있습니다.');
      return;
    }
    onChangeConfig({
      ...config,
      cities: list
    });
  };

  // Update accommodation for a specific night
  const handleAccChange = (dateIndex: number, placeId: string) => {
    const updatedAccs = [...config.accommodations];
    const existingIndex = updatedAccs.findIndex(a => a.dateIndex === dateIndex);

    if (existingIndex !== -1) {
      if (placeId === '') {
        updatedAccs.splice(existingIndex, 1);
      } else {
        updatedAccs[existingIndex].placeId = placeId;
      }
    } else if (placeId !== '') {
      updatedAccs.push({ dateIndex, placeId });
    }

    onChangeConfig({
      ...config,
      accommodations: updatedAccs
    });
  };

  // Generate date list strings
  const getDateLabels = () => {
    const labels = [];
    const baseDate = new Date(config.startDate);
    if (isNaN(baseDate.getTime())) return [];
    
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      labels.push({
        index: i,
        label: `Day ${i + 1} (${d.getMonth() + 1}/${d.getDate()})`
      });
    }
    return labels;
  };

  const dayLabels = getDateLabels();

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <Briefcase size={18} color="var(--primary)" />
        <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>여행 기본 설정</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>여행 명칭</label>
          <input 
            type="text" 
            value={config.title} 
            onChange={(e) => handleInputChange('title', e.target.value)} 
            placeholder="예: 나의 첫 제주도 여행"
          />
        </div>

        {/* Countries & Cities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>국가 코드 (ISO)</label>
            <input 
              type="text" 
              value={config.countries.join(', ')} 
              onChange={(e) => handleInputChange('countries', e.target.value.split(',').map(c => c.trim().toUpperCase()))} 
              placeholder="예: KR, JP"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>도시 (최대 3개)</label>
            <input 
              type="text" 
              value={config.cities.join(', ')} 
              onChange={(e) => handleCitiesChange(e.target.value)} 
              placeholder="예: 제주, 우도"
            />
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> 시작일
            </label>
            <input 
              type="date" 
              value={config.startDate} 
              onChange={(e) => handleDateChange(true, e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> 종료일
            </label>
            <input 
              type="date" 
              value={config.endDate} 
              onChange={(e) => handleDateChange(false, e.target.value)} 
            />
          </div>
        </div>

        {/* Default Transport */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Car size={12} /> 기본 이동수단
          </label>
          <select 
            value={config.transportMode} 
            onChange={(e) => handleInputChange('transportMode', e.target.value as TransportMode)}
          >
            <option value="car">🚗 렌터카 / 자차 (자동차)</option>
            <option value="walking">🚶 도보 이동</option>
            <option value="transit">🚇 대중교통 (지하철/버스)</option>
            <option value="custom">⚙️ 직접 입력 이동</option>
          </select>
        </div>

        {/* Daily Accommodations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> 날짜별 숙소 지정 (매일 변경 가능)
          </label>
          
          {accommodations.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--warning)', padding: '6px 10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px' }}>
              ⚠️ 아래 '장소 등록'에 <strong>숙소(Accommodation)</strong> 카테고리의 장소를 먼저 1개 이상 추가해야 숙소를 지정할 수 있습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              {dayLabels.slice(0, -1).map((day) => {
                const assignedAcc = config.accommodations.find(a => a.dateIndex === day.index);
                return (
                  <div key={day.index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{day.label} 숙소</span>
                    <select
                      value={assignedAcc?.placeId || ''}
                      onChange={(e) => handleAccChange(day.index, e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                    >
                      <option value="">-- 숙소 선택 --</option>
                      {accommodations.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
              {dayLabels.length > 0 && (
                <div style={{ fontSize: '10px', color: 'var(--text-dark)', marginTop: '4px', textAlign: 'right' }}>
                  * 마지막 날은 숙박이 없으므로 숙소를 지정하지 않습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
