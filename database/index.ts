import pLimit from "p-limit";
import { logger } from "./logger";
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

async function main() {
  for (const coin of COLLATERAL_COINS) {
    logger.info(`Processing ${coin}...`);
    try {
      await cloneBottleCreatedToDatabase(coin as TokenSymbol);
      await cloneBottleUpdatedToDatabase(coin as TokenSymbol);
      await cloneBottleDestroyedToDatabase(coin as TokenSymbol);
      await cloneBottleLiquidationToDatabase(coin as TokenSymbol);
      
      await syncMoleSavingEvents();
      await syncMoleFarmEvents();
      await syncNaviEvents();
      await syncNaviPoolData();
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
