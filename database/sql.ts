import { COINS_TYPE_LIST, type TokenSymbol } from "./const";
import { loadConfig } from "./utils";

export function bottleCreatedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.LastFetchedTimestamp.Bucket[`${token}_Bottle_Created`];
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

  return sql;
}

export function bottleUpdatedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.LastFetchedTimestamp.Bucket[`${token}_Bottle_Updated`];
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

  return sql;
}

export function bottleDestroyedScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.LastFetchedTimestamp.Bucket[`${token}_Bottle_Destroyed`];
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

  return sql;
}

export function bottleLiquidationScripts(token: TokenSymbol, from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.LastFetchedTimestamp.Bucket[`${token}_Liquidation`];
    if (lastTimestamp) {
      from = new Date(lastTimestamp);
    }
  }

  // Build SQL query with token filter and optional timestamp filter
  let sql = `SELECT * FROM Liquidations WHERE token_address = '${COINS_TYPE_LIST[token]}'`;

  // Add timestamp filter if provided
  if (from) {
    sql += ` AND timestamp >= '${from.getTime()}'`;
  }

  sql += ` ORDER BY timestamp ASC`;

  return sql;
}

export function totalFeeValueFromScripts(from?: Date) {
  // Load last fetched timestamp if no specific date is provided
  if (!from) {
    const config = loadConfig();
    const lastTimestamp =
      config.LastFetchedTimestamp.Bucket["Total_Fee_Value_From"];
    if (lastTimestamp) {
      from = new Date(lastTimestamp);
    }
  }

  // Build SQL query with token filter and optional timestamp filter
  let sql = "SELECT * FROM Total_Fee_Value_From";

  // Add timestamp filter if provided
  if (from) {
    sql += ` WHERE timestamp >= '${from.getTime()}'`;
  }

  sql += ` ORDER BY timestamp ASC`;

  return sql;
}
