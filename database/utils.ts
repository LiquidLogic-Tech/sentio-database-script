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

const PROTOCOLS = ["Bucket"] as const;
type ProtocolKey = (typeof PROTOCOLS)[number];

const DATA = ["LastFetchedTimestamp"] as const;
type DataKey = (typeof DATA)[number];

type ConfigType = {
  LastFetchedTimestamp: Record<ProtocolKey, Record<string, string | null>>;
};

export function loadConfig(): ConfigType {
  try {
    const rawConfig = yaml.load(
      fs.readFileSync(CONFIG_PATH, "utf8"),
    ) as ConfigType;

    if (!rawConfig) {
      return {
        LastFetchedTimestamp: {
          Bucket: {},
        },
      };
    }

    // Ensure proper structure exists
    if (!rawConfig.LastFetchedTimestamp) {
      rawConfig.LastFetchedTimestamp = {
        Bucket: {},
      };
    }

    // Ensure Bucket protocol exists
    if (!rawConfig.LastFetchedTimestamp.Bucket) {
      rawConfig.LastFetchedTimestamp.Bucket = {};
    }

    return rawConfig;
  } catch (error) {
    logger.error("Error loading config:", error);
    return {
      LastFetchedTimestamp: {
        Bucket: {},
      },
    };
  }
}

export function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, yaml.dump(config));
  } catch (error) {
    logger.error("Error saving config:", error);
  }
}

export function updateLastFetchedTimestamp(
  protocolName: ProtocolKey,
  eventName: string,
  timestamp: string,
) {
  const config = loadConfig();

  if (!config.LastFetchedTimestamp[protocolName]) {
    config.LastFetchedTimestamp[protocolName] = {};
  }
  config.LastFetchedTimestamp[protocolName][eventName] = timestamp;
  saveConfig(config);
}
