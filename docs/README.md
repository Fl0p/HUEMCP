# HUEMCP Documentation

Complete documentation for Philips Hue MCP Server Bundle.

## Overview

This MCP server provides integration with Philips Hue smart lighting system, allowing you to control lights through the Model Context Protocol.

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

- **discover_bridge** - Find Hue Bridge IP address
- **complete_bridge_setup** - Setup API key authentication
- **list_lights** - List all available lights
- **set_light_state** - Control light (on/off, brightness, color)

## Usage in MCP Clients

After configuration, you can control your lights through any MCP-compatible client (e.g., Cursor AI).
