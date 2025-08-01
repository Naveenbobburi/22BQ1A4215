"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
async function main() {
    await (0, logger_1.Log)("frontend", "info", "api", "Frontend API call successful");
    await (0, logger_1.Log)("frontend", "error", "component", "Component failed to load");
    await (0, logger_1.Log)('backend', 'error', 'handler', 'received string, expected bool');
}
main().then(() => console.log('Done')).catch(console.error);
