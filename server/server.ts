import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { HueBridgeClient } from "./hue-bridge-client.js";
import { remapLightsToMCP, remapLightStateToMCP } from "./mcp-utils.js";

// Environment variables from manifest
const HUE_BRIDGE_IP = process.env.HUE_BRIDGE_IP;
const HUE_API_KEY = process.env.HUE_API_KEY;

interface SetLightStateArgs {
  light_id: string;
  on?: boolean;
  brightness?: number;
  hue?: number;
  saturation?: number;
}

export class HueMCPServer {
  private server: Server;
  private bridgeClient: HueBridgeClient;

  constructor() {
    if (!HUE_BRIDGE_IP || !HUE_API_KEY) {
      throw new Error("HUE_BRIDGE_IP and HUE_API_KEY environment variables are required");
    }

    this.bridgeClient = new HueBridgeClient(HUE_BRIDGE_IP, HUE_API_KEY);
    
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

  setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers(): void {
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
          case "list_lights": {
            const lights = await this.bridgeClient.listLights();
            return remapLightsToMCP(lights);
          }
          case "set_light_state": {
            const { light_id, on, brightness, hue, saturation } = args as unknown as SetLightStateArgs;
            
            if (!light_id) {
              throw new Error("light_id is required");
            }

            await this.bridgeClient.setLightState(light_id, {
              on,
              brightness,
              hue,
              saturation,
            });
            
            return remapLightStateToMCP(light_id);
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Hue MCP server running on stdio");
  }
}

