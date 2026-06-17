export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  timezone: string;
}

export type PlaceCategory = 'Restaurant' | 'Cafe' | 'Sightseeing' | 'Shopping' | 'Activity' | 'Accommodation' | 'TransitTerminal';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  location: Location;
  openingHours: {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
  };
  duration: number; // stay duration in minutes
  reservationTime?: {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
    dateIndex: number;
  };
  isFixed: boolean; // true if fixed schedule (reservation / travel transit)
}

export interface Accommodation {
  dateIndex: number;
  placeId: string;
}

export type TransportMode = 'car' | 'walking' | 'transit' | 'custom';

export interface TripConfig {
  id: string;
  title: string;
  countries: string[];
  cities: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  transportMode: TransportMode;
  accommodations: Accommodation[];
  places: Place[];
}

export interface RouteSegment {
  fromPlaceId: string;
  toPlaceId: string;
  transportMode: TransportMode;
  distanceKm: number;
  durationMin: number;
}

export interface ScheduledEvent {
  placeId: string;
  arrivalTime: string;
  departureTime: string;
  durationMin: number;
  isFixed: boolean;
  type: 'visit' | 'accommodation_start' | 'accommodation_end' | 'travel';
  travelToNext?: RouteSegment;
}

export interface DailyItinerary {
  dateIndex: number;
  dateStr: string;
  events: ScheduledEvent[];
}

export interface OptimizationResult {
  itineraries: DailyItinerary[];
  excludedPlaces: {
    placeId: string;
    reason: string;
  }[];
}
