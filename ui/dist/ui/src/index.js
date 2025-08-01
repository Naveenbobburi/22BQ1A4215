"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const logger_1 = require("../../logging-middleware/logger");
async function main() {
    await (0, logger_1.Log)("frontend", "info", "api", "Frontend API call successful");
    console.log("Logging middleware started successfully.");
}
main().catch(console.error);
class LoggingUI {
    constructor() {
        this.readline = (0, readline_1.createInterface)({
            input: process.stdin,
            output: process.stdout
        });
    }
    async question(query) {
        return new Promise((resolve) => {
            this.readline.question(query, resolve);
        });
    }
    async getInput(prompt, retries = 3) {
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
    async selectFromList(prompt, options, retries = 3) {
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
    async createLog() {
        try {
            // Select stack
            const stack = await this.selectFromList("Select application stack:", ["frontend", "backend"]);
            // Select log level
            const level = await this.selectFromList("Select log level:", ["debug", "info", "warn", "error", "fatal"]);
            // Select component based on stack
            const componentOptions = stack === "frontend"
                ? ["api", "component", "hook", "page", "state", "style", "auth", "config", "middleware", "utils"]
                : ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service", "auth", "config", "middleware", "utils"];
            const component = await this.selectFromList("Select component:", componentOptions);
            // Get log message
            const message = await this.getInput("Enter log message");
            // Send log using middleware
            await (0, logger_1.Log)(stack, level, component, message);
            console.log("\nLog created successfully!");
        }
        catch (error) {
            console.error("\nError creating log:", error instanceof Error ? error.message : error);
        }
    }
    async start() {
        console.log("Welcome to the Logging Middleware UI!");
        while (true) {
            const action = await this.selectFromList("Select an action:", ["Create Log", "Exit"]);
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
