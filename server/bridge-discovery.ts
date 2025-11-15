import { ConfigManager } from "./config.js";
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
  constructor(private configManager: ConfigManager) {}

  async discover(): Promise<DiscoveryResult> {
    console.log("\n🔍 Searching for Philips Hue Bridge on the network...");
    
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
          console.log(`✅ Found Hue Bridge at ${ip}`);
          
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
          
          resolve({
            success: false,
            message: "No Hue Bridge found on the network. Make sure the bridge is powered on and connected."
          });
        }
      }, timeout);
    });
  }

  async configure(bridgeIp: string): Promise<ConfigureResult> {
    console.log("\n⚙️ Configuring Hue Bridge...");
    console.log("👉 Please press the link button on your Hue Bridge now!");
    console.log("   Waiting for 30 seconds...\n");

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
          console.log("✅ Successfully created API key!");

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

        return {
          success: false,
          message: result[0]?.error?.description || "Unknown error occurred",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to connect to bridge: ${error}`,
        };
      }
    }

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

