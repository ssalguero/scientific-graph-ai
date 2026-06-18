import * as XLSX from "xlsx";
import type { ImportFileFormat, SheetSnapshot, WorkbookSnapshot } from "../types";
import { trimMatrixToBounds } from "../shared/matrix";

export const detectFileFormat = (fileName: string): ImportFileFormat | null => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".txt")) return "txt";
  if (lower.endsWith(".xlsx")) return "xlsx";
  if (lower.endsWith(".xls")) return "xls";
  if (lower.endsWith(".ods")) return "ods";
  return null;
};

const sheetToMatrix = (sheet: XLSX.WorkSheet): unknown[][] => {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  });
  return trimMatrixToBounds(matrix);
};

export const readWorkbookFromBuffer = (
  buffer: ArrayBuffer,
  fileName: string,
  format: ImportFileFormat
): WorkbookSnapshot => {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets: SheetSnapshot[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    return {
      name,
      ref: sheet["!ref"],
      matrix: sheet["!ref"] ? sheetToMatrix(sheet) : [],
    };
  });

  return { fileName, format, sheets };
};

export const readWorkbookFromFile = async (file: File): Promise<WorkbookSnapshot> => {
  const format = detectFileFormat(file.name);
  if (!format || format === "csv" || format === "txt") {
    throw new Error("Unsupported workbook format");
  }
  const buffer = await file.arrayBuffer();
  return readWorkbookFromBuffer(buffer, file.name, format);
};

export const readDelimitedTextFromFile = async (
  file: File
): Promise<{ text: string; format: "csv" | "txt" }> => {
  const format = detectFileFormat(file.name);
  if (format !== "csv" && format !== "txt") {
    throw new Error("Expected delimited text file");
  }
  const text = await file.text();
  return { text, format };
};

export const readWorkbookFromPath = (filePath: string): WorkbookSnapshot => {
  const format = detectFileFormat(filePath);
  if (!format || format === "csv" || format === "txt") {
    throw new Error("Unsupported workbook path");
  }
  const workbook = XLSX.readFile(filePath);
  const sheets: SheetSnapshot[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    return {
      name,
      ref: sheet["!ref"],
      matrix: sheet["!ref"] ? sheetToMatrix(sheet) : [],
    };
  });
  return { fileName: filePath.split(/[/\\]/).pop() ?? filePath, format, sheets };
};
