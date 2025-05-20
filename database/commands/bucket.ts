import {
  bottleCreatedScripts,
  bottleDestroyedScripts,
  bottleLiquidationScripts,
  bottleUpdatedScripts,
  totalFeeValueFromScripts,
} from "../sql";
import type { EventId } from "@mysten/sui/client";
import type { TokenSymbol } from "../const";
import { splitIntoChunks, updateLastFetchedTimestamp } from "../utils";
import { logger } from "../logger";
import axios from "axios";
import { pool } from ".";
import { BUCKET_TABLE_NAMES, type BucketTables } from "../types/database";
import { NaviDbHandler } from "../handler/navi-db-handler";
import { MoleDbHandler } from "../handler/mole-db-handler";
import { MoleFarmFetcher, MoleSavingFetcher, NaviFetcher } from "../eventFetchers";
import { NaviPoolHandler } from "../handler/navi-pool-handler";

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
          "Bucket",
          `${token}_Bottle_Created`,
          lastRecord.timestamp,
        );

        let lastRecordTime = new Date(lastRecord.timestamp).getTime();
        let fromTimestamp = from?.getTime() || 0;

        logger.info({ fromTimestamp, lastRecordTime });

        if (fromTimestamp === lastRecordTime && insertedData === null) {
          // finished inserting
          logger.info("Finished inserting - no new records at this timestamp");
          fetching = false;
        } else {
          from = new Date(lastRecordTime);
          // Only continue fetching if we're not beyond current time
          fetching = lastRecordTime < new Date().getTime();
          logger.info(`Continuing to fetch from timestamp: ${from}`);
        }
      } else {
        updateLastFetchedTimestamp(
          "Bucket",
          `${token}_Bottle_Created`,
          new Date().toISOString(),
        );
        logger.info("No response data");
        fetching = false;
      }
    }
    logger.info({ fetching });
  } catch (error: any) {
    logger.error(
      `Error fetching ${token} data:`,
      error.response ? error.response.data : error.message,
    );
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
      }) as BucketTables<"Bottle_Create">,
  );
}

