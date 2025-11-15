# Philips Hue MCP Server Bundle

MCP server for controlling Philips Hue smart lights.

## Features

- List all available Hue lights
- Control light state (on/off, brightness, color)

## Quick Start

```bash
# Install dependencies
yarn install

# Build bundle
yarn build

# Run in development mode
export HUE_BRIDGE_IP="your-bridge-ip"
export HUE_API_KEY="your-api-key"
yarn dev
```

## Documentation

Full documentation is available in [docs/](./docs/README.md)

## License

MIT
