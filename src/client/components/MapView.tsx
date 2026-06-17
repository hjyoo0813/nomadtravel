import React, { useEffect, useRef } from 'react';
import { LeafletMapProvider, MapInstance } from '../mapProvider.js';
import { DailyItinerary, Place } from '../types.js';
import { Map as MapIcon } from 'lucide-react';

interface MapViewProps {
  activeItinerary: DailyItinerary | null;
  places: Place[];
}

export const MapView: React.FC<MapViewProps> = ({ activeItinerary, places }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center to Jeju Island center initially
    const defaultLat = 33.4996;
    const defaultLng = 126.5312;
    const provider = new LeafletMapProvider();
    
    // Create map instance
    const instance = provider.initializeMap(
      'leaflet-map-container',
      defaultLat,
      defaultLng,
      10
    );
    
    mapInstanceRef.current = instance;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers & routes when active day or places list changes
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance) return;

    mapInstance.clearMap();

    if (!activeItinerary || activeItinerary.events.length === 0) {
      // If no active itinerary, fit to all registered places
      if (places.length > 0) {
        places.forEach(p => mapInstance.addMarker(p));
        mapInstance.fitBounds(places);
      }
      return;
    }

    // Resolve scheduled places in chronological order
    const dayPlaces: Place[] = [];
    
    activeItinerary.events.forEach((event) => {
      const place = places.find(p => p.id === event.placeId);
      if (place) {
        dayPlaces.push(place);
      }
    });

    // Add markers with sequence labels
    let visitCounter = 0;
    activeItinerary.events.forEach((event) => {
      const place = places.find(p => p.id === event.placeId);
      if (!place) return;

      let label = '';
      if (event.type === 'accommodation_start') label = 'S';
      else if (event.type === 'accommodation_end') label = 'E';
      else if (event.type === 'visit') {
        visitCounter++;
        label = String(visitCounter);
      }

      mapInstance.addMarker(place, label);
    });

    // Draw route line between scheduled places
    if (dayPlaces.length >= 2) {
      mapInstance.drawRoute(dayPlaces, '#6366f1');
      mapInstance.fitBounds(dayPlaces);
    } else if (dayPlaces.length === 1) {
      mapInstance.setCenter(dayPlaces[0].location.lat, dayPlaces[0].location.lng, 12);
    }
  }, [activeItinerary, places]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '350px' }}>
      <div 
        id="leaflet-map-container" 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '16px',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1
        }}
      />
      {/* Visual floating badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-glass)',
        padding: '6px 12px',
        borderRadius: '8px',
        zIndex: 1000, // Leaflet controls sit around 1000
        fontSize: '12px',
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <MapIcon size={12} color="var(--primary)" />
        <span>Leaflet Map View</span>
      </div>
    </div>
  );
};