async function insertBottleCreateToDB(data: BucketTables<"Bottle_Create">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);
    const connection = await pool.getConnection();

    try {
      for (const chunk of incomingIdChunks) {
        // Check which records already exist
        const [rows] = await connection.query(
          `SELECT id FROM \`${BUCKET_TABLE_NAMES.BOTTLE_CREATE}\` WHERE id IN (?)`,
          [chunk],
        );

        const existingIds_ = (rows as any[]).map((row) => row.id);
        existingIds.push(...existingIds_);
      }

      // Filter out records that already exist
      const newRecords = data.filter(
        (record) => !existingIds.includes(record.id),
      );

      if (newRecords.length === 0) {
        logger.info("No new records to insert - all records already exist");
        return null;
      }

      // Split to batches
      const chunks = splitIntoChunks(newRecords, 1000);
      const insertedData = [];

      for (const [i, chunk] of chunks.entries()) {
        logger.info(`Processing chunk: ${i}`);

        // Build batch insert query
        const values = chunk.flatMap((record) => {
          // Parse the timestamp if it's a string
          let formattedTimestamp = record.timestamp;
          if (typeof record.timestamp === "string") {
            // Parse the timestamp and format it for MySQL
            const date = new Date(record.timestamp);
            formattedTimestamp = date
              .toISOString()
              .slice(0, 23)
              .replace("T", " ");
          }

          return [
            record.id,
            record.bottle_id,
            record.buck_amount,
            record.coin,
            record.collateral_amount,
            record.sender,
            formattedTimestamp,
            record.transaction_hash,
          ];
        });

        // Keep your original placeholder and query structure
        const placeholders = chunk
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");

        const query = `
          INSERT INTO ${BUCKET_TABLE_NAMES.BOTTLE_CREATE} 
          (id, bottle_id, buck_amount, coin, collateral_amount, sender, timestamp, transaction_hash) 
          VALUES ${placeholders}
        `;

        const [result] = await connection.query(query, values);
        insertedData.push(result);
      }

      logger.info(
        `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
      );

      return insertedData;
    } finally {
      logger.info("finally");
      connection.release();
    }
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
          "Bucket",
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

        updateLastFetchedTimestamp(
          "Bucket",
          `${token}_Bottle_Updated`,
          new Date().toISOString(),
        );
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
      collateral_change_amount,
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
        collateral_change_amount,
      }) as BucketTables<"Bottle_Update">,
  );
}

async function insertBottleUpdateToDB(data: BucketTables<"Bottle_Update">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);
    const connection = await pool.getConnection();

    try {
      for (const chunk of incomingIdChunks) {
        // Check which records already exist
        const [rows] = await connection.query(
          `SELECT id FROM \`${BUCKET_TABLE_NAMES.BOTTLE_UPDATE}\` WHERE id IN (?)`,
          [chunk],
        );

        const existingIds_ = (rows as any[]).map((row) => row.id);
        existingIds.push(...existingIds_);
      }

      // Filter out records that already exist
      const newRecords = data.filter(
        (record) => !existingIds.includes(record.id),
      );

      if (newRecords.length === 0) {
        logger.info("No new records to insert - all records already exist");
        return null;
      }

      // Split to batches
      const chunks = splitIntoChunks(newRecords, 1000);
      const insertedData = [];

      for (const [i, chunk] of chunks.entries()) {
        logger.info(`Processing chunk: ${i}`);

        // Build batch insert query
        const placeholders = chunk
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");

        const values = chunk.flatMap((record) => {
          // Parse the timestamp if it's a string
          let formattedTimestamp = record.timestamp;
          if (typeof record.timestamp === "string") {
            // Parse the timestamp and format it for MySQL
            const date = new Date(record.timestamp);
            formattedTimestamp = date
              .toISOString()
              .slice(0, 23)
              .replace("T", " ");
          }

          return [
            record.id,
            record.bottle_id,
            record.buck_amount,
            record.coin,
            record.collateral_amount,
            record.sender,
            formattedTimestamp,
            record.transaction_hash,
            record.buck_change_amount,
            record.collateral_change_amount,
          ];
        });

        const query = `
          INSERT INTO ${BUCKET_TABLE_NAMES.BOTTLE_UPDATE} 
          (id, bottle_id, buck_amount, coin, collateral_amount, sender, timestamp, transaction_hash, 
           buck_change_amount, collateral_change_amount) 
          VALUES ${placeholders}
        `;

        const [result] = await connection.query(query, values);
        insertedData.push(result);
      }

      logger.info(
        `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
      );

      return insertedData;
    } finally {
      connection.release();
    }
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
      }) as BucketTables<"Bottle_Destroy">,
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
          "Bucket",
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
        updateLastFetchedTimestamp(
          "Bucket",
          `${token}_Bottle_Destroyed`,
          new Date().toISOString(),
        );
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

async function insertBottleDestroyToDB(data: BucketTables<"Bottle_Destroy">[]) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);
    const connection = await pool.getConnection();

    try {
      for (const chunk of incomingIdChunks) {
        // Check which records already exist
        const [rows] = await connection.query(
          `SELECT id FROM \`${BUCKET_TABLE_NAMES.BOTTLE_DESTROY}\` WHERE id IN (?)`,
          [chunk],
        );

        const existingIds_ = (rows as any[]).map((row) => row.id);
        existingIds.push(...existingIds_);
      }

      // Filter out records that already exist
      const newRecords = data.filter(
        (record) => !existingIds.includes(record.id),
      );

      if (newRecords.length === 0) {
        logger.info("No new records to insert - all records already exist");
        return null;
      }

      // Split to batches
      const chunks = splitIntoChunks(newRecords, 1000);
      const insertedData = [];

      for (const [i, chunk] of chunks.entries()) {
        logger.info(`Processing chunk: ${i}`);

        // Build batch insert query
        const placeholders = chunk
          .map(() => "(?, ?, ?, ?, ?, ?, ?)")
          .join(", ");

        const values = chunk.flatMap((record) => {
          // Parse the timestamp if it's a string
          let formattedTimestamp = record.timestamp;
          if (typeof record.timestamp === "string") {
            // Parse the timestamp and format it for MySQL
            const date = new Date(record.timestamp);
            formattedTimestamp = date
              .toISOString()
              .slice(0, 23)
              .replace("T", " ");
          }

          return [
            record.id,
            record.bottle_id,
            record.coin,
            record.collateral_amount,
            record.sender,
            formattedTimestamp,
            record.transaction_hash,
          ];
        });

        const query = `
          INSERT INTO ${BUCKET_TABLE_NAMES.BOTTLE_DESTROY} 
          (id, bottle_id, coin, collateral_amount, sender, timestamp, transaction_hash) 
          VALUES ${placeholders}
        `;

        const [result] = await connection.query(query, values);
        insertedData.push(result);
      }

      logger.info(
        `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
      );

      return insertedData;
    } finally {
      connection.release();
    }
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
          "Bucket",
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

        updateLastFetchedTimestamp(
          "Bucket",
          `${token}_Bottle_Liquidation`,
          new Date().toISOString(),
        );
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
        liquidator_address,
        pool_address,
        profit_usd,
        timestamp,
        transaction_hash,
      }) as BucketTables<"Bottle_Liquidation">,
  );
}

async function insertBottleLiquidationToDB(
  data: BucketTables<"Bottle_Liquidation">[],
) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);
    const connection = await pool.getConnection();

    try {
      for (const chunk of incomingIdChunks) {
        // Check which records already exist
        const [rows] = await connection.query(
          `SELECT id FROM \`${BUCKET_TABLE_NAMES.BOTTLE_LIQUIDATION}\` WHERE id IN (?)`,
          [chunk],
        );

        const existingIds_ = (rows as any[]).map((row) => row.id);
        existingIds.push(...existingIds_);
      }

      // Filter out records that already exist
      const newRecords = data.filter(
        (record) => !existingIds.includes(record.id),
      );

      if (newRecords.length === 0) {
        logger.info("No new records to insert - all records already exist");
        return null;
      }

      // Split to batches
      const chunks = splitIntoChunks(newRecords, 1000);
      const insertedData = [];

      for (const [i, chunk] of chunks.entries()) {
        logger.info(`Processing chunk: ${i}`);

        // Build batch insert query
        const placeholders = chunk
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");

        const values = chunk.flatMap((record) => {
          // Parse the timestamp if it's a string
          let formattedTimestamp = record.timestamp;
          if (typeof record.timestamp === "string") {
            // Parse the timestamp and format it for MySQL
            const date = new Date(record.timestamp);
            formattedTimestamp = date
              .toISOString()
              .slice(0, 23)
              .replace("T", " ");
          }

          logger.info({ formattedTimestamp });

          return [
            record.id,
            record.bottle_id,
            record.coin,
            record.collateral_amount,
            record.liquidator_address,
            record.pool_address,
            record.profit_usd,
            formattedTimestamp,
            record.transaction_hash,
          ];
        });

        const query = `
          INSERT INTO ${BUCKET_TABLE_NAMES.BOTTLE_LIQUIDATION} 
          (id, bottle_id, coin, collateral_amount, 
           liquidator_address, pool_address, profit_usd, timestamp, transaction_hash) 
          VALUES ${placeholders}
        `;

        const [result] = await connection.query(query, values);
        insertedData.push(result);
      }

      logger.info(
        `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
      );

      return insertedData;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error("Error in insertBottleLiquidationToDB:", error);
    throw error;
  }
}

// Total_Fee_Value_From
async function cloneTotalFeeValueFromToDatabase(from?: Date) {
  try {
    let fetching = true;

    while (fetching) {
      const sql = totalFeeValueFromScripts(from);
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
        `query Total_Fee_Value_From data: bulk with time staring from: ${from}`,
      );

      logger.info({ rows });

      const dataInjectedToDB =
        convertSentioTotalFeeValueFromEventToDBSchema(rows);

      logger.info({ dataInjectedToDB });

      const insertedData = await insertTotalFeeValueFromToDB(dataInjectedToDB);

      // Update last fetched timestamp if we have data
      if (rows.length > 0) {
        const lastRecord = rows[rows.length - 1];
        updateLastFetchedTimestamp(
          "Bucket",
          `Total_Fee_Value_From`,
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

        updateLastFetchedTimestamp(
          "Bucket",
          `Total_Fee_Value_From`,
          new Date().toISOString(),
        );
      }
    }
  } catch (error: any) {
    logger.error(
      `Error fetching Total_Fee_Value_From data:`,
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

function convertSentioTotalFeeValueFromEventToDBSchema(
  data: SentioTotalFeeValueFrom[],
) {
  return data.map(
    ({
      value,
      distinct_event_id,
      coin_symbol,
      timestamp,
      transaction_hash,
      from,
    }) =>
      ({
        id: distinct_event_id,
        coin: coin_symbol,
        fee_value: value,
        timestamp,
        transaction_hash,
        service: from,
      }) as BucketTables<"Total_Fee_Value_From">,
  );
}

async function insertTotalFeeValueFromToDB(
  data: BucketTables<"Total_Fee_Value_From">[],
) {
  try {
    // Get all IDs from the incoming data
    const incomingIds = data.map((record) => record.id);
    let existingIds = [];

    const incomingIdChunks = splitIntoChunks(incomingIds, 1000);
    const connection = await pool.getConnection();

    try {
      for (const chunk of incomingIdChunks) {
        // Check which records already exist
        const [rows] = await connection.query(
          `SELECT id FROM \`${BUCKET_TABLE_NAMES.TOTAL_FEE_VALUE_FROM}\` WHERE id IN (?)`,
          [chunk],
        );

        const existingIds_ = (rows as any[]).map((row) => row.id);
        existingIds.push(...existingIds_);
      }

      // Filter out records that already exist
      const newRecords = data.filter(
        (record) => !existingIds.includes(record.id),
      );

      if (newRecords.length === 0) {
        logger.info("No new records to insert - all records already exist");
        return null;
      }

      // Split to batches
      const chunks = splitIntoChunks(newRecords, 1000);
      const insertedData = [];

      for (const [i, chunk] of chunks.entries()) {
        logger.info(`Processing chunk: ${i}`);

        // Build batch insert query
        const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

        const values = chunk.flatMap((record) => {
          // Parse the timestamp if it's a string
          let formattedTimestamp = record.timestamp;
          if (typeof record.timestamp === "string") {
            // Parse the timestamp and format it for MySQL
            const date = new Date(record.timestamp);
            formattedTimestamp = date
              .toISOString()
              .slice(0, 23)
              .replace("T", " ");
          }

          return [
            record.id,
            record.coin,
            record.fee_value,
            formattedTimestamp,
            record.transaction_hash,
            record.service,
          ];
        });

        const query = `
          INSERT INTO ${BUCKET_TABLE_NAMES.TOTAL_FEE_VALUE_FROM} 
          (id, coin, fee_value, timestamp, transaction_hash, service) 
          VALUES ${placeholders}
        `;

        const [result] = await connection.query(query, values);
        insertedData.push(result);
      }

      logger.info(
        `Successfully inserted ${newRecords.length} new records out of ${data.length} total records`,
      );

      return insertedData;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error("Error in insertTotalFeeValueFromToDB:", error);
    throw error;
  }
}


