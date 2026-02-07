/**
 * Smart merge script: Updates itinerary.json with new order from reis.html
 * while preserving custom fields like images and enhanced notes
 */

const fs = require('fs');
const path = require('path');

// Parse HTML table from reis.html
function parseReisHTML(htmlContent) {
    const days = [];

    // Extract table rows using regex
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const rows = Array.from(htmlContent.matchAll(rowRegex));

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i][1];

        // Extract cells
        const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const cells = Array.from(row.matchAll(cellRegex)).map(m => {
            // Strip HTML tags and decode entities
            let text = m[1]
                .replace(/<[^>]+>/g, '')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
            return text;
        });

        if (cells.length < 6) continue;

        const dayNumber = parseInt(cells[0]) || 0;
        const title = cells[1] || '';
        const dateStr = cells[2] || '';
        const notes = cells[4] || '';
        const activityName = cells[5] || '';

        // Parse date (format: DD-MM-YYYY)
        const [day, month, year] = dateStr.split('-').map(s => s.trim());
        const date = year && month && day ? `${year}-${month}-${day}` : dateStr;

        // Determine region from title
        let region = 'Tasmanië';
        if (title.toLowerCase().includes('campbell town')) region = 'Campbell town';
        else if (title.toLowerCase().includes('cygnet')) region = 'Cygnet';
        else if (title.toLowerCase().includes('northwest')) region = 'Northwest';
        else if (title.toLowerCase().includes('tussenstop')) region = 'Tussenstop';
        else if (title.toLowerCase().includes('nederland')) region = 'Nederland';

        // Create activity if exists
        const activities = [];
        if (activityName && activityName !== '​' && activityName.length > 0) {
            activities.push({
                name: activityName,
                url: '' // URLs will be preserved from existing data
            });
        }

        days.push({
            dayNumber,
            date,
            title,
            region,
            locations: [region],
            activities,
            notes,
            images: [] // Will be filled from existing data
        });
    }

    return days;
}

// Smart merge: preserve custom data from existing itinerary
function mergeItineraries(newDays, existingDays) {
    const merged = [];

    // Create a map of existing days by title for easy lookup
    const existingMap = new Map();
    for (const day of existingDays) {
        existingMap.set(day.title.toLowerCase().trim(), day);
    }

    for (const newDay of newDays) {
        const key = newDay.title.toLowerCase().trim();
        const existing = existingMap.get(key);

        if (existing) {
            // Merge: use new structure but preserve custom fields
            merged.push({
                ...newDay,
                // Preserve images from existing
                images: existing.images || [],
                // Preserve enhanced notes if they exist, otherwise use new notes
                notes: (existing.notes && existing.notes.length > newDay.notes.length)
                    ? existing.notes
                    : newDay.notes,
                // Preserve activity URLs
                activities: newDay.activities.map((newAct, i) => {
                    const existingAct = existing.activities?.[i];
                    return {
                        name: newAct.name,
                        url: existingAct?.url || newAct.url
                    };
                })
            });
        } else {
            // New day: just add it
            merged.push(newDay);
        }
    }

    return merged;
}

// Main execution
function main() {
    try {
        // Read files
        const reisPath = path.join(__dirname, '../public/reis.html');
        const itineraryPath = path.join(__dirname, '../src/data/itinerary.json');

        console.log('Reading reis.html...');
        const reisHTML = fs.readFileSync(reisPath, 'utf-8');

        console.log('Reading existing itinerary.json...');
        const existingItinerary = JSON.parse(
            fs.readFileSync(itineraryPath, 'utf-8')
        );

        console.log('Parsing reis.html...');
        const newDays = parseReisHTML(reisHTML);
        console.log(`Found ${newDays.length} days in reis.html`);

        console.log('Merging with existing data...');
        const merged = mergeItineraries(newDays, existingItinerary);
        console.log(`Result: ${merged.length} days`);

        // Write output
        console.log('Writing merged itinerary.json...');
        fs.writeFileSync(
            itineraryPath,
            JSON.stringify(merged, null, 2),
            'utf-8'
        );

        console.log('✅ Successfully merged itinerary!');
        console.log('\nChanges:');
        console.log(`- Old: ${existingItinerary.length} days`);
        console.log(`- New: ${merged.length} days`);
        console.log('- Custom data (images, enhanced notes) preserved');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
