import axios from "axios";
import type { TokenSymbol } from "./const";
import { logger } from "./logger";
import type { Tables } from "./database.types";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabase } from "./supabase";
import { splitIntoChunks, updateLastFetchedTimestamp } from "./utils";
import {
  bottleCreatedScripts,
  bottleDestroyedScripts,
  bottleLiquidationScripts,
  bottleUpdatedScripts,
} from "./sql";

interface SentioQueryParams {
  token: TokenSymbol;
  from?: Date;
  sql: string;
}

// Event: Bottle Created
async function cloneBottleCreatedToDatabase(token: TokenSymbol, from?: Date) {
  try {
    let fetching = true;

    while (fetching) {
      const sql = bottleCreatedScripts(token, from);
      const response = await axios({
        method: "post",
        url: "https://app.sentio.xyz/api/v1/analytics/bucket/bucketprotocol-obl/sql/execute",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SENTIO_API_KEY,
        },
        data: {
          sqlQuery: {
            sql,
            size: 10000,
          },
        },
      });

      const rows = response.data.result.rows;
      logger.debug({ rows: response });
      logger.info(
        `query ${token}_Bottle_Created data: bulk with time staring from: ${from}`,
      );

      const dataInjectedToDB = convertSentioBottleCreatedEventToDBSchema(
        token,
        rows,
      );

      const insertedData = await insertBottleCreateToDB(dataInjectedToDB);

      // Update last fetched timestamp if we have data
      if (rows.length > 0) {
        const lastRecord = rows[rows.length - 1];
        updateLastFetchedTimestamp(
          `${token}_Bottle_Created`,
          lastRecord.timestamp,
        );

        let lastRecordTime = new Date(lastRecord.timestamp).getTime();
        let fromTimestamp = from?.getTime() || 0;

        if (fromTimestamp == lastRecordTime && insertedData == null) {
          // finished inserting
          fetching = false;
        } else {
          from = new Date(lastRecordTime);
          fetching = lastRecordTime <= new Date().getTime();
        }
      } else {
        logger.info("No response data");
        fetching = false;
      }
    }
  } catch (error: any) {
    logger.error(
      `Error fetching ${token} data:`,
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

function convertSentioBottleCreatedEventToDBSchema(
  token: TokenSymbol,
  data: SentioBottleCreated[],
) {
  return data.map(
    ({
      bottle_id,
      buck_amount,
      distinct_event_id,
      collateral_amount,
      sender,
      timestamp,
      transaction_hash,
    }) =>
      ({
        id: `${token}-${distinct_event_id}`,
        bottle_id,
        buck_amount,
        coin: token,
        collateral_amount,
        sender,
        timestamp,
        transaction_hash,
      }) as Tables<"Bottle Create">,
  );
}

async function insertBottleCreateToDB(data: Tables<"Bottle Create">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);

    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);

    for (const chunk of incomingIdChunks) {
      // Check which records already exist
      const { data, error: selectError } = await supabase
        .from("Bottle Create")
        .select("id")
        .in("id", chunk);

      const existingIds_ = data?.map((d) => d.id) || [];
      existingIds.push(...existingIds_);

      if (selectError) {
        logger.error("Error checking existing records:", selectError);
        throw selectError;
      }
    }

    // Filter out records that already exist
    const newRecords = data.filter(
      (record) => !existingIds.includes(record.id),
    );

    if (newRecords.length === 0) {
      logger.info("No new records to insert - all records already exist");
      return null;
    }

    // split to batches in 500 size
    const chunks = splitIntoChunks(newRecords, 1000);

    const insertedData = [];
    for (const [i, chunk] of chunks.entries()) {
      logger.info(`Processing chunk: ${i}`);
      // Insert only new records
      const { data, error: insertError } = await supabase
        .from("Bottle Create")
        .insert(chunk);

      insertedData.push(data);

      if (insertError) {
        logger.error("Error inserting data:", insertError);
        throw insertError;
      }
    }

    logger.info(
      `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
    );
    return insertedData;
  } catch (error) {
    logger.error("Error in insertBottleCreateToDB:", error);
    throw error;
  }
}

// Event: Bottle Updated
async function cloneBottleUpdatedToDatabase(token: TokenSymbol, from?: Date) {
  try {
    let fetching = true;

    while (fetching) {
      const sql = bottleUpdatedScripts(token, from);
      const response = await axios({
        method: "post",
        url: "https://app.sentio.xyz/api/v1/analytics/bucket/bucketprotocol-obl/sql/execute",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SENTIO_API_KEY,
        },
        data: {
          sqlQuery: {
            sql,
            size: 10000,
          },
        },
      });

      const rows = response.data.result.rows;
      logger.info({ rows });
      logger.info(
        `query ${token}_Bottle_Updated data: bulk with time staring from: ${from}`,
      );

      const dataInjectedToDB = convertSentioBottleUpdatedEventToDBSchema(
        token,
        rows,
      );

      const insertedData = await insertBottleUpdateToDB(dataInjectedToDB);

      if (rows.length > 0) {
        const lastRecord = rows[rows.length - 1];
        updateLastFetchedTimestamp(
          `${token}_Bottle_Updated`,
          lastRecord.timestamp,
        );

        let lastRecordTime = new Date(lastRecord.timestamp).getTime();
        let fromTimestamp = from?.getTime() || 0;

        if (fromTimestamp == lastRecordTime && insertedData == null) {
          // finished inserting
          fetching = false;
        } else {
          from = new Date(lastRecordTime);
          fetching = lastRecordTime <= new Date().getTime();
        }
      } else {
        logger.info("No response data");
        fetching = false;
      }
    }
  } catch (error: any) {
    logger.error(
      `Error fetching ${token} data:`,
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

function convertSentioBottleUpdatedEventToDBSchema(
  token: TokenSymbol,
  data: SentioBottleUpdated[],
) {
  return data.map(
    ({
      bottle_id,
      buck_amount,
      distinct_event_id,
      collateral_amount,
      sender,
      timestamp,
      transaction_hash,
      buck_change_amount,
      buck_change_amount_usd,
      collateral_change_amount,
      collateral_change_usd,
    }) =>
      ({
        id: `${token}-${distinct_event_id}`,
        bottle_id,
        buck_amount,
        coin: token,
        collateral_amount,
        sender,
        timestamp,
        transaction_hash,
        buck_change_amount,
        buck_change_amount_usd,
        collateral_change_amount,
        collateral_change_usd,
      }) as Tables<"Bottle Update">,
  );
}

async function insertBottleUpdateToDB(data: Tables<"Bottle Update">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);

    for (const chunk of incomingIdChunks) {
      // Check which records already exist
      const { data, error: selectError } = await supabase
        .from("Bottle Update")
        .select("id")
        .in("id", chunk);

      const existingIds_ = data?.map((d) => d.id) || [];
      existingIds.push(...existingIds_);

      if (selectError) {
        logger.error({ chunk });
        logger.error("Error checking existing records:", selectError);
        throw selectError;
      }
    }

    // Filter out records that already exist
    const newRecords = data.filter(
      (record) => !existingIds.includes(record.id),
    );

    if (newRecords.length === 0) {
      logger.info("No new records to insert - all records already exist");
      return null;
    }

    // split to batches in 500 size
    const chunks = splitIntoChunks(newRecords, 1000);

    const insertedData = [];
    for (const [i, chunk] of chunks.entries()) {
      logger.info(`Processing chunk: ${i}`);
      // Insert only new records
      const { data, error: insertError } = await supabase
        .from("Bottle Update")
        .insert(chunk);

      insertedData.push(data);

      if (insertError) {
        logger.error("Error inserting data:", insertError);
        throw insertError;
      }
    }

    logger.info(
      `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
    );
    return insertedData;
  } catch (error) {
    logger.error("Error in insertBottleUpdateToDB:", error);
    throw error;
  }
}

