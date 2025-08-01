import { Log } from "./logger";

async function main() {
  await Log("frontend", "info", "api", "Frontend API call successful");
  await Log("frontend", "error", "component", "Component failed to load");
  await Log('backend', 'error', 'handler', 'received string, expected bool');
}

main().then(() => console.log('Done')).catch(console.error);