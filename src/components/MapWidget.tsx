import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { searchDirectory, type DirectoryEntry } from '../lib/api';
import { haversineDistance, formatDistance, type LatLng } from '../lib/distance';
import { calculateRoute, formatRouteDistance, formatDuration } from '../lib/routing';
import type { GeocodeResult } from '../lib/geocode';

// Sample geocoded data for demo (in production, this would be pre-geocoded)
const SAMPLE_GEOCODED_DATA: Record<string, GeocodeResult> = {
  "Manila": { lat: 14.5995, lng: 120.9842, displayName: "Manila, Philippines" },
  "Quezon City": { lat: 14.6760, lng: 121.0437, displayName: "Quezon City, Philippines" },
  "Cebu City": { lat: 10.3157, lng: 123.8854, displayName: "Cebu City, Philippines" },
  "Davao City": { lat: 7.0731, lng: 125.6128, displayName: "Davao City, Philippines" },
  "Baguio": { lat: 16.4023, lng: 120.5939, displayName: "Baguio, Philippines" },
  "Iloilo City": { lat: 10.7202, lng: 122.5621, displayName: "Iloilo City, Philippines" },
};

// Map fly-to controller component
function FlyToController({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 13, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Distance calculation component
function DistanceDisplay({
  userLocation,
  destination,
}: {
  userLocation: GeolocationPosition | null;
  destination: DirectoryEntry & { lat?: number; lng?: number };
}) {
  const [straightLineDist, setStraightLineDist] = useState<string | null>(null);
  const [travelDist, setTravelDist] = useState<string | null>(null);
  const [travelDuration, setTravelDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLocation || !destination.lat || !destination.lng) {
      setStraightLineDist(null);
      setTravelDist(null);
      return;
    }

    const destCoords = { lat: destination.lat, lng: destination.lng };
    const userCoords = { lat: userLocation.coords.latitude, lng: userLocation.coords.longitude };

    // Calculate straight-line distance
    const dist = haversineDistance(userCoords, destCoords);
    setStraightLineDist(formatDistance(dist));

    // Calculate route distance via OSRM
    setLoading(true);
    setError(null);
    calculateRoute(userCoords, destCoords, 'driving')
      .then(route => {
        setTravelDist(formatRouteDistance(route.distance));
        setTravelDuration(formatDuration(route.duration));
      })
      .catch(() => {
        setError('Route calculation unavailable');
        setTravelDist(null);
      })
      .finally(() => setLoading(false));
  }, [userLocation, destination]);

  if (!userLocation || !destination.lat || !destination.lng) {
    return (
      <div className="text-sm text-slate-500">
        Location access required for distance calculation
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-600">Straight-line:</span>
        <span className="font-medium">{straightLineDist}</span>
      </div>
      {loading ? (
        <div className="text-slate-500">Calculating route...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : travelDist ? (
        <>
          <div className="flex justify-between">
            <span className="text-slate-600">Travel distance:</span>
            <span className="font-medium">{travelDist}</span>
          </div>
          {travelDuration && (
            <div className="flex justify-between">
              <span className="text-slate-600">Est. time:</span>
              <span className="font-medium">{travelDuration}</span>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function MapWidget() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(null);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  // Dynamically import Leaflet on client side only
  useEffect(() => {
    import('leaflet').then(leaflet => {
      // Fix Leaflet default icon issue
      const DefaultIcon = leaflet.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      leaflet.Marker.prototype.options.icon = DefaultIcon;
      setL(leaflet);
    });
  }, []);

  // Search directory
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['directory-search', searchQuery],
    queryFn: () => searchDirectory(searchQuery),
    enabled: searchQuery.length > 0,
  });

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => setUserLocation(position),
      error => {
        console.warn('Geolocation error:', error.message);
        setLocationError('Location access denied');
      }
    );
  }, []);

  // Extract coordinates from search results (using sample geocoding for demo)
  const entriesWithCoords = useMemo(() => {
    const entries = searchData?.data || [];
    return entries.map(entry => {
      // Try to find coordinates based on address
      const addressLower = entry.address?.toLowerCase() || '';
      for (const [city, coords] of Object.entries(SAMPLE_GEOCODED_DATA)) {
        if (addressLower.includes(city.toLowerCase())) {
          return { ...entry, lat: coords.lat, lng: coords.lng };
        }
      }
      return entry;
    });
  }, [searchData]);

  const handleSearch = useCallback(() => {
    // Trigger search by updating the query (handled by useQuery)
  }, []);

  const handleMarkerClick = useCallback((entry: DirectoryEntry & { lat?: number; lng?: number }) => {
    setSelectedEntry(entry);
    if (entry.lat && entry.lng) {
      setFlyTarget({ lat: entry.lat, lng: entry.lng });
    }
  }, []);

  const center: [number, number] = [12.8797, 121.7740]; // Philippines center

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search directory by name, city, or keyword..."
            className="flex-1 p-2 border border-slate-300 rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Search
          </button>
        </div>
        {locationError && (
          <p className="text-xs text-amber-600 mt-2">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
            {locationError} - Distance calculation unavailable
          </p>
        )}
      </div>

      {/* Map and Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-2xl overflow-hidden">
          <MapContainer
            center={center}
            zoom={6}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToController target={flyTarget} />

            {/* Directory markers */}
            {entriesWithCoords.map((entry, idx) =>
              entry.lat && entry.lng ? (
                <Marker
                  key={idx}
                  position={[entry.lat, entry.lng]}
                  eventHandlers={{
                    click: () => handleMarkerClick(entry),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-slate-900">{entry.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{entry.address}</p>
                      {entry.phone && (
                        <p className="text-sm text-slate-500 mt-1">{entry.phone}</p>
                      )}
                      {entry.email && (
                        <a href={`mailto:${entry.email}`} className="text-sm text-blue-600 hover:underline block mt-1">
                          {entry.email}
                        </a>
                      )}
                      <hr className="my-2" />
                      <DistanceDisplay
                        userLocation={userLocation}
                        destination={entry}
                      />
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

            {/* User location marker */}
            {userLocation && L && (
              <Marker
                position={[userLocation.coords.latitude, userLocation.coords.longitude]}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="width: 12px; height: 12px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [12, 12],
                })}
              >
                <Popup>Your location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 overflow-y-auto max-h-[500px]">
          <h3 className="font-semibold text-slate-800 mb-4">
            {searchLoading ? 'Searching...' : `${entriesWithCoords.length} locations found`}
          </h3>

          {selectedEntry && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900">{selectedEntry.name}</h4>
              <p className="text-sm text-blue-700 mt-1">{selectedEntry.address}</p>
              {selectedEntry.phone && (
                <p className="text-sm text-blue-600 mt-1">{selectedEntry.phone}</p>
              )}
              <button
                onClick={() => setSelectedEntry(null)}
                className="mt-2 text-xs text-blue-500 hover:underline"
              >
                Close
              </button>
            </div>
          )}

          <div className="space-y-2">
            {entriesWithCoords.slice(0, 50).map((entry, idx) => (
              <button
                key={idx}
                onClick={() => handleMarkerClick(entry)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedEntry === entry
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="font-medium text-slate-800 text-sm">{entry.name}</div>
                <div className="text-xs text-slate-500">{entry.address}</div>
              </button>
            ))}
          </div>

          {entriesWithCoords.length === 0 && !searchLoading && (
            <p className="text-sm text-slate-400 italic">
              Search for directory entries to see them on the map
            </p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-500">
        <i className="fa-solid fa-info-circle mr-1"></i>
        Click a marker to see details and calculate distance from your location. Use the search bar to filter directory entries.
      </div>
    </div>
  );
}