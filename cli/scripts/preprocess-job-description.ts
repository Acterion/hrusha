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
import { GradeSchema, JobDescriptionSchema } from "types/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOB_DESCRIPTION_PATH = path.resolve(__dirname, "../../data/input/job_description.txt");

async function readJobDescription() {
  return await fs.readFile(JOB_DESCRIPTION_PATH, "utf-8");
}

async function extractDescription() {
    const systemPrompt = `
    You are an intelligent HR assistant.

    Your task is to read and laconically summarize the job description.
    `;

    const userPrompt = await readJobDescription();

    const r = await generateObject<{ result: string }>({
        model: openai("gpt-4-turbo"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ] as CoreMessage[],
        temperature: 0.5,
        schema: z.object({
          result: z.string(),
        }),
    });

    const jobSummary = r.object.result;
    return jobSummary;
}

async function extractGrades() {
    const systemPrompt = `
    You are an intelligent HR assistant.
    
    Your task is to extract all atomic requirements from the job description in a following format:
    - name: Name the requirement
    - description: write a short (at most one sentence) description
    - scale: just write here "1-100" 
    `;
  
    const userPrompt = await readJobDescription();
  
    const r = await generateObject<{ result: z.infer<typeof GradeSchema>[] }>({
      model: openai("gpt-4-turbo"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ] as CoreMessage[],
      temperature: 0.5,
      schema: z.object({ result: z.array(GradeSchema) }),
    });
  
    return r.object.result;
  }


export async function run() {
    const grades = await extractGrades();
    const description = await extractDescription();

    const id = 'asdiajwkjwahfrlkjsaem';
    const name = 'Backend Developer';

    const jobDescriptionObject = {
        id,
        name,
        description,
        grades,
    };

    JobDescriptionSchema.parse(jobDescriptionObject);

    const outputPath = path.resolve(__dirname, "../../public/job_description.json");
    await fs.writeFile(outputPath, JSON.stringify(jobDescriptionObject, null, 2), "utf-8");
    console.log(chalk.green("✅ Job description saved to:"), chalk.blue(outputPath));
}