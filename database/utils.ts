import yaml from "js-yaml";
import fs from "fs";
import { CONFIG_PATH, ADDRESS_TOKEN_INFO_MAPPING, COINS_TYPE_LIST } from "./const";
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

/**
 * Convert JS timestamp (ms) to MySQL DATETIME/TIMESTAMP string.
 * @param {number|string} ms - JS timestamp in milliseconds
 * @returns {string|null} - MySQL timestamp string (YYYY-MM-DD HH:MM:SS) or null if invalid
 */
export function toMysqlTimestamp(ms: number | string): string | null {
  if (!ms) return null;
  // If string and length is 10, treat as seconds
  if (typeof ms === 'string' && ms.length === 10) ms = Number(ms) * 1000;
  // If number and less than 10^12, treat as seconds
  if (typeof ms === 'number' && ms < 1e12) ms = ms * 1000;
  const date = new Date(Number(ms));
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Get token decimals from token symbol
 * @param tokenSymbol Token symbol (e.g. "USDC", "BUCK", "SUI")
 * @returns Token decimals, defaults to 9 if not found
 */
export function getTokenDecimals(tokenSymbol: string): number {
    // Get token type string from COINS_TYPE_LIST
    const tokenTypeStr = COINS_TYPE_LIST[tokenSymbol as keyof typeof COINS_TYPE_LIST];
    if (!tokenTypeStr) {
        logger.warn(`Token symbol ${tokenSymbol} not found in COINS_TYPE_LIST`);
        return 9; // Default to 9 decimals if token not found
    }
    // Extract address part from token type string
    const tokenAddress = tokenTypeStr.split("::")[0];
    // Get decimals from ADDRESS_TOKEN_INFO_MAPPING
    const decimals = ADDRESS_TOKEN_INFO_MAPPING[tokenAddress]?.decimal;
    if (decimals === undefined) {
        logger.warn(`Decimals not found for token ${tokenSymbol} with address ${tokenAddress}`);
        return 9; // Default to 9 decimals if decimals not found
    }
    return decimals;
}
