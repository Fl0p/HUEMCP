# Philips Hue MCP Server Bundle

MCP server for controlling Philips Hue smart lights.

## Features

- List all available Hue lights
- Control light state (on/off, brightness, color)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure your Hue Bridge:
   - Find your Hue Bridge IP address
   - Create an API key (see Philips Hue API documentation)

3. Build the bundle:
```bash
yarn build
```

## Development

Run the server locally:
```bash
export HUE_BRIDGE_IP="your-bridge-ip"
export HUE_API_KEY="your-api-key"
yarn dev
```

## Tools

### list_lights
Lists all available Philips Hue lights with their current state.

### set_light_state
Controls a specific Hue light.

**Parameters:**
- `light_id` (required): ID of the light
- `on` (optional): Turn light on/off
- `brightness` (optional): Set brightness (0-254)
- `hue` (optional): Set hue (0-65535)
- `saturation` (optional): Set saturation (0-254)

## License

MIT

