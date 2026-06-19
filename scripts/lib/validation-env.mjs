import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.join(__dirname, "..", "..");

export const BASE_URL = process.env.VALIDATION_BASE_URL ?? "http://localhost:3000";

export const DEFAULT_DATASET5_PATH =
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset5.csv";

export const DEFAULT_DATASET6_PATH =
  "C:\\Users\\Santiago Salseguero\\Desktop\\IA CIENTIFICA\\Dataset6.csv";

export const getDataset5Path = () =>
  process.env.DATASET5_PATH ?? DEFAULT_DATASET5_PATH;

export const getDataset6Path = () =>
  process.env.DATASET6_PATH ?? DEFAULT_DATASET6_PATH;

export const BASELINE_SCORES = {
  dataset5: { evidence: "82.7", readiness: "77.0", overall: "77.0" },
  dataset6: { evidence: "73.3", readiness: "67.5", overall: "67.5" },
};

export const assertDatasetExists = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
};
