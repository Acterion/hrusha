import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { generateText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { fileURLToPath } from "url";
import { generateObject } from "ai";
import { z } from "zod";


// Import types and schemas
import { Candidate, Decision, Status, schemas } from "@types";
import { EvalSchema, GradeSchema, JobDescriptionSchema } from "types/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOB_DESCRIPTION_PATH = path.resolve(__dirname, "../../public/job_description.json");
const CV_FILE_PATH = path.resolve(__dirname, "../../data/input/cv.txt");


async function evaluateGrades(grades: any, textCV: any) {
    const systemPrompt = `
    You are a rigorous and intelligent HR evaluator.

    You will be given:
    1. A candidate's CV.
    2. A list of evaluation criteria ("grades") in the following format:
    - name: the skill or trait to be evaluated
    - description: what this grade measures
    - scale: the evaluation scale (e.g., "1-100")

    Your task is to carefully read the CV and, for each grade:
    - Assign a value using the provided scale.
    - Justify your evaluation clearly and concisely based on the CV.

    Respond such that each item has the following structure:
    name: string,       // same as in the grade
    value: string,      // number or level on the specified scale
    reason: string      // short explanation why this score was assigned
    // `;

    const userPrompt = `The grades are: ${grades}\n, The candidate's CV: ${textCV}`;

    const r = await generateObject<{ result: z.infer<typeof EvalSchema>[] }>({
        model: openai("gpt-4-turbo"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ] as CoreMessage[],
        temperature: 0.5,
        schema: z.object({ result: z.array(EvalSchema) }),
      });
    
      return r.object.result;
}

export async function run(){
    const JobDescriptionData = await fs.readFile(JOB_DESCRIPTION_PATH, "utf-8");
    const JobDescription = JSON.parse(JobDescriptionData);
    const grades = JobDescription.grades;

    const textCV = await fs.readFile(CV_FILE_PATH, 'utf-8');

    const result = await evaluateGrades(grades, textCV);
    console.log(result);
}