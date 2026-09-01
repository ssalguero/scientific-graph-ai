import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const rows = [
  ["x", "y"],
  [1, 20],
  [2, 21],
];
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Datos");

const write = (name: string, bookType: XLSX.BookType) => {
  const filePath = path.join(dir, name);
  XLSX.writeFile(wb, filePath, { bookType, cellDates: false });
  const buf = fs.readFileSync(filePath);
  process.stdout.write(`${name} ${buf.length} bytes bookType=${bookType}\n`);
};

write("s8-xy.xlsx", "xlsx");
write("s8-xy.xls", "xls");
write("s8-xy.ods", "ods");
