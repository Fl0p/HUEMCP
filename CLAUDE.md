# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HUEMCP is an MCP (Model Context Protocol) server for controlling Philips Hue smart lights. It uses TypeScript with ES modules and communicates with Philips Hue Bridge using HTTP API v1.

## Build and Development Commands

### Building
```bash
yarn build         # Compile TypeScript to dist/
yarn clean         # Remove dist/ directory
```

### Running
```bash
yarn start         # Build and start MCP server
yarn setup         # Run interactive Bridge setup wizard
yarn dev           # Development mode with NODE_ENV=development
yarn dev:mcp       # Development mode, start MCP server
yarn dev:setup     # Development mode, run setup wizard
```

### Packaging
```bash
yarn manifest      # Generate manifest.json from package.json
yarn build:manifest # Build + generate manifest
yarn mcpb          # Build, generate manifest, and create MCPB bundle
```

## Architecture

### Source Structure
- **Source code**: `server/` directory (rootDir in tsconfig.json)
- **Build output**: `dist/` directory (outDir in tsconfig.json)
- **Entry point**: `server/index.ts` → `dist/index.js`

### Key Components

#### Entry Point (`server/index.ts`)
- CLI router that handles commands: `setup`, `start`, `help`
- Default command is `start` (runs MCP server)
- Loads `.env` only in development mode (`NODE_ENV=development`)

#### MCP Server (`server/server.ts`)
- Main class: `HueMCPServer`
- Uses `@modelcontextprotocol/sdk` with `StdioServerTransport`
- **Dynamic tool registration**: Returns different tool sets based on configuration state:
  - **Not configured**: Only `TOOLS_SETUP` (discover_bridge, complete_bridge_setup)
  - **Configured**: All tools including light/zone/room control
- Sends `notifications/tools/list_changed` when configuration changes
- All tool handlers are in the `CallToolRequestSchema` request handler

#### Hue Bridge Client (`server/hue-bridge-client.ts`)
- HTTP client for Philips Hue API v1
- Endpoints:
  - Lights: `/api/{apiKey}/lights` (GET, PUT)
  - Groups (zones/rooms): `/api/{apiKey}/groups` (GET, PUT on `/action`)
- Filters groups by type: "Zone" for zones, "Room" for rooms

#### Configuration (`server/config.ts`)
- `ConfigManager` class handles config persistence
- Priority: Environment variables > `hue-config.json`
- Config file location: Same directory as bundle (`dist/hue-config.json`)
- Environment variables: `HUE_BRIDGE_IP`, `HUE_API_KEY`

#### Bridge Discovery (`server/bridge-discovery.ts`)
- Uses `bonjour-service` for mDNS discovery (service type: "hue")
- Two-step setup flow:
  1. `discover()`: Find Bridge IP via mDNS (10 second timeout)
  2. `configure()`: Create API key (requires physical button press, 30 second timeout)
- Has CLI mode for interactive setup

#### Tools (`server/tools.ts`)
- Tool definitions exported as constants (e.g., `TOOL_LIST_LIGHTS`)
- Tool groups:
  - `TOOLS_SETUP`: Discovery and setup tools
  - `TOOLS_V1`: Basic light control (API v1)
  - `TOOLS_V2`: Zone and room control (groups)
  - `TOOLS_ALL`: All tools combined

### API Value Ranges
- Brightness (`bri`): 0-254
- Hue: 0-65535
- Saturation (`sat`): 0-254

### Configuration Sources
1. Environment variables (highest priority)
2. `dist/hue-config.json` (created by setup wizard or MCP tools)
3. `.env` file (development only, via `dotenv`)

### Logging
- `Logger` singleton in `server/logger.ts`
- Must call `logger.enable()` to activate logging
- Enabled in both CLI mode and MCP server mode

## MCPB Bundle

The project uses `@anthropic-ai/mcpb` to create distributable bundles:
- Bundle output: `build/huemcp.mcpb`
- Manifest: `manifest.json` (auto-generated from package.json)
- Icon: `icon.png` (63KB PNG)
- User config fields: `bridge_ip`, `api_key` (both optional)

## TypeScript Configuration

- Target: ES2022
- Module: ES2022
- Strict mode enabled
- Generates declaration files and source maps
- All source files must use `.js` extensions in imports (ES module requirement)

## Important Notes

- **ES Modules**: All imports must include `.js` extension even though source is `.ts`
- **Bonjour Import**: Uses `Bonjour.default || Bonjour` pattern for ESM/CommonJS interop
- **Two-phase configuration**: Setup tools are always available; control tools only appear after configuration
- **API Key Security**: When displaying API keys, truncate to show only first 3 and last 3 characters
- **MCP Notification**: Send `notifications/tools/list_changed` after configuration changes to update client tool list
