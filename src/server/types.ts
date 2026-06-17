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
    dateIndex: number; // 0-indexed day index
  };
  isFixed: boolean; // true if it is a fixed schedule (reservation or transit event)
}

export interface Accommodation {
  dateIndex: number; // day index (night of that day)
  placeId: string;   // place ID of the accommodation
}

export type TransportMode = 'car' | 'walking' | 'transit' | 'custom';

export interface TripConfig {
  id: string;
  title: string;
  countries: string[]; // ISO country codes, e.g., ["KR", "JP"]
  cities: string[];    // city names, e.g., ["Jeju", "Udo"]
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
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
  arrivalTime: string;   // "HH:MM"
  departureTime: string; // "HH:MM"
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
