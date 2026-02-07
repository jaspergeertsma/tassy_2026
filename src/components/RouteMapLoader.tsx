import { useEffect, useState } from 'react';
import RouteMap from './RouteMap';
import { parseRoutesFromHTML } from '../lib/routeParser';
import { geocodeAddresses, clearGeocodeCache } from '../lib/geocoding';
import type { Route } from '../lib/routeParser';
import type { GeocodedLocation } from '../lib/geocoding';

export default function RouteMapLoader() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [geocodedLocations, setGeocodedLocations] = useState<Map<string, GeocodedLocation>>(new Map());
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({ current: 0, total: 0, address: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAndGeocodeRoutes() {
            try {
                // Fetch HTML file
                const response = await fetch('/Blad4.html');
                if (!response.ok) {
                    throw new Error('Failed to load routes data');
                }

                const htmlContent = await response.text();

                // Parse routes
                const parsedRoutes = parseRoutesFromHTML(htmlContent);
                setRoutes(parsedRoutes);

                if (parsedRoutes.length === 0) {
                    throw new Error('No routes found in data');
                }

                // Collect all unique addresses
                const allAddresses = new Set<string>();
                parsedRoutes.forEach(route => {
                    route.addresses.forEach(addr => allAddresses.add(addr));
                });

                // Geocode addresses with progress tracking
                const geocoded = await geocodeAddresses(
                    Array.from(allAddresses),
                    (current, total, address) => {
                        setProgress({ current, total, address });
                    }
                );

                setGeocodedLocations(geocoded);
                setLoading(false);
            } catch (err) {
                console.error('Error loading routes:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setLoading(false);
            }
        }

        loadAndGeocodeRoutes();
    }, []);

    // Handler to clear cache (useful for debugging)
    const handleClearCache = () => {
        clearGeocodeCache();
        window.location.reload();
    };

    if (error) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#EAE6DD',
                fontFamily: 'var(--font-body)',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div>
                    <h2 style={{ color: '#D4A03D', marginBottom: '1rem' }}>Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#EAE6DD',
                fontFamily: 'var(--font-body)',
                gap: '1rem'
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#D4A03D'
                }}>
                    Routes laden...
                </div>
                {progress.total > 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            Geocoding: {progress.current} / {progress.total}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#9E9990',
                            maxWidth: '400px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {progress.address}
                        </div>
                        <div style={{
                            width: '300px',
                            height: '4px',
                            background: '#2A2624',
                            borderRadius: '2px',
                            marginTop: '1rem',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(progress.current / progress.total) * 100}%`,
                                height: '100%',
                                background: '#D4A03D',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <RouteMap routes={routes} geocodedLocations={geocodedLocations} />

            {/* Debug button - remove in production */}
            {import.meta.env.DEV && (
                <button
                    onClick={handleClearCache}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        padding: '8px 16px',
                        background: '#2A2624',
                        border: '1px solid #D4A03D',
                        color: '#EAE6DD',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        zIndex: 1000
                    }}
                >
                    Clear Cache
                </button>
            )}
        </>
    );
}
