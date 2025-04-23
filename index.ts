import pLimit from "p-limit";
import { logger } from "./logger";
import { COLLATERAL_COINS } from "./const";
import {
  cloneBottleCreatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleLiquidationToDatabase,
  cloneBottleUpdatedToDatabase,
} from "./commands";

async function main() {
  for (const coin of ["WAL", "sWAL", "haWAL"]) {
    logger.info(`Processing ${coin}...`);
    try {
      await cloneBottleCreatedToDatabase(coin as any);
      await cloneBottleUpdatedToDatabase(coin as any);
      await cloneBottleDestroyedToDatabase(coin as any);
      await cloneBottleLiquidationToDatabase(coin as any);
      logger.info(`Finished processing ${coin}`);
    } catch (error) {
      logger.error(`Error processing ${coin}:`, error);
    }
  }
  logger.info("All coins processed");
}

main().catch(logger.error);
