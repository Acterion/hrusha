import * as fs from "fs/promises";
import * as path from "path";
import { CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { fileURLToPath } from "url";
import { generateObject } from "ai";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import types and schemas
import { EvalSchema, GradeSchema } from "types/schemas";

export async function readCV(pathToCV: string): Promise<string> {
  try {
    const textCV = await fs.readFile(pathToCV, "utf-8");
    return textCV;
  } catch (error: any) {
    throw new Error(`❌ Failed to read CV at "${pathToCV}": ${error.message}`);
  }
}

export async function extractCVMeta(cvText: string, info: string) {
  const systemPrompt = `
  Your task is to read CV and extract their ${info} from their CV.
  Respond must be either ${info} extracted or just "NULL" string.
  `;
  const userPrompt = `The candidate's CV: ${cvText}`;

  const r = await generateObject<{ result: string }>({
    model: openai("gpt-4-turbo"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ] as CoreMessage[],
    temperature: 0.5,
    schema: z.object({ result: z.string() }),
  });
  return r.object.result;
}

export async function evaluateSingleGrade(
  grade: z.infer<typeof GradeSchema>,
  textCV: string
) {
  const systemPrompt = `
    You are a rigorous and intelligent HR evaluator.

    You will be given:
    1. A candidate's CV.
    2. An evaluation criteria ("grade") in the following format:
    - name: the skill or trait to be evaluated
    - description: what this grade measures
    - scale: the evaluation scale (e.g., "1-100")

    Your task is to carefully read the CV and, for the grade:
    - Assign a value (grade) using the provided scale.
    - Justify your evaluation clearly and concisely based on the CV.

    Respond have to satisfy the following structure:
    name: string,       // same as in the grade
    value: string,      // number or level on the specified scale
    reason: string      // short explanation why this score was assigned
    `;
  const userPrompt = `The candidate's CV is ${textCV} \n The grade to be graded is: ${grade}`;

  const r = await generateObject<{ result: z.infer<typeof EvalSchema>[] }>({
    model: openai("gpt-4-turbo"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ] as CoreMessage[],
    temperature: 0.5,
    schema: z.object({ result: z.array(EvalSchema) }),
  });

  return r.object.result[0];
}

export async function evaluateGrades(
  grades: z.infer<typeof GradeSchema>[],
  textCV: string
): Promise<z.infer<typeof EvalSchema>[]> {
  const results: z.infer<typeof EvalSchema>[] = [];

  for (const grade of grades) {
    try {
      const result = await evaluateSingleGrade(grade, textCV);
      results.push(result);
    } catch (e) {
      console.error(`❌ Failed to evaluate grade: ${grade.name}`, e);
    }
  }

  return results;
}

export async function summarizeCV(textCV: string) {
  const systemPrompt = `
    You are an intelligent HR assistant. 
    Your task is to read the candidate's CV thoroughly and summarize it in 2-4 sentences highlighting candidate's experience and inferred skills from their experience.
    `;
  const userPrompt = `The candidate's CV: ${textCV}`;

  const r = await generateObject<{ result: string }>({
    model: openai("gpt-4-turbo"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ] as CoreMessage[],
    temperature: 0.5,
    schema: z.object({ result: z.string() }),
  });
  const cvSummary = r.object.result;
  return cvSummary;
}
