#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Environment variables from manifest
const HUE_BRIDGE_IP = process.env.HUE_BRIDGE_IP;
const HUE_API_KEY = process.env.HUE_API_KEY;

class HueMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "huemcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "list_lights",
          description: "List all available Philips Hue lights",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "set_light_state",
          description: "Turn a Hue light on/off or set its brightness and color",
          inputSchema: {
            type: "object",
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
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_lights":
            return await this.listLights();
          case "set_light_state":
            return await this.setLightState(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async listLights() {
    if (!HUE_BRIDGE_IP || !HUE_API_KEY) {
      throw new Error("Hue Bridge IP or API Key not configured");
    }

    try {
      const response = await fetch(
        `http://${HUE_BRIDGE_IP}/api/${HUE_API_KEY}/lights`
      );
      const lights = await response.json();

      if (lights[0]?.error) {
        throw new Error(lights[0].error.description);
      }

      const lightList = Object.entries(lights)
        .map(([id, light]) => `${id}: ${light.name} (${light.state.on ? "ON" : "OFF"})`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Available lights:\n${lightList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list lights: ${error.message}`);
    }
  }

  async setLightState(args) {
    if (!HUE_BRIDGE_IP || !HUE_API_KEY) {
      throw new Error("Hue Bridge IP or API Key not configured");
    }

    const { light_id, on, brightness, hue, saturation } = args;

    if (!light_id) {
      throw new Error("light_id is required");
    }

    const state = {};
    if (on !== undefined) state.on = on;
    if (brightness !== undefined) state.bri = brightness;
    if (hue !== undefined) state.hue = hue;
    if (saturation !== undefined) state.sat = saturation;

    try {
      const response = await fetch(
        `http://${HUE_BRIDGE_IP}/api/${HUE_API_KEY}/lights/${light_id}/state`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        }
      );

      const result = await response.json();

      if (result[0]?.error) {
        throw new Error(result[0].error.description);
      }

      return {
        content: [
          {
            type: "text",
            text: `Light ${light_id} state updated successfully`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to set light state: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Hue MCP server running on stdio");
  }
}

const server = new HueMCPServer();
server.run().catch(console.error);

