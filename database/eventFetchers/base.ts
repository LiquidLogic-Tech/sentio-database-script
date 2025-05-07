import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import type { EventId } from "@mysten/sui/client";
import { logger } from "../../database/logger";

export class BaseEventFetcher {
    protected client: SuiClient;
    protected MAX_RETRIES = 10;
    protected RETRY_DELAY = 5000;

    constructor() {
        this.client = new SuiClient({
            url: getFullnodeUrl('mainnet'),
        });
    }

    protected sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected async queryEvents(query: any, cursor: EventId | null = null, limit: number = 50) {
        return await this.client.queryEvents({
            query,
            cursor,
            order: "ascending",
            limit,
        });
    }

    protected async retry<T>(
        operation: () => Promise<T>,
        retryCount = 0
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            logger.error(`Error (attempt ${retryCount + 1}/${this.MAX_RETRIES}):`, error);
            
            if (retryCount < this.MAX_RETRIES) {
                await this.sleep(this.RETRY_DELAY);
                return this.retry(operation, retryCount + 1);
            }
            
            throw error;
        }
    }
} 