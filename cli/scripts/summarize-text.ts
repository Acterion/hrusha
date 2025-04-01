import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { generateText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define paths relative to the script location
const INPUT_FILE_PATH = path.resolve(__dirname, "../../data/input/example.txt");
// Output to public dir for frontend access. Changed from data/output/result.txt
const OUTPUT_FILE_PATH = path.resolve(__dirname, "../../public/results.json");

interface SummaryResult {
  id: string;
  timestamp: number;
  originalFilename: string;
  originalText: string;
  summary: string;
}

async function readExistingResults(): Promise<SummaryResult[]> {
  try {
    await fs.access(OUTPUT_FILE_PATH); // Check if file exists
    const data = await fs.readFile(OUTPUT_FILE_PATH, "utf-8");
    return JSON.parse(data) as SummaryResult[];
  } catch (error: any) {
    // If file doesn't exist or is invalid JSON, return empty array
    if (error.code === "ENOENT") {
      console.log(chalk.yellow("results.json not found, creating a new one."));
      return [];
    } else {
      console.error(chalk.red("Error reading existing results file:"), error);
      return []; // Start fresh if parsing fails
    }
  }
}

async function writeResults(results: SummaryResult[]): Promise<void> {
  try {
    // Ensure the directory exists (needed if public/ doesn't exist initially)
    await fs.mkdir(path.dirname(OUTPUT_FILE_PATH), { recursive: true });
    await fs.writeFile(
      OUTPUT_FILE_PATH,
      JSON.stringify(results, null, 2),
      "utf-8"
    );
    console.log(chalk.cyan(`Results saved to ${OUTPUT_FILE_PATH}`));
  } catch (error) {
    console.error(chalk.red("Error writing results file:"), error);
  }
}

// Main function for this script, exported for the CLI runner
export async function run() {
  console.log(chalk.magenta("Starting text summarization process..."));

  // 1. Check for API Key
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

  // 2. Read Input File
  let inputText: string;
  try {
    inputText = await fs.readFile(INPUT_FILE_PATH, "utf-8");
    console.log(chalk.blue(`Read input file: ${INPUT_FILE_PATH}`));
  } catch (error) {
    console.error(
      chalk.red(`❌ Error reading input file (${INPUT_FILE_PATH}):`),
      error
    );
    process.exit(1);
  }

  // 3. Summarize using Vercel AI SDK
  let summary: string;
  try {
    console.log(
      chalk.blue("Generating summary using Vercel AI SDK (OpenAI)...")
    );

    const systemPrompt =
      "You are a helpful assistant designed to summarize text concisely.";
    const userPrompt = `Please summarize the following text:\n\n${inputText}`;

    const { text } = await generateText({
      model: openai("gpt-4-turbo"), // Or your preferred model like 'gpt-3.5-turbo'
      // system: systemPrompt, // System prompt can be added here
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ] as CoreMessage[], // Cast to CoreMessage[]
      // prompt: userPrompt, // Use messages instead for better control
      maxTokens: 150, // Adjust as needed
      temperature: 0.5, // Adjust for creativity vs determinism
    });

    summary = text.trim();
    console.log(chalk.green("Summary generated successfully."));
    // console.log(chalk.gray('--- Summary ---'));
    // console.log(chalk.gray(summary));
    // console.log(chalk.gray('---------------'));
  } catch (error) {
    console.error(
      chalk.red("❌ Error generating summary via Vercel AI SDK:"),
      error
    );
    process.exit(1);
  }

  // 4. Prepare and Save Output
  const newResult: SummaryResult = {
    id: `sum-<span class="math-inline">\{Date\.now\(\)\}\-</span>{Math.random().toString(36).substring(2, 8)}`, // Simple unique ID
    timestamp: Date.now(),
    originalFilename: path.basename(INPUT_FILE_PATH),
    originalText: inputText,
    summary: summary,
  };

  const existingResults = await readExistingResults();
  const updatedResults = [...existingResults, newResult];

  await writeResults(updatedResults);
}

// Allow running the script directly if needed (e.g., node cli/scripts/summarize-text.js after tsc)
// if (require.main === module) {
//     run().catch(err => {
//         console.error(chalk.red("Script execution failed: "), err);
//         process.exit(1);
//     });
// }
