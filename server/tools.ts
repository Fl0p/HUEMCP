// Tool definitions for Hue MCP Server

export const TOOL_DISCOVER_BRIDGE = {
  name: "discover_bridge",
  description: "Discover Philips Hue Bridge on the network. Returns IP address. After this, you need to press the button on the bridge and call complete_bridge_setup.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const TOOL_COMPLETE_BRIDGE_SETUP = {
  name: "complete_bridge_setup",
  description: "Complete Hue Bridge setup by pressing the link button and creating API key. Call this after discover_bridge and pressing the physical button on the bridge.",
  inputSchema: {
    type: "object" as const,
    properties: {
      bridge_ip: {
        type: "string",
        description: "IP address of the Hue Bridge (from discover_bridge)",
      },
    },
    required: ["bridge_ip"],
  },
};

export const TOOL_LIST_LIGHTS = {
  name: "list_lights",
  description: "List all available Philips Hue lights",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const TOOL_SET_LIGHT_STATE = {
  name: "set_light_state",
  description: "Turn a Hue light on/off or set its brightness and color",
  inputSchema: {
    type: "object" as const,
    properties: {
      light_id: {
        type: "string",
        description: "ID of the light to control",
      },
      on: {
        type: "boolean",
        description: "Turn light on (true) or off (false)",
      },
      brightness: {
        type: "number",
        description: "Brightness level (0-254)",
        minimum: 0,
        maximum: 254,
      },
      hue: {
        type: "number",
        description: "Hue value (0-65535)",
        minimum: 0,
        maximum: 65535,
      },
      saturation: {
        type: "number",
        description: "Saturation (0-254)",
        minimum: 0,
        maximum: 254,
      },
    },
    required: ["light_id"],
  },
};

