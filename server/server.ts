import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { HueBridgeClient } from "./hue-bridge-client.js";
import { ConfigManager } from "./config.js";
import { BridgeDiscovery } from "./bridge-discovery.js";
import { Logger } from "./logger.js";
import {
  TOOLS_SETUP,
  TOOLS_ALL,
} from "./tools.js";

// Helper function to format MCP responses
function createMCPResponse(data: string | object, isError: boolean = false) {
  const isString = typeof data === 'string';
  
  return {
    content: [
      isString 
        ? { type: "text" as const, text: data }
        : { type: "text" as const, text: JSON.stringify(data, null, 2) }
    ],
    ...(isError && { isError: true }),
  };
}

interface SetLightStateArgs {
  light_id: string;
  on?: boolean;
  brightness?: number;
  hue?: number;
  saturation?: number;
}

interface UpdateZoneArgs {
  zone_id: string;
  on?: boolean;
  brightness?: number;
  hue?: number;
  saturation?: number;
}

interface UpdateRoomArgs {
  room_id: string;
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
  private logger = Logger.getInstance();

  constructor() {
    this.configManager = new ConfigManager();
    this.bridgeDiscovery = new BridgeDiscovery(this.configManager);
    
    // Enable logging for MCP server
    this.logger.enable();
    
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
      this.logger.error("MCP Server error", { error: String(error) });
    };

    process.on("SIGINT", async () => {
      this.logger.info("Server shutting down");
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers(): void {
    // List available tools - dynamic based on configuration
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.configManager.isConfigured()) {
        // No config - only discovery tools available
        return {
          tools: TOOLS_SETUP
        };
      }
      // Config exists - show all tools
      return {
        tools: TOOLS_ALL
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
            return createMCPResponse(lights);
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
            
            return createMCPResponse(`✅ Light ${light_id} updated successfully`);
          }
          case "list_zones": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
            }
            const zones = await this.bridgeClient.listZones();
            return createMCPResponse(zones);
          }
          case "update_zone": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
            }
            const { zone_id, on, brightness, hue, saturation } = args as unknown as UpdateZoneArgs;
            
            if (!zone_id) {
              throw new Error("zone_id is required");
            }

            await this.bridgeClient.updateZone(zone_id, {
              on,
              brightness,
              hue,
              saturation,
            });
            
            return createMCPResponse(`✅ Zone ${zone_id} updated successfully`);
          }
          case "list_rooms": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
            }
            const rooms = await this.bridgeClient.listRooms();
            return createMCPResponse(rooms);
          }
          case "update_room": {
            if (!this.bridgeClient) {
              throw new Error("Bridge not configured. Run discover_bridge and complete_bridge_setup first.");
            }
            const { room_id, on, brightness, hue, saturation } = args as unknown as UpdateRoomArgs;
            
            if (!room_id) {
              throw new Error("room_id is required");
            }

            await this.bridgeClient.updateRoom(room_id, {
              on,
              brightness,
              hue,
              saturation,
            });
            
            return createMCPResponse(`✅ Room ${room_id} updated successfully`);
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("Tool execution error", { tool: name, error: errorMessage });
        return createMCPResponse(`Error: ${errorMessage}`, true);
      }
    });
  }

  async handleDiscoverBridge() {
    const result = await this.bridgeDiscovery.discover();
    
    if (result.success && result.bridgeIp) {
      return createMCPResponse(
        `✅ Found Hue Bridge at IP: ${result.bridgeIp}\n\n` +
        `⚠️ IMPORTANT: Please press the physical LINK BUTTON on your Hue Bridge now!\n` +
        `Then call complete_bridge_setup with bridge_ip="${result.bridgeIp}" within 30 seconds.`
      );
    }
    
    return createMCPResponse(`❌ ${result.message}`, true);
  }

  async handleCompleteBridgeSetup(bridgeIp: string) {
    const configResult = await this.bridgeDiscovery.configure(bridgeIp);
    
    if (!configResult.success || !configResult.apiKey) {
      return createMCPResponse(`❌ ${configResult.message}`, true);
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
    
    return createMCPResponse(
      `✅ Bridge configured successfully!\n\n` +
      `Bridge IP: ${bridgeIp}\n` +
      `API Key: ${configResult.apiKey}\n` +
      `Config saved to: ${configPath}\n\n` +
      `You can now use list_lights and set_light_state tools.`
    );
  }

  async run(): Promise<void> {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    const configured = this.configManager.isConfigured();
    this.logger.info("Hue MCP server started", { configured });
  }
}

