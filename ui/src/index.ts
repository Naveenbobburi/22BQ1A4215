import { createInterface } from 'readline';
import { Log, ApplicationStack, LogLevel, ComponentType } from '../../logging-middleware/logger';

async function main() {
  await Log("frontend", "info", "api", "Frontend API call successful");
  console.log("Logging middleware started successfully.");
}

main().catch(console.error);
class LoggingUI {
  private readonly readline = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  private async question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.readline.question(query, resolve);
    });
  }

  private async getInput(prompt: string, retries = 3): Promise<string> {
    if (retries <= 0) {
      throw new Error("Maximum retries exceeded for input.");
    }
    const input = await this.question(`${prompt}: `);
    if (!input.trim()) {
      console.log("Input cannot be empty. Please try again.");
      return this.getInput(prompt, retries - 1);
    }
    return input;
  }

  private async selectFromList<T extends string>(prompt: string, options: readonly T[], retries = 3): Promise<T> {
    if (retries <= 0) {
      throw new Error("Maximum retries exceeded for selection.");
    }
    console.log(`\n${prompt}`);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    const answer = await this.question("Enter number: ");
    const index = parseInt(answer) - 1;

    if (index >= 0 && index < options.length) {
      return options[index];
    }
    console.log("Invalid selection. Please try again.");
    return this.selectFromList(prompt, options, retries - 1);
  }

  public async createLog(): Promise<void> {
    try {
      // Select stack
      const stack = await this.selectFromList(
        "Select application stack:",
        ["frontend", "backend"] as const
      );

      // Select log level
      const level = await this.selectFromList(
        "Select log level:",
        ["debug", "info", "warn", "error", "fatal"] as const
      );

      // Select component based on stack
      const componentOptions = stack === "frontend"
        ? ["api", "component", "hook", "page", "state", "style", "auth", "config", "middleware", "utils"] as const
        : ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service", "auth", "config", "middleware", "utils"] as const;

      const component = await this.selectFromList(
        "Select component:",
        componentOptions
      ) as ComponentType;

      // Get log message
      const message = await this.getInput("Enter log message");

      // Send log using middleware
      await Log(stack, level, component, message);
      console.log("\nLog created successfully!");

    } catch (error) {
      console.error("\nError creating log:", error instanceof Error ? error.message : error);
    }
  }

  public async start(): Promise<void> {
    console.log("Welcome to the Logging Middleware UI!");
    
    while (true) {
      const action = await this.selectFromList(
        "Select an action:",
        ["Create Log", "Exit"] as const
      );

      if (action === "Exit") {
        break;
      }

      await this.createLog();
      console.log("\n-------------------\n");
    }

    this.readline.close();
    console.log("Thank you for using Logging Middleware UI!");
  }
}

// Start the UI
const ui = new LoggingUI();
ui.start().catch(console.error);