// Bottle Destroyed
function convertSentioBottleDestroyedEventToDBSchema(
  token: TokenSymbol,
  data: SentioBottleDestroyed[],
) {
  return data.map(
    ({
      bottle_id,
      distinct_event_id,
      collateral_amount,
      sender,
      timestamp,
      transaction_hash,
    }) =>
      ({
        id: `${token}-${distinct_event_id}`,
        bottle_id,
        coin: token,
        collateral_amount,
        sender,
        timestamp,
        transaction_hash,
      }) as Tables<"Bottle Destroy">,
  );
}

async function cloneBottleDestroyedToDatabase(token: TokenSymbol, from?: Date) {
  try {
    let fetching = true;

    while (fetching) {
      const sql = bottleDestroyedScripts(token, from);
      const response = await axios({
        method: "post",
        url: "https://app.sentio.xyz/api/v1/analytics/bucket/bucketprotocol-obl/sql/execute",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SENTIO_API_KEY,
        },
        data: {
          sqlQuery: {
            sql,
            size: 10000,
          },
        },
      });

      const rows = response.data.result.rows;
      logger.debug({ rows: response });
      logger.info(
        `query ${token}_Bottle_Destroyed data: bulk with time staring from: ${from}`,
      );

      const dataInjectedToDB = convertSentioBottleDestroyedEventToDBSchema(
        token,
        rows,
      );

      const insertedData = await insertBottleDestroyToDB(dataInjectedToDB);

      // Update last fetched timestamp if we have data
      if (rows.length > 0) {
        const lastRecord = rows[rows.length - 1];
        updateLastFetchedTimestamp(
          `${token}_Bottle_Destroyed`,
          lastRecord.timestamp,
        );

        let lastRecordTime = new Date(lastRecord.timestamp).getTime();
        let fromTimestamp = from?.getTime() || 0;

        if (fromTimestamp == lastRecordTime && insertedData == null) {
          // finished inserting
          fetching = false;
        } else {
          from = new Date(lastRecordTime);
          fetching = lastRecordTime <= new Date().getTime();
        }
      } else {
        logger.info("No response data");
        fetching = false;
      }
    }
  } catch (error: any) {
    logger.error(
      `Error fetching ${token} data:`,
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

async function insertBottleDestroyToDB(data: Tables<"Bottle Destroy">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);

    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);

    for (const chunk of incomingIdChunks) {
      // Check which records already exist
      const { data, error: selectError } = await supabase
        .from("Bottle Destroy")
        .select("id")
        .in("id", chunk);

      const existingIds_ = data?.map((d) => d.id) || [];
      existingIds.push(...existingIds_);

      if (selectError) {
        logger.error("Error checking existing records:", selectError);
        throw selectError;
      }
    }

    // Filter out records that already exist
    const newRecords = data.filter(
      (record) => !existingIds.includes(record.id),
    );

    if (newRecords.length === 0) {
      logger.info("No new records to insert - all records already exist");
      return null;
    }

    // split to batches in 500 size
    const chunks = splitIntoChunks(newRecords, 1000);

    const insertedData = [];
    for (const [i, chunk] of chunks.entries()) {
      logger.info(`Processing chunk: ${i}`);
      // Insert only new records
      const { data, error: insertError } = await supabase
        .from("Bottle Destroy")
        .insert(chunk);

      insertedData.push(data);

      if (insertError) {
        logger.error("Error inserting data:", insertError);
        throw insertError;
      }
    }

    logger.info(
      `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
    );
    return insertedData;
  } catch (error) {
    logger.error("Error in insertBottleDestroyToDB:", error);
    throw error;
  }
}

// Liquidation
async function cloneBottleLiquidationToDatabase(
  token: TokenSymbol,
  from?: Date,
) {
  try {
    let fetching = true;

    while (fetching) {
      const sql = bottleLiquidationScripts(token, from);
      const response = await axios({
        method: "post",
        url: "https://app.sentio.xyz/api/v1/analytics/bucket/bucketprotocol-obl/sql/execute",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SENTIO_API_KEY,
        },
        data: {
          sqlQuery: {
            sql,
            size: 10000,
          },
        },
      });

      logger.info(response.data);
      const rows = response.data.result.rows;
      logger.debug({ rows: response });
      logger.info(
        `query ${token}_Bottle_Liquidation data: bulk with time staring from: ${from}`,
      );

      const dataInjectedToDB = convertSentioBottleLiquidationEventToDBSchema(
        token,
        rows,
      );

      const insertedData = await insertBottleLiquidationToDB(dataInjectedToDB);

      // Update last fetched timestamp if we have data
      if (rows.length > 0) {
        const lastRecord = rows[rows.length - 1];
        updateLastFetchedTimestamp(
          `${token}_Bottle_Liquidation`,
          lastRecord.timestamp,
        );

        let lastRecordTime = new Date(lastRecord.timestamp).getTime();
        let fromTimestamp = from?.getTime() || 0;

        if (fromTimestamp == lastRecordTime && insertedData == null) {
          // finished inserting
          fetching = false;
        } else {
          from = new Date(lastRecordTime);
          fetching = lastRecordTime <= new Date().getTime();
        }
      } else {
        logger.info("No response data");
        fetching = false;
      }
    }
  } catch (error: any) {
    logger.error(
      `Error fetching ${token} data:`,
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

function convertSentioBottleLiquidationEventToDBSchema(
  token: TokenSymbol,
  data: SentioLiquidation[],
) {
  return data.map(
    ({
      distinct_event_id,
      amount,
      amount_usd,
      timestamp,
      transaction_hash,
      user_address,
      liquidator_address,
      pool_address,
      profit_usd,
    }) =>
      ({
        id: `${token}-${distinct_event_id}`,
        bottle_id: user_address,
        coin: token,
        collateral_amount: amount,
        collateral_amount_usd: amount_usd,
        liquidator_address,
        pool_address,
        profit_usd,
        timestamp,
        transaction_hash,
      }) as Tables<"Bottle Liquidation">,
  );
}

async function insertBottleLiquidationToDB(
  data: Tables<"Bottle Liquidation">[],
) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);

    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);

    for (const chunk of incomingIdChunks) {
      // Check which records already exist
      const { data, error: selectError } = await supabase
        .from("Bottle Liquidation")
        .select("id")
        .in("id", chunk);

      const existingIds_ = data?.map((d) => d.id) || [];
      existingIds.push(...existingIds_);

      if (selectError) {
        logger.error("Error checking existing records:", selectError);
        throw selectError;
      }
    }

    // Filter out records that already exist
    const newRecords = data.filter(
      (record) => !existingIds.includes(record.id),
    );

    if (newRecords.length === 0) {
      logger.info("No new records to insert - all records already exist");
      return null;
    }

    // split to batches in 500 size
    const chunks = splitIntoChunks(newRecords, 1000);

    const insertedData = [];
    for (const [i, chunk] of chunks.entries()) {
      logger.info(`Processing chunk: ${i}`);
      // Insert only new records
      const { data, error: insertError } = await supabase
        .from("Bottle Liquidation")
        .insert(chunk);

      insertedData.push(data);

      if (insertError) {
        logger.error("Error inserting data:", insertError);
        throw insertError;
      }
    }

    logger.info(
      `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
    );
    return insertedData;
  } catch (error) {
    logger.error("Error in insertBottleLiquidationToDB:", error);
    throw error;
  }
}

export {
  cloneBottleCreatedToDatabase,
  cloneBottleUpdatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleLiquidationToDatabase,
};
