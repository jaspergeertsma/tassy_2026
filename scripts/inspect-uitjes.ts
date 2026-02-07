
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.resolve(__dirname, '../assets/Tasmanië 2026-2027.xlsx');

const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames.find(n => n.includes('Uitjes'));

if (!sheetName) {
    console.error('Sheet "Uitjes" not found!');
    process.exit(1);
}

const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
console.log(JSON.stringify(data, null, 2));