async function fetchAllEvents(fetcher: any, isDeposit: boolean, name: string, pool?: string, startCursor: EventId | null = null) {
  let cursor = startCursor;
  let totalRawEvents = 0;
  let page = 1;
  let allEvents: any[] = [];

  while (true) {
      logger.info(`\n=== ${name} ${isDeposit ? 'Deposit' : 'Withdraw'} Events - Page ${page} ===`);
      if (pool) {
          logger.info(`Pool: ${pool}`);
      }
      
      const result = await fetcher.fetchEvents(isDeposit, cursor, pool);
      
      if (!result.rawEventsCount || result.rawEventsCount === 0) {
          logger.info(`No more raw events found for ${name} ${isDeposit ? 'deposit' : 'withdraw'}`);
          break;
      }
      
      allEvents = [...allEvents, ...result.events];
      totalRawEvents += result.rawEventsCount;
      logger.info(`Total filtered events so far: ${allEvents.length}`);
      logger.info(`Total raw events so far: ${totalRawEvents}`);
      
      if (!result.nextCursor) {
          logger.info(`Reached the end for ${name} ${isDeposit ? 'deposit' : 'withdraw'}`);
          break;
      }

      cursor = result.nextCursor;
      page++;
  }

  return allEvents;
}

async function syncMoleSavingEvents() {
  try {
      // Get the last event from Mole Saving (both deposit and withdraw)
      const [lastSavingDepositEvent, lastSavingWithdrawEvent] = await Promise.all([
          MoleDbHandler.getLatestEvent(true),
          MoleDbHandler.getLatestEvent(false)
      ]);
      
      let savingCursor = null;
      if (lastSavingDepositEvent?.[0] || lastSavingWithdrawEvent?.[0]) {
          // Compare timestamps and use the latest one
          const depositTimestamp = lastSavingDepositEvent?.[0]?.timestamp || 0;
          const withdrawTimestamp = lastSavingWithdrawEvent?.[0]?.timestamp || 0;
          const latestEvent = depositTimestamp > withdrawTimestamp ? lastSavingDepositEvent![0] : lastSavingWithdrawEvent![0];
          
          savingCursor = {
              txDigest: latestEvent.event_id.substring(0, 44),
              eventSeq: latestEvent.event_id.substring(44)
          };
      }

      logger.info('\n=== Starting Mole Saving Events Fetch ===');
      const savingFetcher = new MoleSavingFetcher();
      
      const savingDepositEvents = await fetchAllEvents(savingFetcher, true, 'Mole Saving', undefined, savingCursor);
      const savingWithdrawEvents = await fetchAllEvents(savingFetcher, false, 'Mole Saving', undefined, savingCursor);
      
      // Calculate balance changes
      let savingDepositBalance = 0;
      const savingDepositEventsWithBalance = savingDepositEvents.map(event => {
          const assetChange = Number(event.asset_change);
          const previousBalance = savingDepositBalance;
          savingDepositBalance += assetChange;
          return {
              ...event,
              accumulation: savingDepositBalance.toString()
          };
      });

      let savingWithdrawBalance = 0;
      const savingWithdrawEventsWithBalance = savingWithdrawEvents.map(event => {
          const assetChange = Number(event.asset_change);
          const previousBalance = savingWithdrawBalance;
          savingWithdrawBalance += assetChange;
          return {
              ...event,
              accumulation: savingWithdrawBalance.toString()
          };
      });

      // Save Mole Saving Events
      logger.info('\n=== Saving Mole Saving Events to Database ===');
      for (const event of savingDepositEventsWithBalance) {
          await MoleDbHandler.insertEvent(event, true);
      }
      for (const event of savingWithdrawEventsWithBalance) {
          await MoleDbHandler.insertEvent(event, false);
      }
  } catch (error) {
      logger.error('Error syncing Mole Saving events:', error);
      throw error;
  }
}

