
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.resolve(__dirname, '../assets/Tasmanië 2026-2027.xlsx');
const OUTPUT_DIR = path.resolve(__dirname, '../src/data');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Handle default export if needed
const effectiveXLSX = XLSX.readFile ? XLSX : (XLSX as any).default;

if (!effectiveXLSX || typeof effectiveXLSX.readFile !== 'function') {
    console.error('XLSX library not loaded correctly.');
    process.exit(1);
}

const workbook = effectiveXLSX.readFile(EXCEL_PATH);
console.log('Available sheets:', workbook.SheetNames);

// Helper for dates
function parseExcelDate(serial: number | string): string {
    if (typeof serial === 'number') {
        const date = new Date(Math.round((serial - 25569) * 864e5));
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    return String(serial);
}

// Helper to find sheet name
function findSheet(wb: XLSX.WorkBook, partialName: string): string | undefined {
    return wb.SheetNames.find(n => n.includes(partialName));
}

// 1. Planning
const planningName = findSheet(workbook, 'Planning');
if (!planningName) { console.error('Planning sheet not found'); process.exit(1); }
const planningData = effectiveXLSX.utils.sheet_to_json(workbook.Sheets[planningName]);

const itineraryDays: any[] = [];
const flights: any[] = [];
const stays: any[] = [];

let currentStay = {
    name: '',
    checkIn: '',
    checkOut: '',
    days: 0,
    region: ''
};

planningData.forEach((row: any, index: number) => {
    const rawDate = row['Datum'];
    const dateStr = parseExcelDate(rawDate);
    const dayStr = row['Dag'] || '';
    const desc = row['Invulling'] || '';
    const activity = row['Uitje'] || '';

    // Detect Flight
    if (desc.includes('🛫') || desc.includes('🛬') || dayStr.toLowerCase().includes('vertrek') || dayStr.toLowerCase().includes('aankomst')) {
        flights.push({
            date: dateStr,
            description: desc,
            isOutbound: index < 5, // heuristic
            title: dayStr
        });
    }

    // Detect Stay Region
    // Pattern: "Location dag X" or "Location"
    let region = 'Tasmanië';
    // Remove "dag X" or "Dag X"
    const dayMatch = dayStr.match(/^(.*?)\s*dag\s*\d+/i);
    if (dayMatch) {
        region = dayMatch[1].trim();
    } else if (dayStr && !dayStr.includes('Vertrek') && !dayStr.includes('Aankomst') && !dayStr.match(/(\.|:)/)) {
        // If it's just a name like "Campbell town" (though excel usually says 'Campbell town dag 1')
        region = dayStr;
    }

    if (region !== 'Tasmanië' && region !== currentStay.name) {
        // New stay detected
        if (currentStay.name) {
            currentStay.checkOut = dateStr;
            stays.push({ ...currentStay, id: `stay-${stays.length + 1}` });
        }
        currentStay = {
            name: region,
            region: region,
            checkIn: dateStr,
            checkOut: '',
            days: 0
        };
    }
    if (region === currentStay.name) {
        currentStay.days++;
    }

    itineraryDays.push({
        dayNumber: index + 1, // or parse from dayStr
        date: dateStr,
        title: dayStr || `Day ${index + 1}`,
        region: region,
        locations: [region],
        activities: activity ? [activity] : [],
        notes: desc,
        images: []
    });
});

// Push last stay
if (currentStay.name) {
    // Approx checkout next day
    const lastDate = new Date(itineraryDays[itineraryDays.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);
    currentStay.checkOut = lastDate.toISOString().split('T')[0];
    stays.push({ ...currentStay, id: `stay-${stays.length + 1}` });
}

// Normalize flights to required structure
// flights[] defined in interfaces: { direction, segments: [] }
// We have flat list.
// Mock structure for now.
const structuredFlights = [
    {
        direction: 'outbound',
        segments: flights.filter(f => f.isOutbound).map(f => ({
            from: 'Amsterdam',
            to: 'Tasmania',
            departLocal: '17:00',
            arriveLocal: '16:30', // From text
            airline: 'China Southern',
            flightNo: 'CZ...',
            duration: '24h',
            date: f.date
        }))
    },
    {
        direction: 'return',
        segments: flights.filter(f => !f.isOutbound).map(f => ({
            from: 'Tasmania',
            to: 'Amsterdam',
            departLocal: '10:00',
            arriveLocal: '20:00',
            airline: 'China Southern',
            flightNo: 'CZ...',
            duration: '24h',
            date: f.date
        }))
    }
];

fs.writeFileSync(path.join(OUTPUT_DIR, 'itinerary.json'), JSON.stringify(itineraryDays, null, 2));
console.log(`Generated itinerary.json with ${itineraryDays.length} items.`);

fs.writeFileSync(path.join(OUTPUT_DIR, 'stays.json'), JSON.stringify(stays, null, 2));
console.log(`Generated stays.json with ${stays.length} items.`);

fs.writeFileSync(path.join(OUTPUT_DIR, 'flights.json'), JSON.stringify(structuredFlights, null, 2));
console.log(`Generated flights.json with ${structuredFlights.length} items.`);
