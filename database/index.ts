import pLimit from "p-limit";
import { logger } from "./logger";
import { CronJob } from "cron";
import { setTimeout } from "timers/promises";
import {
  cloneBottleCreatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleLiquidationToDatabase,
  cloneBottleUpdatedToDatabase,
  cloneTotalFeeValueFromToDatabase,
  syncMoleSavingEvents,
  syncMoleFarmEvents,
  syncNaviEvents,
  syncNaviPoolData
} from "./commands/bucket";
import { COLLATERAL_COINS, type TokenSymbol } from "./const";
import { loadConfig, updateLastFetchedTimestamp } from "./utils";

const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  delay: number = 5000,
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        logger.error(`Failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delay / 1000}s...`,
        error,
      );
      await setTimeout(delay);
    }
  }

  throw lastError;
};

async function processCollateralCoin(coin: TokenSymbol) {
  await retry(async () => {
    await cloneBottleCreatedToDatabase(coin);
    await cloneBottleUpdatedToDatabase(coin);
    await cloneBottleDestroyedToDatabase(coin);
    await cloneBottleLiquidationToDatabase(coin);
    logger.info(`Finished processing ${coin}`);
  });
}

async function main() {
  try {
    for (const coin of COLLATERAL_COINS) {
      logger.info(`Processing ${coin}...`);
      await processCollateralCoin(coin as TokenSymbol);
    }
    logger.info("All coins processed");

    await retry(() => cloneTotalFeeValueFromToDatabase());
    logger.info("Total fee value cloned successfully");
  } catch (error) {
    logger.error("Failed to complete the sync process:", error);
  }
}

// Create a cron job that runs every hour
const job = new CronJob(
  "0 * * * *", // Runs at minute 0 of every hour
  async () => {
    logger.info("Starting scheduled sync...");
    try {
      await main();
      logger.info("Scheduled sync completed successfully");
    } catch (error) {
      logger.error("Scheduled sync failed:", error);
    }
  },
  null, // onComplete
  true, // start immediately
  "UTC", // timezone
);

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM signal. Stopping cron job...");
  job.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT signal. Stopping cron job...");
  job.stop();
  process.exit(0);
});

// Start the job
job.start();
