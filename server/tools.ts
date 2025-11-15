// Tool definitions for Hue MCP Server

export const TOOL_DISCOVER_BRIDGE = {
  name: "discover_bridge",
  description: "Discover or re-discover Philips Hue Bridge on the network. Returns IP address. Use this tool for initial setup or to reconfigure the bridge connection. After discovery, press the physical link button on the bridge and call complete_bridge_setup within 30 seconds.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const TOOL_COMPLETE_BRIDGE_SETUP = {
  name: "complete_bridge_setup",
  description: "Complete or reconfigure Hue Bridge setup by creating API key. Use this tool for initial setup or to reconfigure the bridge connection. Call this after discover_bridge and pressing the physical link button on the bridge (within 30 seconds of pressing the button).",
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

export const TOOL_LIST_ZONES = {
  name: "list_zones",
  description: "List all available Philips Hue zones",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const TOOL_UPDATE_ZONE = {
  name: "update_zone",
  description: "Control all lights in a zone at once. Can set on/off state, brightness, and color for the entire zone.",
  inputSchema: {
    type: "object" as const,
    properties: {
      zone_id: {
        type: "string",
        description: "ID of the zone to control",
      },
      on: {
        type: "boolean",
        description: "Turn all lights in zone on (true) or off (false)",
      },
      brightness: {
        type: "number",
        description: "Brightness level (0-254) for all lights in zone",
        minimum: 0,
        maximum: 254,
      },
      hue: {
        type: "number",
        description: "Hue value (0-65535) for all lights in zone",
        minimum: 0,
        maximum: 65535,
      },
      saturation: {
        type: "number",
        description: "Saturation (0-254) for all lights in zone",
        minimum: 0,
        maximum: 254,
      },
    },
    required: ["zone_id"],
  },
};

export const TOOL_LIST_ROOMS = {
  name: "list_rooms",
  description: "List all available Philips Hue rooms",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export const TOOL_UPDATE_ROOM = {
  name: "update_room",
  description: "Control all lights in a room at once. Can set on/off state, brightness, and color for the entire room.",
  inputSchema: {
    type: "object" as const,
    properties: {
      room_id: {
        type: "string",
        description: "ID of the room to control",
      },
      on: {
        type: "boolean",
        description: "Turn all lights in room on (true) or off (false)",
      },
      brightness: {
        type: "number",
        description: "Brightness level (0-254) for all lights in room",
        minimum: 0,
        maximum: 254,
      },
      hue: {
        type: "number",
        description: "Hue value (0-65535) for all lights in room",
        minimum: 0,
        maximum: 65535,
      },
      saturation: {
        type: "number",
        description: "Saturation (0-254) for all lights in room",
        minimum: 0,
        maximum: 254,
      },
    },
    required: ["room_id"],
  },
};

// Tool groups
export const TOOLS_SETUP = [
  TOOL_DISCOVER_BRIDGE,
  TOOL_COMPLETE_BRIDGE_SETUP,
];

export const TOOLS_V1 = [
  TOOL_LIST_LIGHTS,
  TOOL_SET_LIGHT_STATE,
];

export const TOOLS_V2 = [
  TOOL_LIST_ZONES,
  TOOL_UPDATE_ZONE,
  TOOL_LIST_ROOMS,
  TOOL_UPDATE_ROOM,
];

export const TOOLS_ALL = [
  ...TOOLS_SETUP,
  ...TOOLS_V1,
  ...TOOLS_V2,
];
