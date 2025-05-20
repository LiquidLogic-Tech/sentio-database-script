import type { EventId } from "@mysten/sui/client";
import { BaseEventFetcher } from "./base";
import { logger } from "../../database/logger";
import { getTokenDecimals } from "../utils";

export class NaviFetcher extends BaseEventFetcher {
    private readonly DEPOSIT_EVENT_TYPE = "0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca::pool::PoolDeposit";
    private readonly WITHDRAW_EVENT_TYPE = "0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca::pool::PoolWithdraw";
    private readonly BUCK_TYPE = "ce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";

    private collectedCount = 0;

    async fetchEvents(isDeposit: boolean, cursor: EventId | null = null) {
        const eventType = isDeposit ? this.DEPOSIT_EVENT_TYPE : this.WITHDRAW_EVENT_TYPE;
        logger.info(`Tracking event type: ${eventType}`);
        try {
            const result = await this.retry(() => this.queryEvents({
                MoveEventType: eventType,
            }, cursor));

            if (result.data.length === 0) {
                return {
                    events: [],
                    nextCursor: null,
                    rawEventsCount: 0
                };
            }

            const events = result.data.map((event) => {
                const parsedJson = JSON.parse(JSON.stringify(event.parsedJson));
                const coinType = parsedJson.coin_type;
                if (coinType !== this.BUCK_TYPE) {
                    return null;
                }
                const decimals = getTokenDecimals('BUCK');
                const amount = BigInt(parsedJson.amount);
                const adjustedAmount = Number(amount) / (10 ** decimals);
                return {
                    event_id: `${event.id.txDigest}${event.id.eventSeq}`,
                    timestamp: Number(event.timestampMs),
                    sender: event.sender,
                    transaction_hash: event.id.txDigest,
                    asset: 'BUCK',
                    asset_change: adjustedAmount.toString(),
                    accumulation: "0"
                };
            }).filter(event => event !== null);

            this.collectedCount += events.length;
            logger.info(`Total collected events: ${this.collectedCount}`);

            return {
                events,
                nextCursor: result.nextCursor || null,
                rawEventsCount: result.data.length
            };
        } catch (error) {
            logger.error(`Error fetching Navi ${isDeposit ? 'deposit' : 'withdraw'} events:`, error);
            throw error;
        }
    }
} 