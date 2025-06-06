import { Database } from "bun:sqlite";
import mysql from "mysql2/promise";
import { type Server } from "bun";
import { COLLATERAL_COINS } from "../database/const";
import { BucketClient } from "bucket-protocol-sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

// Configure MySQL connection pool
const pool = mysql.createPool({
  host: process.env.PLANETSCALE_HOST,
  user: process.env.PLANETSCALE_USERNAME,
  password: process.env.PLANETSCALE_PASSWORD,
  database: process.env.PLANETSCALE_DATABASE,
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to validate date
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to get start and end of day for a given timestamp_ms
function getDayBoundaries(timestamp_ms: string) {
  // Convert milliseconds to Date object
  const date = new Date(parseInt(timestamp_ms, 10));

  if (!isValidDate(date)) {
    throw new Error("Invalid timestamp_ms format");
  }

  // Set to start of day (00:00:00.000)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Set to end of day (23:59:59.999)
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

// Helper function to parse query parameters
function parseQueryParams(url: URL) {
  const timestamp_ms = url.searchParams.get("timestamp_ms");

  if (!timestamp_ms) {
    return null;
  }

  // Validate if timestamp_ms is a valid number
  if (!/^\d+$/.test(timestamp_ms)) {
    throw new Error("timestamp_ms must be a valid number");
  }

  return getDayBoundaries(timestamp_ms);
}

// Helper function to convert timestamp to timestamp_ms
function timestampToMs(timestamp: string): number {
  return new Date(timestamp).getTime();
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Add CORS headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    });

    // Handle OPTIONS request for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ status: "ok" }), { headers });
      }
      // Main endpoint to fetch data
      if (url.pathname === "/api/fees") {
        try {
          const queryParams = parseQueryParams(url);

          let query;
          let params: any[] = [];

          if (queryParams) {
            // Get summarized data for the specified day and specific "from" values
            query = `
              SELECT 
                DATE(timestamp) as date,
                COUNT(*) as total_records,
                SUM(fee_value) as total_fee_value,
                AVG(fee_value) as average_fee_value,
                MIN(fee_value) as min_fee_value,
                MAX(fee_value) as max_fee_value,
                MIN(timestamp) as first_record_time,
                MAX(timestamp) as last_record_time
              FROM Total_Fee_Value_From 
              WHERE timestamp >= ? AND timestamp <= ?
                AND \`service\` IN ('borrow', 'charge', 'liquidate', 'redeem', 'discharge', 'flashmint', 'interest', 'flashloan')
                AND coin IN (${[...COLLATERAL_COINS, "BUCK"].map((coin) => `'${coin}'`).join(", ")})
              GROUP BY DATE(timestamp)
  `;
            params = [queryParams.startOfDay, queryParams.endOfDay];
          } else {
            // If no timestamp provided, get today's data with specific "from" values
            const { startOfDay, endOfDay } = getDayBoundaries(
              new Date().toISOString(),
            );
            query = `
              SELECT 
                DATE(timestamp) as date,
                COUNT(*) as total_records,
                SUM(fee_value) as total_fee_value,
                AVG(fee_value) as average_fee_value,
                MIN(fee_value) as min_fee_value,
                MAX(fee_value) as max_fee_value,
                MIN(timestamp) as first_record_time,
                MAX(timestamp) as last_record_time
              FROM Total_Fee_Value_From 
              WHERE timestamp >= ? AND timestamp <= ?
                AND \`service\` IN ('borrow', 'charge', 'liquidate', 'redeem', 'discharge', 'flashmint', 'interest', 'flashloan')
                AND coin IN (${[...COLLATERAL_COINS, "BUCK"].map((coin) => `'${coin}'`).join(", ")})
              GROUP BY DATE(timestamp)
  `;
            params = [startOfDay, endOfDay];
          }

          // Execute the query
          const [rows] = await pool.execute(query, params);
          let summary = (rows as any[])[0] || null;

          // Convert timestamp fields to timestamp_ms in the response
          if (summary) {
            summary = {
              ...summary,
              first_record_time_ms: timestampToMs(summary.first_record_time),
              last_record_time_ms: timestampToMs(summary.last_record_time),
            };
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: summary,
              metadata: {
                date: queryParams
                  ? queryParams.startOfDay.toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
                timestamp_ms: queryParams
                  ? queryParams.startOfDay.getTime()
                  : new Date().getTime(),
              },
            }),
            { headers },
          );
        } catch (error) {
          console.error("Error processing request:", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
              status: 400,
              headers,
            },
          );
        }
      }

      if (url.pathname === "/api/checkOrbiterQuest") {
        const owner = url.searchParams.get("address");

        if (!owner) {
          return new Response(
            JSON.stringify({
              error: "Missing required parameter: address",
            }),
            {
              status: 400,
              headers,
            },
          );
        }

        async function validateBucketQuest(owner: string) {
          const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
          const bucketClient = new BucketClient();
          const prices = await bucketClient.getPrices();
          const res = (await suiClient.getOwnedObjects({
            owner,
            filter: {
              StructType:
                "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>",
            },
            options: {
              showContent: true,
              showType: true,
            },
          })) as any;
          const totalLockedSbuck = res.data.reduce((acc, d) => {
            const amt = d.data?.content.fields.stake_amount;

            return acc + Number(amt);
          }, 0);

          const totalLockedBuck =
            (totalLockedSbuck / 10 ** 9) * (prices.sBUCK || 1);
          const requiredBuckAmount = 100; // 100 BUCK
          const isValid = totalLockedBuck >= requiredBuckAmount;
          const message = isValid
            ? "Verification succeeded"
            : "Verification failed";
          const result = {
            totalLockedBuck,
            requiredBuckAmount,
          };

          return {
            isValid,
            message,
            result,
          };
        }

        try {
          const result = await validateBucketQuest(owner);
          return new Response(JSON.stringify(result), { headers });
        } catch (error) {
          return new Response(
            JSON.stringify({
              error: "Failed to validate quest",
              message: error instanceof Error ? error.message : "Unknown error",
            }),
            {
              status: 500,
              headers,
            },
          );
        }
      }

      // Handle 404
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers,
      });
    } catch (error) {
      console.error("Server error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers,
        },
      );
    }
  },
});

console.log(`Server running at http://0.0.0.0:${server.port}`);

// Handle server errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
