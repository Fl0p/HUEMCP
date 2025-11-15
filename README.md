# Philips Hue MCP Server Bundle

MCP server for controlling Philips Hue smart lights.

## Features

- Discover Hue Bridge automatically
- Setup and configure API key
- List all available Hue lights
- Control light state (on/off, brightness, color)

## Quick Start

### Option 1: Auto-configuration (Recommended)

Install the bundle in Cursor and use built-in tools:
1. Use `discover_bridge` tool to find your Hue Bridge
2. Press the physical button on your Hue Bridge
3. Use `complete_bridge_setup` tool to create API key

### Option 2: Manual configuration via ENV variables

If you already know your Bridge IP and API key:

```bash
# Install dependencies
yarn install

# Build bundle
yarn build

# Run in development mode with ENV variables
export HUE_BRIDGE_IP="your-bridge-ip"
export HUE_API_KEY="your-api-key"
yarn dev
```

Environment variables take precedence over saved configuration.

## Documentation

Full documentation is available in [docs/](./docs/README.md)

## License

MIT
