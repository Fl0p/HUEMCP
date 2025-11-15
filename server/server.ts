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

interface CompleteBridgeSetupArgs {
  bridge_ip: string;
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
              description: "Discover Philips Hue Bridge on the network. Returns IP address. After this, you need to press the button on the bridge and call complete_bridge_setup.",
              inputSchema: {
                type: "object",
                properties: {},
              },
            },
            {
              name: "complete_bridge_setup",
              description: "Complete Hue Bridge setup by pressing the link button and creating API key. Call this after discover_bridge and pressing the physical button on the bridge.",
              inputSchema: {
                type: "object",
                properties: {
                  bridge_ip: {
                    type: "string",
                    description: "IP address of the Hue Bridge (from discover_bridge)",
                  },
                },
                required: ["bridge_ip"],
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
            description: "Re-discover Philips Hue Bridge on the network. Returns IP address.",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "complete_bridge_setup",
            description: "Reconfigure Hue Bridge connection by pressing the link button and creating API key.",
            inputSchema: {
              type: "object",
              properties: {
                bridge_ip: {
                  type: "string",
                  description: "IP address of the Hue Bridge (from discover_bridge)",
                },
              },
              required: ["bridge_ip"],
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
          case "complete_bridge_setup": {
            const { bridge_ip } = args as unknown as CompleteBridgeSetupArgs;
            
            if (!bridge_ip) {
              throw new Error("bridge_ip is required");
            }
            
            return await this.handleCompleteBridgeSetup(bridge_ip);
          }
          case "list_lights": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
            }
            const lights = await this.bridgeClient.listLights();
            return remapLightsToMCP(lights);
          }
          case "set_light_state": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
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
    const result = await this.bridgeDiscovery.discover();
    
    if (result.success && result.bridgeIp) {
      return {
        content: [
          {
            type: "text",
            text: `✅ Found Hue Bridge at IP: ${result.bridgeIp}\n\n` +
                  `⚠️ IMPORTANT: Please press the physical LINK BUTTON on your Hue Bridge now!\n` +
                  `Then call complete_bridge_setup with bridge_ip="${result.bridgeIp}" within 30 seconds.`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `❌ ${result.message}`,
        },
      ],
      isError: true,
    };
  }

  async handleCompleteBridgeSetup(bridgeIp: string) {
    const configResult = await this.bridgeDiscovery.configure(bridgeIp);
    
    if (!configResult.success || !configResult.apiKey) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ${configResult.message}`,
          },
        ],
        isError: true,
      };
    }

    // Save configuration
    const configPath = await this.configManager.save({
      bridgeIp: bridgeIp,
      apiKey: configResult.apiKey,
    });

    // Reinitialize bridge client with new config
    this.bridgeClient = new HueBridgeClient(bridgeIp, configResult.apiKey);
    
    // Notify client that tools list has changed
    await this.server.notification({
      method: "notifications/tools/list_changed",
      params: {}
    });
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Bridge configured successfully!\n\n` +
                `Bridge IP: ${bridgeIp}\n` +
                `API Key: ${configResult.apiKey}\n` +
                `Config saved to: ${configPath}\n\n` +
                `You can now use list_lights and set_light_state tools.`,
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

