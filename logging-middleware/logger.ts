import axios from "axios";

// Configuration constants
const LOGGING_ENDPOINT = "http://20.244.56.144/evaluation-service/logs";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMmJxMWE0MjE3QHZ2aXQubmV0IiwiZXhwIjoxNzU0MDMwNjYzLCJpYXQiOjE3NTQwMjk3NjMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzZGRmMjJhZC00OThkLTRhNjMtOGMwYS1lYTI5NzBjN2ZiYzUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJib2xsZXBhbGxpIHBhdmFuIHZlbmthdGEgbmFnYSBtYW5vaiIsInN1YiI6IjU4MmI3YzA5LWZhMWUtNDQ1OC1iMGQ5LTQwNWQ4MGVlODEwMyJ9LCJlbWFpbCI6IjIyYnExYTQyMTdAdnZpdC5uZXQiLCJuYW1lIjoiYm9sbGVwYWxsaSBwYXZhbiB2ZW5rYXRhIG5hZ2EgbWFub2oiLCJyb2xsTm8iOiIyMmJxMWE0MjE3IiwiYWNjZXNzQ29kZSI6IlBuVkJGViIsImNsaWVudElEIjoiNTgyYjdjMDktZmExZS00NDU4LWIwZDktNDA1ZDgwZWU4MTAzIiwiY2xpZW50U2VjcmV0Ijoic21rUmpGbWNIbVRVQlNneiJ9.URCeYstHfkDa1dfkLm2wd0ERZYR2ITog4eHOEcZeXiI";

// Type definitions for application layers
type ApplicationStack = "backend" | "frontend";
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

// Backend component types
type BackendComponents = 
  | "cache" 
  | "controller" 
  | "cron_job" 
  | "db" 
  | "domain" 
  | "handler" 
  | "repository" 
  | "route" 
  | "service";

// Frontend component types  
type FrontendComponents = 
  | "api" 
  | "component" 
  | "hook" 
  | "page" 
  | "state" 
  | "style";

// Shared component types
type SharedComponents = 
  | "auth" 
  | "config" 
  | "middleware" 
  | "utils";

// Union type for all components
type ComponentType = BackendComponents | FrontendComponents | SharedComponents;

// Validation mappings
const VALID_STACKS: ApplicationStack[] = ["backend", "frontend"];
const VALID_LOG_LEVELS: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
const BACKEND_COMPONENTS: string[] = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const FRONTEND_COMPONENTS: string[] = ["api", "component", "hook", "page", "state", "style"];
const SHARED_COMPONENTS: string[] = ["auth", "config", "middleware", "utils"];

/**
 * Validates if a component is allowed for a specific application stack
 * @param stack - The application stack (backend/frontend)
 * @param component - The component name to validate
 * @returns boolean indicating if component is valid for the stack
 */
function isValidComponentForStack(stack: ApplicationStack, component: string): boolean {
  const sharedComponentsAllowed = SHARED_COMPONENTS.includes(component);
  
  if (stack === "backend") {
    return BACKEND_COMPONENTS.includes(component) || sharedComponentsAllowed;
  } else if (stack === "frontend") {
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
export async function Log(
  stack: ApplicationStack, 
  level: LogLevel, 
  component: ComponentType, 
  logMessage: string
): Promise<void> {
  
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

  // Configure request headers
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Send log to remote service
    const response = await axios.post(LOGGING_ENDPOINT, logPayload, requestConfig);
    console.log("Log entry created successfully:", response.data);
  } catch (error) {
    console.error("Failed to create log entry:", error);
    throw error;
  }
}