async function syncMoleFarmEvents() {
  try {
      // Get the last event from each Mole Farm pool (both deposit and withdraw)
      const farmPools = [
          "0x4c50ba9d1e60d229800293a4222851c9c3f797aa5ba8a8d32cc67ec7e79fec60", // USDC-BUCK
          "0x59cf0d333464ad29443d92bfd2ddfd1f794c5830141a5ee4a815d1ef3395bf6c"  // BUCK-SUI
      ];
      
      let farmCursor = null;
      for (const pool of farmPools) {
          const [lastFarmDepositEvent, lastFarmWithdrawEvent] = await Promise.all([
            MoleDbHandler.getLatestFarmEvent(true),
            MoleDbHandler.getLatestFarmEvent(false)
          ]);

          if (lastFarmDepositEvent?.[0] || lastFarmWithdrawEvent?.[0]) {
              // Compare timestamps and use the latest one
              const depositTimestamp = lastFarmDepositEvent?.[0]?.timestamp || 0;
              const withdrawTimestamp = lastFarmWithdrawEvent?.[0]?.timestamp || 0;
              const latestEvent = depositTimestamp > withdrawTimestamp ? lastFarmDepositEvent![0] : lastFarmWithdrawEvent![0];
              
              const currentCursor = {
                  txDigest: latestEvent.event_id.substring(0, 44),
                  eventSeq: latestEvent.event_id.substring(44)
              };
              // Update farmCursor if it's null or if current cursor has a newer timestamp
              if (!farmCursor || parseInt(currentCursor.eventSeq) > parseInt(farmCursor.eventSeq)) {
                  farmCursor = currentCursor;
              }
          }
      }

      logger.info('\n=== Starting Mole Farm Events Fetch ===');
      const farmFetcher = new MoleFarmFetcher();

      for (const pool of farmPools) {
          logger.info(`\nProcessing pool: ${pool}`);
          const farmDepositEvents = await fetchAllEvents(farmFetcher, true, 'Mole Farm', pool, farmCursor);
          const farmWithdrawEvents = await fetchAllEvents(farmFetcher, false, 'Mole Farm', pool, farmCursor);
          
          // Calculate pool balance changes
          let poolDepositBalanceA = 0;
          let poolDepositBalanceB = 0;
          const farmDepositEventsWithBalance = farmDepositEvents.map(event => {
              const assetChangeA = Number(event.asset_change_a);
              const assetChangeB = Number(event.asset_change_b);
              const previousBalanceA = poolDepositBalanceA;
              const previousBalanceB = poolDepositBalanceB;
              poolDepositBalanceA += assetChangeA;
              poolDepositBalanceB += assetChangeB;
              return {
                  ...event,
                  pool_balance_a: poolDepositBalanceA.toString(),
                  pool_balance_b: poolDepositBalanceB.toString()
              };
          });

          let poolWithdrawBalanceA = 0;
          let poolWithdrawBalanceB = 0;
          const farmWithdrawEventsWithBalance = farmWithdrawEvents.map(event => {
              const assetChangeA = Number(event.asset_change_a);
              const assetChangeB = Number(event.asset_change_b);
              const previousBalanceA = poolWithdrawBalanceA;
              const previousBalanceB = poolWithdrawBalanceB;
              poolWithdrawBalanceA += assetChangeA;
              poolWithdrawBalanceB += assetChangeB;
              return {
                  ...event,
                  pool_balance_a: poolWithdrawBalanceA.toString(),
                  pool_balance_b: poolWithdrawBalanceB.toString()
              };
          });

          // Save Mole Farm Events
          logger.info(`\n=== Saving Mole Farm Events to Database for Pool ${pool} ===`);
          for (const event of farmDepositEventsWithBalance) {
              await MoleDbHandler.insertFarmEvent(event, true);
          }
          for (const event of farmWithdrawEventsWithBalance) {
              await MoleDbHandler.insertFarmEvent(event, false);
          }
      }
  } catch (error) {
      logger.error('Error syncing Mole Farm events:', error);
      throw error;
  }
}

