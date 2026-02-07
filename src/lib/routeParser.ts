/**
 * Route Parser Module
 * Parses routes from HTML table export
 */

export interface Route {
    type: 'Hoofdroute' | 'Subroute';
    addresses: string[];
}

/**
 * Parse routes from HTML table
 */
export function parseRoutesFromHTML(htmlContent: string): Route[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const routes: Route[] = [];
    const rows = doc.querySelectorAll('tbody tr');

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;

        const typeCell = cells[0]?.textContent?.trim();
        if (!typeCell || (typeCell !== 'Hoofdroute' && typeCell !== 'Subroute')) {
            return;
        }

        const type = typeCell as 'Hoofdroute' | 'Subroute';
        const addresses: string[] = [];

        // Get addresses from remaining cells (skip first cell which is type)
        for (let i = 1; i < cells.length; i++) {
            const address = cells[i]?.textContent?.trim();
            if (address && address.length > 0) {
                addresses.push(address);
            }
        }

        if (addresses.length >= 2) {
            routes.push({ type, addresses });
        }
    });

    return routes;
}

/**
 * Extract place name from full address
 * e.g., "Hobart, Tasmania" -> "Hobart"
 */
export function extractPlaceName(address: string): string {
    const parts = address.split(',');
    return parts[0]?.trim() || address;
}
