#!/usr/bin/env node

import { HueMCPServer } from "./server.js";

// Smart launcher - check command line arguments
const args = process.argv.slice(2);

async function main() {
  // Parse command
  const command = args[0];

  switch (command) {
    case "setup":
      console.log("Setup command coming soon...");
      process.exit(0);
      break;

    case "start":
    case undefined:
      // Default: start MCP server
      const server = new HueMCPServer();
      await server.run();
      break;

    case "help":
    case "--help":
    case "-h":
      showHelp();
      process.exit(0);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
Philips Hue MCP Server

Usage:
  huemcp [command]

Commands:
  start      Start MCP server (default)
  setup      Configure Hue Bridge connection
  help       Show this help message

Environment Variables:
  HUE_BRIDGE_IP    IP address of your Hue Bridge
  HUE_API_KEY      API key for authentication

Examples:
  huemcp              # Start server
  huemcp start        # Start server
  huemcp setup        # Run configuration wizard
`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
