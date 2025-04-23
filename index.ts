import pLimit from "p-limit";
import { logger } from "./logger";
import { COLLATERAL_COINS } from "./const";
import {
  cloneBottleCreatedToDatabase,
  cloneBottleDestroyedToDatabase,
  cloneBottleUpdatedToDatabase,
} from "./commands";

async function main() {
  for (const coin of COLLATERAL_COINS) {
    logger.info(`Processing ${coin}...`);
    try {
      if (coin == "SUI") continue;
      // await cloneBottleCreatedToDatabase(coin);
      // await cloneBottleUpdatedToDatabase(coin);
      await cloneBottleDestroyedToDatabase(coin);
      logger.info(`Finished processing ${coin}`);
    } catch (error) {
      logger.error(`Error processing ${coin}:`, error);
    }
  }
  logger.info("All coins processed");
}

main().catch(logger.error);
