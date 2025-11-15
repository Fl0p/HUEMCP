# Philips Hue MCP Server Bundle

MCP server for controlling Philips Hue smart lights using [hue-sync](https://github.com/jdmg94/Hue-Sync) library.

## Features

- **Hue API v2** support with HTTPS
- Automatic Bridge discovery via mDNS
- Setup and configure API key
- Control lights (on/off, brightness, color, temperature)
- Manage **zones** and **rooms**
- Support for **grouped lights**
- Entertainment API for gradient lightstrips
- Scenes management

## Quick Start

### Option 1: Auto-configuration (Recommended)

Install the bundle in Cursor and use built-in tools:
1. Use `discover_bridge` tool to find your Hue Bridge
2. Press the physical button on your Hue Bridge
3. Use `complete_bridge_setup` tool to create API key

### Option 2: Manual configuration via ENV variables

If you already know your Bridge IP and API key:

```bash
# Copy example env file
cp env.example .env

# Edit .env with your values
# HUE_BRIDGE_IP=192.168.1.100
# HUE_API_KEY=your-api-key

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

**Need to get Bridge IP and API key manually?** See [Manual Setup Guide](./docs/manual-setup.md) for step-by-step instructions using mDNS and curl.

## Technical Details

This MCP server uses [hue-sync](https://github.com/jdmg94/Hue-Sync) library, which provides:
- TypeScript implementation of Philips Hue API v2
- HTTPS support with proper certificate validation
- mDNS discovery with fallback to remote API
- Entertainment API for streaming colors to gradient lightstrips

For detailed information about the hue-sync library, see [Hue-Sync Documentation](./docs/hue-sync.md).

## Documentation

Full documentation is available in [docs/](./docs/README.md)

## License

MIT
