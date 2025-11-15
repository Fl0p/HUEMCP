import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { HueBridgeClient } from "./hue-bridge-client.js";
import { remapLightsToMCP, remapLightStateToMCP } from "./mcp-utils.js";
import { ConfigManager } from "./config.js";
import { BridgeDiscovery } from "./bridge-discovery.js";

interface SetLightStateArgs {
  light_id: string;
  on?: boolean;
  brightness?: number;
  hue?: number;
  saturation?: number;
}

export class HueMCPServer {
  private server: Server;
  private configManager: ConfigManager;
  private bridgeClient: HueBridgeClient | null = null;
  private bridgeDiscovery: BridgeDiscovery;

  constructor() {
    this.configManager = new ConfigManager();
    this.bridgeDiscovery = new BridgeDiscovery(this.configManager);
    
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

  async initialize(): Promise<void> {
    const config = await this.configManager.load();
    if (config) {
      this.bridgeClient = new HueBridgeClient(config.bridgeIp, config.apiKey);
    }
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
    // List available tools - dynamic based on configuration
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.configManager.isConfigured()) {
        // No config - only discovery tool available
        return {
          tools: [
            {
              name: "discover_bridge",
              description: "Discover Philips Hue Bridge on the network and configure connection",
              inputSchema: {
                type: "object",
                properties: {},
              },
            },
          ],
        };
      }

      // Config exists - show all tools
      return {
        tools: [
          {
            name: "discover_bridge",
            description: "Re-discover and reconfigure Hue Bridge connection",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
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
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "discover_bridge": {
            return await this.handleDiscoverBridge();
          }
          case "list_lights": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge first.");
            }
            const lights = await this.bridgeClient.listLights();
            return remapLightsToMCP(lights);
          }
          case "set_light_state": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge first.");
            }
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

  async handleDiscoverBridge() {
    const result = await this.bridgeDiscovery.discoverAndConfigure();
    
    if (result.success && result.bridgeIp && result.apiKey) {
      // Reinitialize bridge client with new config
      this.bridgeClient = new HueBridgeClient(result.bridgeIp, result.apiKey);
      
      // Notify client that tools list has changed
      await this.server.notification({
        method: "notifications/tools/list_changed",
        params: {}
      });
    }
    
    return {
      content: [
        {
          type: "text",
          text: result.message,
        },
      ],
    };
  }

  async run(): Promise<void> {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    if (this.configManager.isConfigured()) {
      console.error("Hue MCP server running on stdio (configured)");
    } else {
      console.error("Hue MCP server running on stdio (not configured - run discover_bridge)");
    }
  }
}

