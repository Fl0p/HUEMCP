# Philips Hue MCP Server Bundle

MCP server for controlling Philips Hue smart lights.

## Features

- Automatic Bridge discovery via mDNS
- Setup and configure API key
- Control lights (on/off, brightness, color)
- Manage **zones** and **rooms**
- Support for **grouped lights**

## Quick Start

### For Claude Desktop

1. **Download and install** the MCPB bundle from [releases](https://github.com/Fl0p/HUEMCP/releases)
2. **Configuration** (choose one):
   - **Option A**: Enter Bridge IP and API key in configuration window during installation
   - **Option B**: Skip configuration and use built-in tools:
     - Use `discover_bridge` tool to find your Hue Bridge
     - Press the physical button on your Hue Bridge
     - Use `complete_bridge_setup` tool to create API key

### For Other MCP Clients (e.g., Cursor)

1. **Clone repository and install dependencies:**

```bash
git clone https://github.com/yourusername/HUEMCP.git
cd HUEMCP
yarn install
```

2. **Setup** (choose one):

   **Option A: Interactive setup (Recommended)**
   ```bash
   yarn setup
   ```
   Follow the interactive prompts to configure your Bridge.

   **Option B: Manual configuration via ENV variables**
   ```bash
   export HUE_BRIDGE_IP="your-bridge-ip"
   export HUE_API_KEY="your-api-key"
   ```

3. **Start the server:**

```bash
yarn start
```

**Need Bridge IP and API key?** See [Manual Setup Guide](./docs/manual-setup.md) for step-by-step instructions using mDNS and curl.

## Technical Details

Currently this MCP server uses direct HTTP calls to Philips Hue API v1.

### Future Plans

Migration to [node-hue-api](https://github.com/peter-murray/node-hue-api) library is planned, which will provide:
- TypeScript implementation of Philips Hue API v2
- Complete API coverage with type definitions
- Scene management and scheduling
- Entertainment API for streaming colors
- Enhanced performance and features

## Documentation

Full documentation is available in [docs/](./docs/README.md)

## Resources

- [Official Philips Hue Developer Documentation](https://developers.meethue.com/)
- [node-hue-api GitHub Repository](https://github.com/peter-murray/node-hue-api)

## License

MIT
