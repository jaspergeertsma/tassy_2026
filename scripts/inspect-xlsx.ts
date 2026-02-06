
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const filePath = path.resolve('assets/Tasmanië 2026-2027.xlsx');

const effectiveXLSX = XLSX.readFile ? XLSX : (XLSX as any).default;
const workbook = effectiveXLSX.readFile(filePath);

workbook.SheetNames.forEach((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    const data = effectiveXLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
});
