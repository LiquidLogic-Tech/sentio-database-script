import {
  syncMoleSavingEvents,
  syncMoleFarmEvents,
  syncNaviEvents,
  syncNaviPoolData,
} from "./commands/bucket";

async function syncAllEvents() {
  try {
    console.log("Starting to sync all events...");

    // Execute all sync tasks in parallel
    await Promise.all([
      syncMoleSavingEvents().catch((error) => {
        console.error("Failed to sync Mole Saving events:", error);
      }),
      syncMoleFarmEvents().catch((error) => {
        console.error("Failed to sync Mole Farm events:", error);
      }),
      syncNaviPoolData().catch((error) => {
        console.error("Failed to sync Navi Pool data:", error);
      }),
      syncNaviEvents().catch(error => {
        console.error("Failed to sync Navi events:", error);
      })
    ]);

    console.log("All events sync completed");
  } catch (error) {
    console.error("Error occurred during sync:", error);
  }
}


syncNaviEvents().catch(console.error)
