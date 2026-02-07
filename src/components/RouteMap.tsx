import { useEffect, useRef, useState } from 'react';
import type { Route } from '../lib/routeParser';
import type { GeocodedLocation } from '../lib/geocoding';
import { getRoutedPath } from '../lib/routing';

interface RouteMapProps {
  routes: Route[];
  geocodedLocations: Map<string, GeocodedLocation>;
}

// Color scheme matching the site theme
const COLORS = {
  hoofdroute: '#D4A03D', // Gold accent
  subroute: '#6B9AC4',   // Blue accent
  marker: '#EAE6DD',     // Cream
};

export default function RouteMap({ routes, geocodedLocations }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routingProgress, setRoutingProgress] = useState({ current: 0, total: 0 });
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    async function loadLeaflet() {
      if (typeof window === 'undefined') return;

      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      setLeafletLoaded(true);
      return L.default;
    }

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainer.current || mapInstance.current) return;

    async function initMap() {
      const L = (await import('leaflet')).default;

      // Initialize map centered on Tasmania
      const map = L.map(mapContainer.current!, {
        center: [-42.0, 146.6], // Tasmania center
        zoom: 7,
        zoomControl: true,
      });

      mapInstance.current = map;

      // Dark themed tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon to match theme
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-dot"></div>',
        iconSize: [12, 12] as [number, number],
        iconAnchor: [6, 6] as [number, number],
      });

      const allLatLngs: any[] = [];

      // Count total routes for progress
      setRoutingProgress({ current: 0, total: routes.length });

      // Plot routes with road routing
      for (let routeIndex = 0; routeIndex < routes.length; routeIndex++) {
        const route = routes[routeIndex];
        const waypoints: { lat: number; lng: number }[] = [];

        // Collect waypoints for this route
        route.addresses.forEach((address) => {
          const location = geocodedLocations.get(address);
          if (location) {
            waypoints.push({ lat: location.lat, lng: location.lng });
            allLatLngs.push(L.latLng(location.lat, location.lng));

            // Add marker with popup
            const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
            marker.bindPopup(
              `<div class="map-popup">
                <strong>${location.placeName}</strong>
              </div>`,
              {
                className: 'themed-popup',
              }
            );
          }
        });

        // Get routed path along roads if we have at least 2 waypoints
        if (waypoints.length >= 2) {
          const routedPath = await getRoutedPath(waypoints);

          const color = route.type === 'Hoofdroute' ? COLORS.hoofdroute : COLORS.subroute;
          const weight = route.type === 'Hoofdroute' ? 4 : 3;

          // Use routed path if available, otherwise fall back to straight line
          const pathCoords = routedPath
            ? routedPath.coordinates.map(c => [c.lat, c.lng] as [number, number])
            : waypoints.map(w => [w.lat, w.lng] as [number, number]);

          const polyline = L.polyline(pathCoords, {
            color,
            weight,
            opacity: 0.8,
            lineCap: 'round' as const,
            lineJoin: 'round' as const,
          }).addTo(map);

          // Hover effect
          polyline.on('mouseover', (e: any) => {
            const layer = e.target;
            const currentWeight = layer.options.weight || 3;
            layer.setStyle({ weight: currentWeight + 2, opacity: 1 });
          });
          polyline.on('mouseout', (e: any) => {
            const layer = e.target;
            layer.setStyle({ weight, opacity: 0.8 });
          });

          // Small delay to respect OSRM rate limits
          if (routeIndex < routes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        setRoutingProgress({ current: routeIndex + 1, total: routes.length });
      }

      // Fit bounds to show all routes
      if (allLatLngs.length > 0) {
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds, { padding: [50, 50] as [number, number] });
      }

      setIsLoading(false);
    }

    initMap();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded, routes, geocodedLocations]);

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: COLORS.hoofdroute }}></span>
          <span>Hoofdroute</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: COLORS.subroute }}></span>
          <span>Subroute</span>
        </div>
      </div>

      {isLoading && (
        <div className="map-loading">
          <p>Routes berekenen...</p>
          {routingProgress.total > 0 && (
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {routingProgress.current} / {routingProgress.total}
            </p>
          )}
        </div>
      )}

      <style>{`
        .map-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .map-container {
          width: 100%;
          height: 100%;
        }

        .map-legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(31, 29, 27, 0.95);
          border: 1px solid rgba(234, 230, 221, 0.2);
          border-radius: 4px;
          padding: 12px 16px;
          font-family: 'Lato', sans-serif;
          color: #EAE6DD;
          font-size: 0.9rem;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 6px 0;
        }

        .legend-line {
          width: 30px;
          height: 3px;
          border-radius: 2px;
        }

        .map-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(31, 29, 27, 0.95);
          padding: 20px 40px;
          border-radius: 4px;
          border: 2px solid #D4A03D;
          color: #EAE6DD;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-align: center;
        }

        /* Custom marker styling */
        :global(.custom-marker) {
          background: transparent;
          border: none;
        }

        :global(.marker-dot) {
          width: 12px;
          height: 12px;
          background: #EAE6DD;
          border: 2px solid #1F1D1B;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }

        /* Popup styling matching theme */
        :global(.themed-popup .leaflet-popup-content-wrapper) {
          background: #1F1D1B;
          color: #EAE6DD;
          border: 1px solid rgba(212, 160, 61, 0.5);
          border-radius: 4px;
          font-family: 'Lato', sans-serif;
          padding: 8px;
        }

        :global(.themed-popup .leaflet-popup-tip) {
          background: #1F1D1B;
          border: 1px solid rgba(212, 160, 61, 0.5);
        }

        :global(.map-popup strong) {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #D4A03D;
        }
      `}</style>
    </div>
  );
}
