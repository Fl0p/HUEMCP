// Script to generate manifest.json from TypeScript constants
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TOOLS_ALL } from '../dist/tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manifest = {
  manifest_version: "0.3",
  name: "huemcp",
  display_name: "Philips Hue MCP Server",
  version: "0.1.0",
  description: "Control Philips Hue lights through MCP",
  author: {
    name: "Fl0p",
    email: "flopsmp@gmail.com",
    url: "https://github.com/Fl0p/HUEMCP"
  },
  repository: {
    type: "git",
    url: "https://github.com/Fl0p/HUEMCP.git"
  },
  icon: "icon.png",
  server: {
    type: "node",
    entry_point: "dist/index.js",
    mcp_config: {
      command: "node",
      args: ["${__dirname}/dist/index.js"],
      env: {
        HUE_BRIDGE_IP: "${user_config.bridge_ip}",
        HUE_API_KEY: "${user_config.api_key}"
      }
    }
  },
  user_config: {
    bridge_ip: {
      type: "string",
      title: "Hue Bridge IP Address",
      description: "IP address of your Philips Hue Bridge. Optional. Use discover_bridge tool if not provided"
    },
    api_key: {
      type: "string",
      title: "Hue API Key",
      description: "API key for authenticating with the Hue Bridge. Optional. Use complete_bridge_setup tool if not provided",
      sensitive: true
    }
  },
  tools: TOOLS_ALL.map(tool => ({
    name: tool.name,
    description: tool.description
  })),
  keywords: ["philips-hue", "smart-home", "lighting"],
  license: "MIT"
};

const manifestPath = join(__dirname, '..', 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest.json generated successfully!');

