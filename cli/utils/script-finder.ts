import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

// Get the equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_DIR = path.resolve(__dirname, "../scripts");

/**
 * Finds available script names (filenames without extension) in the scripts directory.
 */
export async function findAvailableScripts(): Promise<string[]> {
  try {
    const files = await fs.readdir(SCRIPTS_DIR);
    return files
      .filter((file) => file.endsWith(".ts")) // Only include .ts files
      .map((file) => path.basename(file, ".ts")); // Get filename without extension
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Scripts directory doesn't exist
      return [];
    }
    console.error("Error reading scripts directory:", error);
    return [];
  }
}
