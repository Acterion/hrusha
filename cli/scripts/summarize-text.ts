import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { generateText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { fileURLToPath } from "url";
import { generateObject } from "ai";

// Import types and schemas
import { Candidate, Decision, Status, schemas } from "@types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CV and Job Description location
const CV_FILE_PATH = path.resolve(__dirname, "../../data/input/cv.txt");
const JOB_DESCRIPTION_PATH = path.resolve(
  __dirname,
  "../../data/input/job_description.txt"
);
// Output to public dir for frontend access
const CANDIDATES_FILE_PATH = path.resolve(
  __dirname,
  "../../public/candidates.json"
);

async function readExistingCandidates(): Promise<Candidate[]> {
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

async function writeCandidates(candidates: Candidate[]): Promise<void> {
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

export async function run() {
  console.log(chalk.magenta("Starting CV summarization process..."));

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      chalk.red("❌ Error: OPENAI_API_KEY environment variable is not set.")
    );
    console.log(
      chalk.yellow(
        "Please create a .env file in the project root and add your key:"
      )
    );
    console.log(chalk.yellow('OPENAI_API_KEY="your_key_here"'));
    process.exit(1);
  }

  let textCV: string;
  try {
    textCV = await fs.readFile(CV_FILE_PATH, "utf-8");
    console.log(chalk.blue(`Read CV: ${CV_FILE_PATH}`));
  } catch (error) {
    console.error(
      chalk.red(`❌ Error reading input file (${CV_FILE_PATH}):`),
      error
    );
    process.exit(1);
  }

  let textJobDescription: string;
  try {
    textJobDescription = await fs.readFile(JOB_DESCRIPTION_PATH, "utf-8");
    console.log(chalk.blue(`Read Job Description: ${JOB_DESCRIPTION_PATH}`));
  } catch (error) {
    console.error(
      chalk.red(`❌ Error reading input file (${JOB_DESCRIPTION_PATH}):`),
      error
    );
    process.exit(1);
  }

  // 3. Summarize using Vercel AI SDK
  try {
    console.log(
      chalk.blue("Generating summary using Vercel AI SDK (OpenAI)...")
    );

    const systemPrompt = [
      "You are a helpful HR assistant. Extract the following structured information from a candidate's CV:\n",
      "- Years of Experience (as a string like '5+ years in backend development')\n",
      "- Skills and Frameworks (as a list of keywords; print top5-10 skills of the candidate)\n",
      "- Languages (spoken/written or programming, inferred from context)\n",
      "- Education (summarized in 1–2 lines)\n",
      "- Summary (brief summary of the CV, max 3 sentences)\n",
    ].join("\n");

    const userPrompt = `Candidate's CV: ${textCV}`;

    // Use our Zod schema directly with AI SDK
    const { object: cvSummary } = await generateObject({
      model: openai("gpt-4-turbo"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ] as CoreMessage[],
      temperature: 0.5,
      schema: schemas.CV.shape.summary,
    });

    console.log(cvSummary);

    // Extract name and surname from the CV text or use placeholders
    // This is a simple implementation - you might want to enhance this with AI
    const nameMatch = textCV.match(/(?:name|nombre):\s*([^\n,]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : "Unknown";
    const surnameMatch = textCV.match(
      /(?:surname|last name|apellido):\s*([^\n,]+)/i
    );
    const surname = surnameMatch ? surnameMatch[1].trim() : "Candidate";

    // Extract email and phone or use placeholders
    const emailMatch = textCV.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i
    );
    const email = emailMatch ? emailMatch[0] : "email@example.com";
    const phoneMatch =
      textCV.match(/(?:phone|tel|telefono):\s*([0-9+\-\s()]{7,})/i) ||
      textCV.match(/([0-9+\-\s()]{7,})/i);
    const phone = phoneMatch ? phoneMatch[1].trim() : "000-000-0000";

    // 4. Create a new Candidate
    const candidateData = {
      id: `candidate-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      name,
      surname,
      cv: {
        id: `cv-${Date.now()}`,
        name,
        surname,
        email,
        phone,
        summary: cvSummary,
        gradesEval: [], // No evaluations initially
        fileName: path.basename(CV_FILE_PATH),
      },
      ha: {
        id: `ha-${Date.now()}`,
        name: "Home Assignment",
        repo: "",
        description: "Not assigned yet",
        status: "not_started" as const,
        grades: [],
        gradesEval: [],
      },
      decision: Decision.Maybe, // Default decision
      status: Status.applied, // Initial status
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };

    // Validate the candidate with Zod
    const newCandidate = schemas.Candidate.parse(candidateData);

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
