import type { TokenSymbol } from "./const";
import { loadConfig } from "./utils";

export function bottleCreatedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.lastFetchedTimestamp[`${token}_Bottle_Created`];
    if (lastTimestamp) {
      from = new Date(lastTimestamp);
    }
  }

  // Build SQL query with timestamp filter if needed
  let sql = `SELECT * from ${token}_Bottle_Created`;
  if (from) {
    sql += ` WHERE timestamp >= '${from.getTime()}'`;
  }
  sql += ` ORDER BY timestamp ASC`;

  return sql
}

export function bottleUpdatedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.lastFetchedTimestamp[`${token}_Bottle_Updated`];
    if (lastTimestamp) {
      from = new Date(lastTimestamp);
    }
  }

  // Build SQL query with timestamp filter if needed
  let sql = `SELECT * from ${token}_Bottle_Updated`;
  if (from) {
    sql += ` WHERE timestamp >= '${from.getTime()}'`;
  }
  sql += ` ORDER BY timestamp ASC`;

  return sql
}

export function bottleDestroyedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.lastFetchedTimestamp[`${token}_Bottle_Destroyed`];
    if (lastTimestamp) {
      from = new Date(lastTimestamp);
    }
  }

  // Build SQL query with timestamp filter if needed
  let sql = `SELECT * from ${token}_Bottle_Destroyed`;
  if (from) {
    sql += ` WHERE timestamp >= '${from.getTime()}'`;
  }
  sql += ` ORDER BY timestamp ASC`;

  return sql
}
