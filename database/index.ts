import pLimit from "p-limit";
import { logger } from "./logger";
import {
  cloneBottleCreatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleLiquidationToDatabase,
  cloneBottleUpdatedToDatabase,
  cloneTotalFeeValueFromToDatabase,
} from "./commands";
import { COLLATERAL_COINS } from "./const";

async function main() {
  for (const coin of COLLATERAL_COINS) {
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

  await cloneTotalFeeValueFromToDatabase();

  process.exit(0);
}

main().catch(logger.error);
