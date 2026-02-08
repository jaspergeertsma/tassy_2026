/**
 * Routing Module
 * Uses OSRM API to get road-based routes between coordinates
 */

export interface RouteCoordinate {
    lat: number;
    lng: number;
}

export interface RoutedPath {
    coordinates: RouteCoordinate[];
    distance: number; // in meters
    duration: number; // in seconds
}

/**
 * Get routed path between multiple waypoints using OSRM
 * @param waypoints Array of coordinates to route through
 * @returns Promise with routed path including all intermediate points along roads
 */
export async function getRoutedPath(waypoints: RouteCoordinate[]): Promise<RoutedPath | null> {
    if (waypoints.length < 2) {
        return null;
    }

    try {
        // Format coordinates for OSRM: lng,lat;lng,lat;...
        const coords = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');

        // Use public OSRM demo server
        // Add steps=true ensures detailed instructions (implicitly forces better waypoint handling)
        // continue_straight=true avoids U-turns at intermediate waypoints if possible (though for A-B-A it must turn around)
        // annotations=true gives more data
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true&continue_straight=true`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error('OSRM routing failed:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            console.warn('No route found between waypoints');
            return null;
        }

        const route = data.routes[0];

        // Convert GeoJSON coordinates [lng, lat] to our format {lat, lng}
        const coordinates: RouteCoordinate[] = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
                lat: coord[1],
                lng: coord[0]
            })
        );

        return {
            coordinates,
            distance: route.distance,
            duration: route.duration
        };
    } catch (error) {
        console.error('Error getting routed path:', error);
        return null;
    }
}

/**
 * Add delay between requests to respect rate limits
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get routed paths for multiple routes with rate limiting
 * OSRM demo server has rate limits, so we add delays between requests
 */
export async function getMultipleRoutedPaths(
    routeWaypoints: RouteCoordinate[][],
    delayMs: number = 500
): Promise<(RoutedPath | null)[]> {
    const results: (RoutedPath | null)[] = [];

    for (let i = 0; i < routeWaypoints.length; i++) {
        const waypoints = routeWaypoints[i];
        const routed = await getRoutedPath(waypoints);
        results.push(routed);

        // Add delay between requests (except for last one)
        if (i < routeWaypoints.length - 1) {
            await delay(delayMs);
        }
    }

    return results;
}
