import chalk from "chalk";
import * as path from "path";
import { fileURLToPath } from "url";

import { ensureAPIKey } from "cli/core/ensureAPIKey";
import {
  createCandidate,
  readExistingCandidates,
  writeCandidates,
} from "../core/candidates";
import {
  evaluateGrades,
  extractCVMeta,
  readCV,
  summarizeCV,
} from "../core/processCV";
import { readJobDescription } from "../core/processJobDescription";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOB_DESCRIPTION_PATH = path.resolve(
  __dirname,
  "../../public/job_description.json"
);
const CV_FILE_PATH = path.resolve(__dirname, "../../data/input/cv.txt");

export async function run() {
  console.log(chalk.magenta("Starting CV summarization process..."));

  ensureAPIKey();

  // Read CV
  const textCV = await readCV(CV_FILE_PATH);

  // Read Job Description and grades required
  const JSONJobDescription = await readJobDescription(JOB_DESCRIPTION_PATH);
  const grades = JSONJobDescription.grades;

  // 3. Summarize candidate's CV
  try {
    console.log(
      chalk.blue("Generating summary using Vercel AI SDK (OpenAI)...")
    );

    const cvSummary = await summarizeCV(textCV);

    // Evaluate candidate's CV
    const inferredGrades = await evaluateGrades(grades, textCV);

    // Extract metainformation about the candidate
    const name = await extractCVMeta(textCV, "first name");
    const surname = await extractCVMeta(textCV, "last name");
    const email = "govno@gmail.com"; //await extractCVMeta(textCV, "email");
    const phone = await extractCVMeta(textCV, "Phone Number");

    // 4. Create a new Candidate
    const fileName = path.basename(CV_FILE_PATH);
    const newCandidate = createCandidate({
      name,
      surname,
      email,
      phone,
      summary: cvSummary,
      fileName,
      grades: inferredGrades,
    });

    const existingCandidates = await readExistingCandidates();
    const updatedCandidates = [...existingCandidates, newCandidate];

    await writeCandidates(updatedCandidates);

    console.log(
      chalk.green("CV summarized and candidate created successfully.")
    );
    console.log(chalk.cyan(`Candidate ID: ${newCandidate.id}`));
  } catch (error) {
    console.error(
      chalk.red("❌ Error generating summary via Vercel AI SDK:"),
      error
    );
    process.exit(1);
  }
}
