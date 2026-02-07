/**
 * Geocoding Module with localStorage caching
 * Supports Nominatim (OpenStreetMap) geocoding service
 */

export interface GeocodedLocation {
    lat: number;
    lng: number;
    placeName: string;
    address: string;
    cachedAt: number;
}

const CACHE_KEY_PREFIX = 'geocode_';
const CACHE_VERSION = 'v1';
const CACHE_TTL_DAYS = 30;
const GEOCODE_DELAY_MS = 1000; // Rate limiting: 1 request per second

/**
 * Get cache key for an address
 */
function getCacheKey(address: string): string {
    return `${CACHE_KEY_PREFIX}${CACHE_VERSION}_${address}`;
}

/**
 * Check if cached location is still valid
 */
function isCacheValid(cachedAt: number): boolean {
    const ttlMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - cachedAt < ttlMs;
}

/**
 * Get cached location from localStorage
 */
function getCachedLocation(address: string): GeocodedLocation | null {
    try {
        const cached = localStorage.getItem(getCacheKey(address));
        if (!cached) return null;

        const location: GeocodedLocation = JSON.parse(cached);
        if (isCacheValid(location.cachedAt)) {
            return location;
        }

        // Remove expired cache
        localStorage.removeItem(getCacheKey(address));
        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

/**
 * Save location to localStorage cache
 */
function cacheLocation(location: GeocodedLocation): void {
    try {
        localStorage.setItem(getCacheKey(location.address), JSON.stringify(location));
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
}

/**
 * Geocode a single address using Nominatim
 */
async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TassyCrew2026/1.0' // Nominatim requires User-Agent
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            console.warn(`No results found for address: ${address}`);
            return null;
        }

        const result = data[0];
        const location: GeocodedLocation = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            placeName: result.display_name.split(',')[0] || result.name || address,
            address,
            cachedAt: Date.now()
        };

        cacheLocation(location);
        return location;
    } catch (error) {
        console.error(`Error geocoding address "${address}":`, error);
        return null;
    }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode multiple addresses with caching and rate limiting
 * Returns a Map of address -> GeocodedLocation
 */
export async function geocodeAddresses(
    addresses: string[],
    onProgress?: (current: number, total: number, address: string) => void
): Promise<Map<string, GeocodedLocation>> {
    const results = new Map<string, GeocodedLocation>();
    const uniqueAddresses = [...new Set(addresses)]; // Remove duplicates

    for (let i = 0; i < uniqueAddresses.length; i++) {
        const address = uniqueAddresses[i];

        if (onProgress) {
            onProgress(i + 1, uniqueAddresses.length, address);
        }

        // Check cache first
        const cached = getCachedLocation(address);
        if (cached) {
            results.set(address, cached);
            continue;
        }

        // Geocode with rate limiting
        const location = await geocodeAddress(address);
        if (location) {
            results.set(address, location);
        }

        // Rate limiting: wait before next request (except for last item)
        if (i < uniqueAddresses.length - 1) {
            await delay(GEOCODE_DELAY_MS);
        }
    }

    return results;
}

/**
 * Clear all geocoding cache
 * Useful when routes data changes
 */
export function clearGeocodeCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    console.log('Geocode cache cleared');
}
