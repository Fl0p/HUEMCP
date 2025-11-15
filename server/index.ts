#!/usr/bin/env node

import { HueMCPServer } from "./server.js";
import { ConfigManager } from "./config.js";
import { BridgeDiscovery } from "./bridge-discovery.js";

// Smart launcher - check command line arguments
const args = process.argv.slice(2);

async function runSetup() {
  console.log("🔧 Starting Hue Bridge setup...\n");
  
  const configManager = new ConfigManager();
  const discovery = new BridgeDiscovery(configManager);
  
  const result = await discovery.discoverAndConfigure();
  
  if (result.success) {
    console.log("\n✅ Setup completed successfully!");
    console.log("You can now start the server with: huemcp start");
  } else {
    console.error("\n❌ Setup failed:", result.message);
    process.exit(1);
  }
}

async function main() {
  // Parse command
  const command = args[0];

  switch (command) {
    case "setup":
      await runSetup();
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

Examples:
  huemcp setup        # Run configuration wizard (first time)
  huemcp start        # Start MCP server
  huemcp              # Start MCP server (default)
`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
