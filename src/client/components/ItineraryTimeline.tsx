import React, { useState } from 'react';
import { Clock, Navigation, AlertTriangle, Moon, Check, ArrowRight, Sun } from 'lucide-react';
import { DailyItinerary, ScheduledEvent, Place, OptimizationResult, TransportMode } from '../types.js';

interface ItineraryTimelineProps {
  optimizationResult: OptimizationResult | null;
  places: Place[];
  startDate: string;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  optimizationResult,
  places,
  startDate
}) => {
  const [activeTab, setActiveTab] = useState<number | 'excluded'>(0);

  if (!optimizationResult) {
    return (
      <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
        <Navigation size={40} color="var(--primary)" style={{ opacity: 0.6, animation: 'pulse 2s infinite' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>일정이 아직 생성되지 않았습니다</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px' }}>
          후보지를 등록한 후 백엔드 서버에서 최적의 추천 일정을 계산해 보세요.
        </p>
      </div>
    );
  }

  const { itineraries, excludedPlaces } = optimizationResult;

  const getPlaceById = (id: string): Place | undefined => {
    return places.find((p) => p.id === id);
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'car': return '🚗';
      case 'walking': return '🚶';
      case 'transit': return '🚇';
      default: return '⚙️';
    }
  };

  const getTransportName = (mode: TransportMode) => {
    switch (mode) {
      case 'car': return '자동차 (렌터카/자차)';
      case 'walking': return '도보';
      case 'transit': return '대중교통 (지하철/버스)';
      default: return '직접 입력 이동';
    }
  };

  const getEventName = (event: ScheduledEvent, place: Place | undefined) => {
    if (!place) return '알 수 없는 장소';
    if (event.type === 'accommodation_start') return `🏨 ${place.name} (출발 숙소)`;
    if (event.type === 'accommodation_end') return `🏨 ${place.name} (종료 숙소)`;
    return place.name;
  };

  return (
    <div className="glass-panel workspace-panel" style={{ padding: '20px' }}>
      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '10px',
        marginBottom: '20px',
        scrollbarWidth: 'none' // Hide scrollbar
      }}>
        {itineraries.map((it, idx) => {
          const isActive = activeTab === idx;
          const visitCount = it.events.filter(e => e.type === 'visit').length;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                borderRadius: '8px',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              Day {idx + 1} ({visitCount}/8)
            </button>
          );
        })}
        
        {/* Excluded Tab */}
        <button
          onClick={() => setActiveTab('excluded')}
          className="btn"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            borderRadius: '8px',
            background: activeTab === 'excluded' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'excluded' ? 'var(--warning)' : 'transparent',
            color: activeTab === 'excluded' ? 'var(--warning)' : 'var(--text-muted)'
          }}
        >
          ⚠️ 제외된 장소 ({excludedPlaces.length})
        </button>
      </div>

      {/* Itinerary Timeline View */}
      {activeTab !== 'excluded' ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
          {/* Day summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Day {activeTab + 1} 일정</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{itineraries[activeTab].dateStr}</span>
            </div>
            <span style={{ fontSize: '12px', padding: '4px 8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid var(--primary-glow)', borderRadius: '6px', fontWeight: 600 }}>
              방문지 {itineraries[activeTab].events.filter(e => e.type === 'visit').length}개 (최대 8개)
            </span>
          </div>

          {itineraries[activeTab].events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dark)', fontSize: '13px' }}>
              이 날짜에 생성된 일정이 없습니다. 숙소나 고정 일정이 제대로 등록되었는지 확인해주세요.
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '7px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--secondary) 0%, var(--primary) 50%, var(--accent) 100%)',
                opacity: 0.3
              }}></div>

              {itineraries[activeTab].events.map((event, eventIdx) => {
                const place = getPlaceById(event.placeId);
                const isAccommodation = event.type.startsWith('accommodation');
                
                let dotColor = 'var(--primary)';
                if (event.type === 'accommodation_start') dotColor = 'var(--secondary)';
                else if (event.type === 'accommodation_end') dotColor = 'var(--accent)';
                else if (event.isFixed) dotColor = 'var(--success)';

                return (
                  <div key={eventIdx} style={{ marginBottom: '20px', position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '6px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: dotColor,
                      border: '3px solid var(--bg-main)',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {event.isFixed && event.type === 'visit' && <Check size={8} color="#ffffff" strokeWidth={4} />}
                    </div>

                    {/* Event Card */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      transition: 'transform 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {getEventName(event, place)}
                          </h4>
                          {place && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {place.location.address}</span>
                          )}
                        </div>
                        
                        {/* Time details */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color="var(--primary)" />
                            {isAccommodation ? event.arrivalTime : `${event.arrivalTime} - ${event.departureTime}`}
                          </span>
                          {!isAccommodation && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ⏱️ 체류 {event.durationMin}분
                            </span>
                          )}
                          {event.isFixed && event.type === 'visit' && (
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', fontSize: '9px', marginTop: '4px' }}>
                              ⏱️ 예약 시간 확정
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Render Travel to Next place if present */}
                      {event.travelToNext && event.travelToNext.distanceKm > 0.05 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed var(--border-glass)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginTop: '12px',
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          <span style={{ fontSize: '16px' }}>{getTransportIcon(event.travelToNext.transportMode)}</span>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {getTransportName(event.travelToNext.transportMode)} 이동
                            </span>
                            <span style={{ marginLeft: '8px', borderLeft: '1px solid var(--border-glass)', paddingLeft: '8px' }}>
                              🚗 {event.travelToNext.distanceKm} km
                            </span>
                            <span style={{ marginLeft: '8px', borderLeft: '1px solid var(--border-glass)', paddingLeft: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                              ⏱️ 약 {event.travelToNext.durationMin}분 소요
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Excluded Places View */
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px' }}>
            <AlertTriangle size={18} color="var(--warning)" />
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>최적화 일정에 포함하지 못한 장소</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                시간대 충돌, 거리, 영업시간 제약 또는 일일 8개 한도로 제외된 장소 목록입니다.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {excludedPlaces.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dark)', fontSize: '13px' }}>
                제외된 장소가 없습니다! 모든 방문 후보지가 성공적으로 최적 일정에 배치되었습니다. 🎉
              </div>
            ) : (
              excludedPlaces.map((item, idx) => {
                const place = getPlaceById(item.placeId);
                if (!place) return null;
                const badgeClass = `badge badge-${place.category.toLowerCase().replace('transitterminal', 'transit')}`;
                
                return (
                  <div key={idx} style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                      <span className={badgeClass}>{place.category}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      📍 {place.location.address}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#fbbf24',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}>
                      ❌ <strong>제외 사유:</strong> {item.reason}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
