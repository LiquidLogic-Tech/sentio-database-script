import yaml from "js-yaml";
import fs from "fs";

import { CONFIG_PATH } from "./const";
import { logger } from "./logger";

export function splitIntoChunks(arr: any[], chunkSize: number): any[][] {
  const result: any[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

export function loadConfig() {
  try {
    return yaml.load(fs.readFileSync(CONFIG_PATH, "utf8")) as {
      lastFetchedTimestamp: Record<string, string | null>;
    };
  } catch (error) {
    logger.error("Error loading config:", error);
    return { lastFetchedTimestamp: {} };
  }
}

export function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, yaml.dump(config));
  } catch (error) {
    logger.error("Error saving config:", error);
  }
}

export function updateLastFetchedTimestamp(eventName: string, timestamp: string) {
  const config = loadConfig();
  config.lastFetchedTimestamp[eventName] = timestamp;
  saveConfig(config);
}
