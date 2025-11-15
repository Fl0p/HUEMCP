# Manual Bridge Setup Guide

This guide explains how to manually discover your Philips Hue Bridge and obtain an API key using command-line tools.

## Finding Your Bridge with mDNS

Use DNS Service Discovery to find your Hue Bridge on the network:

### On macOS/Linux

```bash
# Using dns-sd (built-in on macOS)
dns-sd -B _hue._tcp local.
```

### On Linux with Avahi

```bash
# Using avahi-browse
avahi-browse -r _hue._tcp
```

The Bridge typically advertises itself as `Philips-hue.local` or similar. Note the IP address for the next steps.

## Getting Your API Key

### Step 1: Press the Bridge Button

Press the physical **link button** on top of your Hue Bridge. The button will start blinking.

### Step 2: Create API Key (within 30 seconds)

Run this curl command, replacing `<bridge_ip_address>` with your Bridge's IP:

```bash
curl -k -X POST https://<bridge_ip_address>/api \
  -H "Content-Type: application/json" \
  -d '{"devicetype":"app_name#instance_name", "generateclientkey":true}'
```

### Example Response

```json
[{"success":{"username":"your-api-key-here","clientkey":"your-client-key-here"}}]
```

Save the `username` value - this is your API key.

### Error Response (if button not pressed)

```json
[{"error":{"type":101,"address":"","description":"link button not pressed"}}]
```

If you see this error, press the button again and retry within 30 seconds.

## Verifying Configuration

Check your bridge status and configuration:

```bash
curl -k https://<bridge_ip_address>/api/0/config
```

This endpoint returns bridge information including:
- Bridge name
- Software version
- MAC address
- Network settings
- And more

## Using the Credentials

After obtaining your API key, you can:

1. Set environment variables:
```bash
export HUE_BRIDGE_IP="192.168.1.100"
export HUE_API_KEY="your-api-key-here"
```

2. Or save them in the config file (automatic when using MCP tools)

## Testing Your Setup

Test that your API key works:

```bash
curl -k https://<bridge_ip_address>/api/<your-api-key>/lights
```

This should return a list of all lights connected to your bridge.

