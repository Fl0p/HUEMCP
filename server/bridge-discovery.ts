import { ConfigManager } from "./config.js";
import { Logger } from "./logger.js";
import Bonjour from "bonjour-service";
import type { Service } from "bonjour-service";

export interface DiscoveryResult {
  success: boolean;
  message: string;
  bridgeIp?: string;
}

export interface ConfigureResult {
  success: boolean;
  message: string;
  apiKey?: string;
}

export interface FullDiscoveryResult {
  success: boolean;
  message: string;
  bridgeIp?: string;
  apiKey?: string;
  configPath?: string;
}

export class BridgeDiscovery {
  private cliMode: boolean = false;
  private logger = Logger.getInstance();

  constructor(private configManager: ConfigManager) {}

  setCliMode(enabled: boolean) {
    this.cliMode = enabled;
  }

  async discover(): Promise<DiscoveryResult> {
    if (this.cliMode) {
      console.log("\n🔍 Searching for Philips Hue Bridge on the network...");
    }
    this.logger.info("Starting Hue Bridge discovery");
    
    return new Promise((resolve) => {
      // @ts-ignore - ESM/CommonJS interop issue
      const BonjourConstructor = Bonjour.default || Bonjour;
      const bonjour = new BonjourConstructor();
      const timeout = 10000; // 10 seconds
      let found = false;
      
      const browser = bonjour.find({ type: "hue" }, (service: Service) => {
        if (found) return;
        
        const ip = service.addresses?.[0] || service.host;
        
        if (ip) {
          found = true;
          
          if (this.cliMode) {
            console.log(`✅ Found Hue Bridge at ${ip}`);
          }
          this.logger.info("Hue Bridge discovered", { ip });
          
          browser.stop();
          bonjour.destroy();
          
          resolve({
            success: true,
            message: `Found Hue Bridge at ${ip}`,
            bridgeIp: ip
          });
        }
      });
      
      setTimeout(() => {
        if (!found) {
          browser.stop();
          bonjour.destroy();
          
          this.logger.warn("No Hue Bridge found on network");
          
          resolve({
            success: false,
            message: "No Hue Bridge found on the network. Make sure the bridge is powered on and connected."
          });
        }
      }, timeout);
    });
  }

  async configure(bridgeIp: string): Promise<ConfigureResult> {
    if (this.cliMode) {
      console.log("\n⚙️ Configuring Hue Bridge...");
      console.log("👉 Please press the link button on your Hue Bridge now!");
      console.log("   Waiting for 30 seconds...\n");
    }
    this.logger.info("Starting bridge configuration", { bridgeIp });

    const maxAttempts = 30;
    const attemptInterval = 1000; // 1 second

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://${bridgeIp}/api`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devicetype: "huemcp#user" }),
        });

        const result = await response.json() as Array<{ success?: { username: string }, error?: { description: string } }>;

        if (result[0]?.success?.username) {
          const apiKey = result[0].success.username;
          
          if (this.cliMode) {
            console.log("✅ Successfully created API key!");
          }
          this.logger.info("API key created successfully", { bridgeIp });

          return {
            success: true,
            message: "API key created successfully!",
            apiKey,
          };
        }

        if (result[0]?.error?.description.includes("link button not pressed")) {
          // Button not pressed yet, continue waiting
          await new Promise(resolve => setTimeout(resolve, attemptInterval));
          continue;
        }

        const errorMsg = result[0]?.error?.description || "Unknown error occurred";
        this.logger.error("Bridge configuration failed", { bridgeIp, error: errorMsg });
        
        return {
          success: false,
          message: errorMsg,
        };
      } catch (error) {
        const errorMsg = `Failed to connect to bridge: ${error}`;
        this.logger.error("Bridge connection failed", { bridgeIp, error: String(error) });
        
        return {
          success: false,
          message: errorMsg,
        };
      }
    }

    this.logger.warn("Bridge configuration timeout", { bridgeIp });
    
    return {
      success: false,
      message: "Timeout: Link button was not pressed within 30 seconds",
    };
  }

  async discoverAndConfigure(): Promise<FullDiscoveryResult> {
    const discoveryResult = await this.discover();
    
    if (!discoveryResult.success || !discoveryResult.bridgeIp) {
      return {
        success: false,
        message: discoveryResult.message,
      };
    }

    const configResult = await this.configure(discoveryResult.bridgeIp);
    
    if (!configResult.success || !configResult.apiKey) {
      return {
        success: false,
        message: configResult.message,
        bridgeIp: discoveryResult.bridgeIp,
      };
    }

    const configPath = await this.configManager.save({
      bridgeIp: discoveryResult.bridgeIp,
      apiKey: configResult.apiKey,
    });

    console.log("💾 Configuration saved:");
    console.log(`   Bridge IP: ${discoveryResult.bridgeIp}`);
    console.log(`   API Key: ${configResult.apiKey}`);
    console.log(`   Config file: ${configPath}\n`);

    return {
      success: true,
      message: "Bridge discovered and configured successfully!",
      bridgeIp: discoveryResult.bridgeIp,
      apiKey: configResult.apiKey,
      configPath,
    };
  }
}

