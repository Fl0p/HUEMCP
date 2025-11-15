import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

export interface HueConfig {
  bridgeIp: string;
  apiKey: string;
}

export class ConfigManager {
  private configPath: string;
  private config: HueConfig | null = null;

  constructor() {
    // Get directory where the bundle is running
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Config file next to the bundle
    this.configPath = join(__dirname, "hue-config.json");
  }

  async load(): Promise<HueConfig | null> {
    if (this.config) {
      return this.config;
    }

    // Check environment variables first
    const envBridgeIp = process.env.HUE_BRIDGE_IP;
    const envApiKey = process.env.HUE_API_KEY;
    
    if (envBridgeIp && envApiKey) {
      this.config = {
        bridgeIp: envBridgeIp,
        apiKey: envApiKey,
      };
      return this.config;
    }

    // Fall back to config file
    try {
      if (!existsSync(this.configPath)) {
        return null;
      }

      const data = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data);
      return this.config;
    } catch (error) {
      console.error("Failed to load config:", error);
      return null;
    }
  }

  async save(config: HueConfig): Promise<string> {
    try {
      const dir = dirname(this.configPath);
      await mkdir(dir, { recursive: true });
      await writeFile(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
      return this.configPath;
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): HueConfig | null {
    return this.config;
  }
}

