import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { generateText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { fileURLToPath } from "url";
import { generateObject } from "ai";
import { z } from "zod";
import {evaluateGrades, evaluateSingleGrade, readCV} from "cli/core/processCV";

// Import types and schemas
import { Candidate, Decision, Status, schemas } from "@types";

import { GradeSchema } from "../../types/schemas";
export const GradeArraySchema = z.array(GradeSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CV location
const CV_FILE_PATH = path.resolve(__dirname, "../../data/CVs/pasha.txt");

// Grades location
const path2Grades = path.resolve(__dirname,"../../data/Grades/mobile.json");
const raw = await fs.readFile(path2Grades, "utf-8");
const parsed = JSON.parse(raw);
const grades = GradeArraySchema.parse(parsed);

export async function run(){
    let textCV: string;
    textCV = await readCV(CV_FILE_PATH);
    const Results = await evaluateGrades(grades, textCV);
    console.log(Results);
}