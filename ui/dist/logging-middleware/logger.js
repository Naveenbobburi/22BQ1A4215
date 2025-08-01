"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const axios_1 = __importDefault(require("axios"));
// Configuration constants
const BASE_URL = "http://20.244.56.144";
const LOGGING_ENDPOINT = `${BASE_URL}/evaluation-service/logs`;
const AUTH_ENDPOINT = `${BASE_URL}/evaluation-service/auth`;
// Authentication details
const AUTH_DETAILS = {
    email: "naveenbobburi60@gmail.com",
    name: "Bobburi Naveen",
    rollNo: "22BQ1A4215",
    accessCode: "PnVBFV",
    clientID: "bb180e96-b9b1-449a-b626-a418ac90a995",
    clientSecret: "ybgVwAVfUcQfqYxs"
};
/**
 * Gets a fresh authentication token from the server
 * @returns Promise<string> The authentication token
 */
async function getAuthToken() {
    try {
        const response = await axios_1.default.post(AUTH_ENDPOINT, AUTH_DETAILS);
        if (!response.data || !response.data.access_token) {
            throw new Error("Invalid response from auth server: No token received");
        }
        return response.data.access_token;
    }
    catch (error) {
        console.error("Failed to get authentication token:", error);
        throw error;
    }
}
// Validation mappings
const VALID_STACKS = ["backend", "frontend"];
const VALID_LOG_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const BACKEND_COMPONENTS = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const FRONTEND_COMPONENTS = ["api", "component", "hook", "page", "state", "style"];
const SHARED_COMPONENTS = ["auth", "config", "middleware", "utils"];
/**
 * Validates if a component is allowed for a specific application stack
 * @param stack - The application stack (backend/frontend)
 * @param component - The component name to validate
 * @returns boolean indicating if component is valid for the stack
 */
function isValidComponentForStack(stack, component) {
    const sharedComponentsAllowed = SHARED_COMPONENTS.includes(component);
    if (stack === "backend") {
        return BACKEND_COMPONENTS.includes(component) || sharedComponentsAllowed;
    }
    else if (stack === "frontend") {
        return FRONTEND_COMPONENTS.includes(component) || sharedComponentsAllowed;
    }
    return false;
}
/**
 * Sends a log entry to the remote logging service
 * @param stack - Application stack identifier
 * @param level - Log severity level
 * @param component - Component generating the log
 * @param logMessage - The message to be logged
 */
async function Log(stack, level, component, logMessage) {
    // Input validation
    if (!VALID_STACKS.includes(stack)) {
        throw new Error(`Invalid application stack: ${stack}. Must be one of: ${VALID_STACKS.join(", ")}`);
    }
    if (!VALID_LOG_LEVELS.includes(level)) {
        throw new Error(`Invalid log level: ${level}. Must be one of: ${VALID_LOG_LEVELS.join(", ")}`);
    }
    if (!isValidComponentForStack(stack, component)) {
        throw new Error(`Component '${component}' is not valid for ${stack} stack`);
    }
    // Prepare request payload
    const logPayload = {
        stack: stack,
        level: level,
        package: component,
        message: logMessage
    };
    try {
        // Get fresh authentication token
        const token = await getAuthToken();
        // Configure request headers
        const requestConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        // Send log to remote service
        const response = await axios_1.default.post(LOGGING_ENDPOINT, logPayload, requestConfig);
        console.log("Log entry created successfully:", response.data);
    }
    catch (error) {
        console.error("Failed to create log entry:", error);
        throw error;
    }
}
