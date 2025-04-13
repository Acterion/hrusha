import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { z } from "zod";

import { Candidate, Decision, Status, schemas } from "@types";
import { EvalSchema } from "types/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATES_FILE_PATH = path.resolve(
  __dirname,
  "../../public/candidates.json"
);

interface CreateCandidateArgs {
  name: string;
  surname: string;
  email: string;
  phone: string;
  summary: string;
  fileName: string;
  grades: z.infer<typeof EvalSchema>[];
}

export async function readExistingCandidates(): Promise<Candidate[]> {
  try {
    await fs.access(CANDIDATES_FILE_PATH); // Check if file exists
    const data = await fs.readFile(CANDIDATES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);

    const result = schemas.Candidate.array().safeParse(parsed);
    if (!result.success) {
      console.error(
        chalk.yellow("Invalid candidates data in file:"),
        result.error
      );
      return [];
    }
    return result.data;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(
        chalk.yellow("candidates.json not found, creating a new one.")
      );
      return [];
    } else {
      console.error(
        chalk.red("Error reading existing candidates file:"),
        error
      );
      return [];
    }
  }
}

export async function writeCandidates(candidates: Candidate[]): Promise<void> {
  try {
    const validatedCandidates = schemas.Candidate.array().parse(candidates);

    await fs.mkdir(path.dirname(CANDIDATES_FILE_PATH), { recursive: true });
    await fs.writeFile(
      CANDIDATES_FILE_PATH,
      JSON.stringify(validatedCandidates, null, 2),
      "utf-8"
    );
    console.log(chalk.cyan(`Candidates saved to ${CANDIDATES_FILE_PATH}`));
  } catch (error) {
    console.error(chalk.red("Error writing candidates file:"), error);
  }
}

export function createCandidate({
  name,
  surname,
  email,
  phone,
  summary,
  grades,
  fileName,
}: CreateCandidateArgs): Candidate {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);

  const candidateData = {
    id: `candidate-${timestamp}-${randomId}`,
    name,
    surname,
    cv: {
      id: `cv-${timestamp}`,
      name,
      surname,
      email,
      phone,
      summary,
      gradesEval: grades,
      fileName,
    },
    ha: {
      id: `ha-${timestamp}`,
      name: "Home Assignment",
      repo: "",
      description: "Not assigned yet",
      status: "not_started" as const,
      grades: [],
      gradesEval: [],
    },
    decision: Decision.Maybe,
    status: Status.applied,
    lastUpdated: timestamp,
    createdAt: timestamp,
  };

  return schemas.Candidate.parse(candidateData);
}