async function syncNaviEvents() {
  try {
      // Get the last event from Navi (both deposit and withdraw)
      const [lastNaviDepositEvent, lastNaviWithdrawEvent] = await Promise.all([
          NaviDbHandler.getLatestEvent(true),
          NaviDbHandler.getLatestEvent(false)
      ]);
      
      let naviCursor = null;
      if (lastNaviDepositEvent?.[0] || lastNaviWithdrawEvent?.[0]) {
          // Compare timestamps and use the latest one
          const depositTimestamp = lastNaviDepositEvent?.[0]?.timestamp || 0;
          const withdrawTimestamp = lastNaviWithdrawEvent?.[0]?.timestamp || 0;
          const latestEvent = depositTimestamp > withdrawTimestamp ? lastNaviDepositEvent![0] : lastNaviWithdrawEvent![0];
          
          naviCursor = {
              txDigest: latestEvent.event_id.substring(0, 44),
              eventSeq: latestEvent.event_id.substring(44)
          };
      }

      logger.info('\n=== Starting Navi Events Fetch ===');
      const naviFetcher = new NaviFetcher();
      
      const naviDepositEvents = await fetchAllEvents(naviFetcher, true, 'Navi', undefined, naviCursor);
      const naviWithdrawEvents = await fetchAllEvents(naviFetcher, false, 'Navi', undefined, naviCursor);
      
      // Calculate balance changes
      let naviDepositBalance = 0;
      const naviDepositEventsWithBalance = naviDepositEvents.map(event => {
          const assetChange = Number(event.asset_change);
          const previousBalance = naviDepositBalance;
          naviDepositBalance += assetChange;
          return {
              ...event,
              accumulation: naviDepositBalance.toString()
          };
      });

      let naviWithdrawBalance = 0;
      const naviWithdrawEventsWithBalance = naviWithdrawEvents.map(event => {
          const assetChange = Number(event.asset_change);
          const previousBalance = naviWithdrawBalance;
          naviWithdrawBalance += assetChange;
          return {
              ...event,
              accumulation: naviWithdrawBalance.toString()
          };
      });

      // Save Navi Events
      logger.info('\n=== Saving Navi Events to Database ===');
      for (const event of naviDepositEventsWithBalance) {
          await NaviDbHandler.insertEvent(event, true);
      }
      for (const event of naviWithdrawEventsWithBalance) {
          await NaviDbHandler.insertEvent(event, false);
      }
  } catch (error) {
      logger.error('Error syncing Navi events:', error);
      throw error;
  }
}

export async function syncNaviPoolData() {
    try {
        console.log("Starting to sync Navi Pool data...");
        const handler = new NaviPoolHandler();
        await handler.insertPoolData();
        console.log("Navi Pool data sync completed");
    } catch (error) {
        console.error("Failed to sync Navi Pool data:", error);
        throw error;
    }
}

export {
  cloneBottleCreatedToDatabase,
  cloneBottleUpdatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleLiquidationToDatabase,
  cloneTotalFeeValueFromToDatabase,
  syncMoleSavingEvents,
  syncMoleFarmEvents,
  syncNaviEvents
};
