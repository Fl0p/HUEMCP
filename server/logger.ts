import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log file path - in the dist directory
const LOG_FILE = path.join(__dirname, "huemcp.log");

export class Logger {
  private static instance: Logger;
  private enabled: boolean = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  log(level: "INFO" | "ERROR" | "WARN", message: string, data?: any) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${level}: ${message}${
      data ? " " + JSON.stringify(data) : ""
    }\n`;

    try {
      fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
      // Silent fail - can't log if logging fails
    }
  }

  info(message: string, data?: any) {
    this.log("INFO", message, data);
  }

  error(message: string, data?: any) {
    this.log("ERROR", message, data);
  }

  warn(message: string, data?: any) {
    this.log("WARN", message, data);
  }
}

