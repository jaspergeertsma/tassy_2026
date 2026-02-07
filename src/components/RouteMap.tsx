import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Route } from '../lib/routeParser';
import type { GeocodedLocation } from '../lib/geocoding';

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
    const mapInstance = useRef<L.Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        // Initialize map centered on Tasmania
        const map = L.map(mapContainer.current, {
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
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });

        const allLatLngs: L.LatLng[] = [];

        // Plot routes
        routes.forEach((route) => {
            const routeCoords: L.LatLng[] = [];

            // Get coordinates for each address in the route
            route.addresses.forEach((address) => {
                const location = geocodedLocations.get(address);
                if (location) {
                    const latLng = L.latLng(location.lat, location.lng);
                    routeCoords.push(latLng);
                    allLatLngs.push(latLng);

                    // Add marker with popup
                    const marker = L.marker(latLng, { icon: customIcon }).addTo(map);
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

            // Draw polyline if we have at least 2 points
            if (routeCoords.length >= 2) {
                const color = route.type === 'Hoofdroute' ? COLORS.hoofdroute : COLORS.subroute;
                const polyline = L.polyline(routeCoords, {
                    color,
                    weight: route.type === 'Hoofdroute' ? 4 : 3,
                    opacity: 0.8,
                    lineCap: 'round',
                    lineJoin: 'round',
                }).addTo(map);

                // Hover effect
                polyline.on('mouseover', (e) => {
                    const layer = e.target as L.Polyline;
                    const currentWeight = layer.options.weight || 3;
                    layer.setStyle({ weight: currentWeight + 2, opacity: 1 });
                });
                polyline.on('mouseout', (e) => {
                    const layer = e.target as L.Polyline;
                    const currentWeight = layer.options.weight || 3;
                    layer.setStyle({ weight: currentWeight, opacity: 0.8 });
                });
            }
        });

        // Fit bounds to show all routes
        if (allLatLngs.length > 0) {
            const bounds = L.latLngBounds(allLatLngs);
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        setIsLoading(false);

        // Cleanup
        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [routes, geocodedLocations]);

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
                    <p>Kaart laden...</p>
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
