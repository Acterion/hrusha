import * as path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { findAvailableScripts } from "./utils/script-finder.js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SCRIPTS_DIR = path.resolve(__dirname, "scripts");

async function runScript(scriptName: string) {
  const scriptPath = path.join(SCRIPTS_DIR, `${scriptName}.ts`);
  try {
    console.log(
      chalk.blue(`\n🚀 Executing script: ${chalk.bold(scriptName)}...\n`)
    );
    // Dynamically import and run the script's default export (expected to be a function)
    const scriptModule = await import(scriptPath);
    if (typeof scriptModule.run === "function") {
      await scriptModule.run(); // Execute the 'run' function
      console.log(
        chalk.green(
          `\n✅ Script ${chalk.bold(scriptName)} finished successfully.`
        )
      );
    } else if (typeof scriptModule.default === "function") {
      await scriptModule.default(); // Fallback to default export
      console.log(
        chalk.green(
          `\n✅ Script ${chalk.bold(scriptName)} finished successfully.`
        )
      );
    } else {
      console.error(
        chalk.red(
          `❌ Error: Script ${chalk.bold(
            scriptName
          )} does not have a 'run' or default export function.`
        )
      );
      process.exit(1);
    }
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(chalk.red(`❌ Error: Script not found at ${scriptPath}`));
    } else {
      console.error(
        chalk.red(`\n❌ Error executing script ${chalk.bold(scriptName)}:`)
      );
      console.error(error);
    }
    process.exit(1);
  }
}

async function runInteractive() {
  let continueRunning = true;
  
  while (continueRunning) {
    const availableScripts = await findAvailableScripts();

    if (availableScripts.length === 0) {
      console.log(
        chalk.yellow("🤔 No scripts found in the cli/scripts directory.")
      );
      return;
    }

    const choices = [...availableScripts, new inquirer.Separator(), 'Exit'];
    
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "scriptToRun",
        message: "Which script would you like to run?",
        choices: choices,
      },
    ]);

    if (answers.scriptToRun === 'Exit') {
      console.log(chalk.cyan("👋 Exiting interactive mode."));
      continueRunning = false;
    } else {
      await runScript(answers.scriptToRun);
      console.log(chalk.cyan("Returning to script selection..."));
    }
  }
}

async function main() {
  const args = process.argv.slice(2); // Skip node path and script path

  console.log(chalk.cyan.bold("✨ Welcome to the Project CLI! ✨"));

  if (args.length === 0) {
    console.log(chalk.yellow("\nUsage:"));
    console.log(
      chalk.yellow(
        "  npm run cli <script-name> [...args]  (Run a specific script)"
      )
    );
    console.log(
      chalk.yellow(
        "  npm run cli:interactive              (Choose script interactively)"
      )
    );
    process.exit(0);
  }

  const command = args[0];

  if (command === "--interactive" || command === "-i") {
    await runInteractive();
  } else {
    // Assume the first argument is the script name
    const scriptName = command;
    const availableScripts = await findAvailableScripts();
    if (!availableScripts.includes(scriptName)) {
      console.error(chalk.red(`❌ Error: Script '${scriptName}' not found.`));
      console.log(
        chalk.yellow("Available scripts:"),
        availableScripts.join(", ")
      );
      process.exit(1);
    }
    await runScript(scriptName);
  }
}

main().catch((error) => {
  console.error(chalk.red("\n💥 An unexpected error occurred:"));
  console.error(error);
  process.exit(1);
});
