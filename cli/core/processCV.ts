import * as fs from "fs/promises";
import * as path from "path";
import { CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
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
You are an expert technical recruiter.

Your task is to evaluate a specific skill from a candidate's CV using a predefined grading rubric.
Be as strict as possible. Your goal is to get the candidate down, not out.

You will receive:
1. The candidate's CV (as plain text).
2. A "grade" object with:
  - name: the name of the skill to evaluate
  - description: what the skill represents
  - scale: a strict list of allowed values (e.g. ["None", "Beginner", "Intermediate", "Advanced", "Expert"])

Your goal:
- Assign a grade (value) from the scale based strictly on the CV.
- Justify your assessment in a short explanation.
- Output must follow this JSON format exactly:

{
  "name": string,    // same as grade.name
  "value": string,   // must be one of grade.scale
  "reason": string   // clear reasoning points based only on the CV
}

### Evaluation principles:

1. **Real usage > mention**  
   Only assign mid-to-high ratings if the skill is actively used in described projects or job experience. A skill listed without context does not count as real experience.

2. **Project application is key**  
   Check whether the skill was used in:
   - Work experience
   - Personal or academic projects
   - Open-source contributions  
   The stronger and more realistic the context, the higher the credibility.

3. **Impact matters**  
   Consider both measurable impact (e.g., “reduced build time by 40%”) and qualitative impact (e.g., “designed architecture using NestJS modules”). Higher impact → higher confidence.

4. **Quality over quantity**  
   Multiple shallow mentions do not outweigh one clearly described, impactful project. One strong, detailed use of the skill is better than five vague ones.

5. **No hallucination**  
   Never invent skills, job roles, or projects not present in the CV. Do not guess the scale — always pick from grade.scale.

6. **Be skeptical by default**  
   If the CV gives no reliable evidence — return the lowest appropriate value (typically "None") and explain why.

You are strict, fair, and always grounded in the CV text. You reward clarity and evidence, not vague buzzwords.

Your response must be a valid JSON object with the following structure:

{
  "result": [
    {
      "name": string,
      "value": string,
      "reason": string
    }
  ]
}

⚠️ Even if you are returning only one result, it must be wrapped inside an array under the "result" key.
`;



  const userPrompt = `The candidate's CV is:\n\n${textCV}\n\nThe grade to evaluate is:\n${JSON.stringify(grade, null, 2)}`;

  const r = await generateObject<{ result: z.infer<typeof EvalSchema>[] }>({
    model: openai("gpt-4o"),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
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
