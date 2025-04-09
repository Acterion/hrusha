import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";


import { JobDescriptionSchema } from "types/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function readJobDescription(jobDescriptionPath: string) {
  try {
    const fileContent = await fs.readFile(jobDescriptionPath, "utf-8");
    const content = JSON.parse(fileContent);
    const result = JobDescriptionSchema.parse(content);
    return result;
  } catch (error: any) {
    throw new Error(`❌ Failed to read or parse Job Description at "${jobDescriptionPath}": ${error.message}`);
  }
}