import { Place } from './types.js';

export interface MapInstance {
  setCenter(lat: number, lng: number, zoom?: number): void;
  drawRoute(places: Place[], color?: string): void;
  clearMap(): void;
  addMarker(place: Place, label?: string): void;
  destroy(): void;
  fitBounds(places: Place[]): void;
}

export interface MapProvider {
  initializeMap(containerId: string, centerLat: number, centerLng: number, zoom: number): MapInstance;
}

// Custom SVG Icons creator
function createSvgIcon(color: string, category: string, indexLabel?: string): any {
  const L = (window as any).L;
  if (!L) return null;

  let iconHtml = '';
  const markerHtml = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16C0 26.24 16 42 16 42C16 42 32 26.24 32 16C32 7.16 24.84 0 16 0ZM16 22C12.68 22 10 19.32 10 16C10 12.68 12.68 10 16 10C19.32 10 22 12.68 22 16C22 19.32 19.32 22 16 22Z" fill="${color}"/>
    </svg>
  `;

  // Draw custom glyph inside marker
  let iconContent = '';
  if (indexLabel) {
    iconContent = `<div style="color: white; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; text-align: center; line-height: 28px; width: 32px; height: 32px; position: absolute; top: 0; left: 0;">${indexLabel}</div>`;
  } else {
    // Categories glyphs
    let emoji = '📍';
    if (category === 'Accommodation') emoji = '🏨';
    else if (category === 'Restaurant') emoji = '🍽️';
    else if (category === 'Cafe') emoji = '☕';
    else if (category === 'Sightseeing') emoji = '📸';
    else if (category === 'Activity') emoji = '🤿';
    else if (category === 'TransitTerminal') emoji = '✈️';
    
    iconContent = `<div style="font-size: 12px; text-align: center; line-height: 28px; width: 32px; height: 32px; position: absolute; top: 0; left: 0;">${emoji}</div>`;
  }

  iconHtml = `
    <div style="position: relative; width: 32px; height: 42px;">
      ${markerHtml}
      ${iconContent}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: 'custom-leaflet-marker'
  });
}

// Leaflet Implementation
export class LeafletMapProvider implements MapProvider {
  initializeMap(containerId: string, centerLat: number, centerLng: number, zoom: number): MapInstance {
    const L = (window as any).L;
    if (!L) {
      console.warn('Leaflet (L) is not loaded yet from CDN. Returning mock map instance.');
      return this.createMockInstance();
    }

    const map = L.map(containerId).setView([centerLat, centerLng], zoom);

    // Use a beautiful dark-themed or standard sleek map style from CartoDB Voyager/DarkMatter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const markers: any[] = [];
    let polyline: any = null;

    const instance: MapInstance = {
      setCenter(lat: number, lng: number, z?: number) {
        map.setView([lat, lng], z || map.getZoom());
      },
      addMarker(place: Place, label?: string) {
        let color = '#6366f1'; // Indigo (default)
        if (place.category === 'Accommodation') color = '#ec4899'; // Pink
        else if (place.category === 'TransitTerminal') color = '#f97316'; // Orange
        else if (place.isFixed) color = '#10b981'; // Emerald/Green for reserved activities

        const icon = createSvgIcon(color, place.category, label);
        
        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; padding: 4px;">
            <strong style="font-size:14px; color:#1e293b;">${place.name}</strong><br/>
            <span style="font-size:11px; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block; color:#475569;">
              ${place.category}
            </span><br/>
            <span style="font-size:12px; color:#64748b; display:inline-block; margin-top:6px;">${place.location.address}</span><br/>
            <span style="font-size:11px; color:#94a3b8;">영업시간: ${place.openingHours.start} - ${place.openingHours.end}</span>
          </div>
        `;

        const marker = L.marker([place.location.lat, place.location.lng], { icon })
          .bindPopup(popupContent)
          .addTo(map);
        
        markers.push(marker);
      },
      drawRoute(places: Place[], color = '#6366f1') {
        // Clear previous route
        if (polyline) {
          map.removeLayer(polyline);
          polyline = null;
        }

        if (places.length < 2) return;

        const latlngs = places.map(p => [p.location.lat, p.location.lng]);
        polyline = L.polyline(latlngs, {
          color,
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8', // elegant dotted line
          lineJoin: 'round'
        }).addTo(map);
      },
      clearMap() {
        // Remove all markers
        markers.forEach(m => map.removeLayer(m));
        markers.length = 0;
        
        // Remove route line
        if (polyline) {
          map.removeLayer(polyline);
          polyline = null;
        }
      },
      fitBounds(places: Place[]) {
        if (places.length === 0) return;
        const latlngs = places.map(p => [p.location.lat, p.location.lng]);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      },
      destroy() {
        map.remove();
      }
    };

    return instance;
  }

  private createMockInstance(): MapInstance {
    return {
      setCenter() {},
      drawRoute() {},
      clearMap() {},
      addMarker() {},
      destroy() {},
      fitBounds() {}
    };
  }
}
