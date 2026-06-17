import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Clock, Calendar, CheckSquare } from 'lucide-react';
import { Place, PlaceCategory, TripConfig } from '../types.js';

interface PlaceRegistryProps {
  config: TripConfig;
  onAddPlace: (place: Place) => void;
  onRemovePlace: (id: string) => void;
}

const DEFAULT_CITY_COORDS: Record<string, { lat: number; lng: number; address: string }> = {
  '제주': { lat: 33.4996, lng: 126.5312, address: '제주특별자치도 제주시' },
  '우도': { lat: 33.5042, lng: 126.9546, address: '제주특별자치도 제주시 우도면' },
  '도쿄': { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
  '바르셀로나': { lat: 41.3851, lng: 2.1734, address: 'Barcelona, Spain' },
  '마드리드': { lat: 40.4168, lng: -3.7038, address: 'Madrid, Spain' }
};

export const PlaceRegistry: React.FC<PlaceRegistryProps> = ({ config, onAddPlace, onRemovePlace }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('Sightseeing');
  const [city, setCity] = useState(config.cities[0] || '');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('33.4996');
  const [lng, setLng] = useState('126.5312');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [duration, setDuration] = useState('90');
  
  // Fixed Schedule Fields
  const [isFixed, setIsFixed] = useState(false);
  const [resDateIndex, setResDateIndex] = useState(0);
  const [resStartTime, setResStartTime] = useState('14:00');
  const [resEndTime, setResEndTime] = useState('16:00');

  // Total Days calculations
  const start = new Date(config.startDate);
  const end = new Date(config.endDate);
  const totalDays = isNaN(start.getTime()) || isNaN(end.getTime()) 
    ? 0 
    : Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Auto Coordinate fill when City input is selected/typed
  const handleCityChange = (val: string) => {
    setCity(val);
    const preset = DEFAULT_CITY_COORDS[val.trim()];
    if (preset) {
      setLat(String(preset.lat));
      setLng(String(preset.lng));
      setAddress(preset.address);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (config.places.length >= 30) {
      alert('MVP 제약사항: 등록 가능한 장소는 최대 30개입니다.');
      return;
    }

    if (!name.trim()) {
      alert('장소 이름을 입력해주세요.');
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      alert('올바른 위도와 경도 값을 입력해주세요.');
      return;
    }

    const newPlace: Place = {
      id: `${category.toLowerCase()}-${Date.now()}`,
      name: name.trim(),
      category,
      location: {
        lat: latitude,
        lng: longitude,
        address: address.trim() || '상세 주소 없음',
        city: city.trim() || '지정 없음',
        timezone: city.trim() === '도쿄' ? 'Asia/Tokyo' : (city.trim() === '바르셀로나' || city.trim() === '마드리드' ? 'Europe/Madrid' : 'Asia/Seoul')
      },
      openingHours: {
        start: openTime,
        end: closeTime
      },
      duration: parseInt(duration) || 60,
      isFixed,
      reservationTime: isFixed ? {
        start: resStartTime,
        end: resEndTime,
        dateIndex: resDateIndex
      } : undefined
    };

    onAddPlace(newPlace);
    
    // Reset inputs
    setName('');
    setAddress('');
    setIsFixed(false);
  };

  const getDayLabel = (idx: number) => {
    const baseDate = new Date(config.startDate);
    if (isNaN(baseDate.getTime())) return `Day ${idx + 1}`;
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + idx);
    return `Day ${idx + 1} (${d.getMonth() + 1}/${d.getDate()})`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>방문지 후보 등록 ({config.places.length}/30)</h2>
        </div>
      </div>

      {/* Add Place Form */}
      <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>장소명</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="예: 한라산, 이치란라멘" style={{ padding: '6px 10px', fontSize: '13px' }} required />
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>카테고리</label>
            <select value={category} onChange={e => setCategory(e.target.value as PlaceCategory)} style={{ padding: '6px 10px', fontSize: '13px' }}>
              <option value="Sightseeing">📸 관광지</option>
              <option value="Restaurant">🍽️ 맛집</option>
              <option value="Cafe">☕ 카페</option>
              <option value="Shopping">🛍️ 쇼핑</option>
              <option value="Activity">🤿 액티비티</option>
              <option value="Accommodation">🏨 숙소</option>
              <option value="TransitTerminal">✈️ 항공/기차 터미널</option>
            </select>
          </div>
        </div>

        {/* Location Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>도시</label>
            <input type="text" value={city} onChange={e => handleCityChange(e.target.value)} placeholder="예: 제주, 도쿄" style={{ padding: '6px 10px', fontSize: '12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>위도(Lat)</label>
            <input type="text" value={lat} onChange={e => setLat(e.target.value)} placeholder="33.4996" style={{ padding: '6px 10px', fontSize: '12px' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>경도(Lng)</label>
            <input type="text" value={lng} onChange={e => setLng(e.target.value)} placeholder="126.5312" style={{ padding: '6px 10px', fontSize: '12px' }} required />
          </div>
        </div>

        {/* Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>상세주소</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="예: 제주시 애월읍 애월해안로 12" style={{ padding: '6px 10px', fontSize: '13px' }} />
        </div>

        {/* Operating Hours and Stay Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>영업 시작</label>
            <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>영업 종료</label>
            <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>체류시간(분)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="90" style={{ padding: '6px 10px', fontSize: '12px' }} />
          </div>
        </div>

        {/* Fixed Reservation / Activity Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px', marginTop: '4px' }}>
          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)' }}>
            <input type="checkbox" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            고정 예약 일정으로 지정 (항공/기차/예약 식사 등)
          </label>
          
          {isFixed && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '6px', background: 'rgba(99, 102, 241, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.15)', marginTop: '4px', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>예약 날짜</label>
                <select value={resDateIndex} onChange={e => setResDateIndex(parseInt(e.target.value))} style={{ padding: '4px', fontSize: '11px' }}>
                  {Array.from({ length: totalDays }, (_, i) => (
                    <option key={i} value={i}>{getDayLabel(i)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>예약 시작</label>
                <input type="time" value={resStartTime} onChange={e => setResStartTime(e.target.value)} style={{ padding: '3px', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>예약 종료</label>
                <input type="time" value={resEndTime} onChange={e => setResEndTime(e.target.value)} style={{ padding: '3px', fontSize: '11px' }} />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '8px', fontSize: '13px', marginTop: '4px' }}>
          <Plus size={16} /> 후보지에 추가하기
        </button>
      </form>

      {/* Places List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
        {config.places.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dark)', fontSize: '13px' }}>
            등록된 후보 장소가 없습니다. 장소를 직접 추가하거나 상단의 데모 시나리오를 선택해 보세요!
          </div>
        ) : (
          config.places.map((place) => {
            const isAccommodation = place.category === 'Accommodation';
            const badgeClass = `badge badge-${place.category.toLowerCase().replace('transitterminal', 'transit')}`;
            return (
              <div key={place.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)', transition: 'background 0.2s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                    <span className={badgeClass}>{place.category}</span>
                    {place.isFixed && <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>고정 일정</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>📍 {place.location.city} ({place.location.lat.toFixed(3)}, {place.location.lng.toFixed(3)})</span>
                    {!isAccommodation && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Clock size={11} />
                        {place.openingHours.start}-{place.openingHours.end} ({place.duration}분 체류)
                      </span>
                    )}
                  </div>
                  {place.reservationTime && (
                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 500 }}>
                      🗓️ Day {place.reservationTime.dateIndex + 1} 예약 확정: {place.reservationTime.start} - {place.reservationTime.end}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemovePlace(place.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dark)')}
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
