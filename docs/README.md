# HUEMCP Documentation

Complete documentation for Philips Hue MCP Server Bundle.

## Overview

This MCP server provides integration with Philips Hue smart lighting system, allowing you to control lights, zones, and rooms through the Model Context Protocol.

> **Note:** Currently uses Philips Hue API v1. Migration to API v2 via [hue-sync](https://github.com/jdmg94/Hue-Sync) library is planned for future releases.

### Key Features

- Automatic mDNS discovery of Hue Bridge
- Control individual lights and grouped lights
- Manage zones and rooms
- Brightness and color control

## Configuration

HUEMCP supports two configuration methods:

### 1. Auto-configuration via Tools (Recommended)

The server provides tools for automatic setup:

- **discover_bridge** - Automatically finds your Hue Bridge on the network
- **complete_bridge_setup** - Creates and saves API key (requires pressing the physical button on the bridge)

This method doesn't require any manual configuration.

### 2. Environment Variables

If you already have Bridge IP and API key, set these environment variables:

```bash
export HUE_BRIDGE_IP="192.168.1.100"
export HUE_API_KEY="your-api-key"
```

**Priority:** Environment variables take precedence over saved configuration file.

### 3. Manual Setup

For manual Bridge discovery and API key generation using command-line tools, see the [Manual Setup Guide](./manual-setup.md).

## Available Tools

### Setup Tools
- **discover_bridge** - Find Hue Bridge IP address on the network
- **complete_bridge_setup** - Create and save API key (requires pressing bridge button)

### Light Control
- **list_lights** - List all available lights
- **set_light_state** - Control individual light (on/off, brightness, hue, saturation)

### Zone Control
- **list_zones** - List all available zones
- **update_zone** - Control all lights in a zone at once

### Room Control
- **list_rooms** - List all available rooms
- **update_room** - Control all lights in a room at once

## Usage in MCP Clients

After configuration, you can control your lights through any MCP-compatible client (e.g., Claude Desktop, Cursor).

## Additional Documentation

- [Manual Setup Guide](./manual-setup.md) - Step-by-step instructions for manual Bridge discovery and API key generation
- [Hue-Sync Library Documentation](./hue-sync.md) - Reference documentation for hue-sync library (planned for future integration)
