import chalk from "chalk";

export function ensureAPIKey(){
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
}