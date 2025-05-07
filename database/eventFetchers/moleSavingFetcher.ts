import type { EventId } from "@mysten/sui/client";
import { BaseEventFetcher } from "./base";
import { logger } from "../../database/logger";
import { getTokenDecimals } from "../utils";

export class MoleSavingFetcher extends BaseEventFetcher {
    private readonly DEPOSIT_EVENT_TYPE = "0x5ffa69ee4ee14d899dcc750df92de12bad4bacf81efa1ae12ee76406804dda7f::vault::DepositEvent<0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK>";
    private readonly WITHDRAW_EVENT_TYPE = "0x5ffa69ee4ee14d899dcc750df92de12bad4bacf81efa1ae12ee76406804dda7f::vault::WithdrawEvent<0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK>";

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
            });

            this.collectedCount += events.length;
            logger.info(`Total collected events: ${this.collectedCount}`);

            return {
                events,
                nextCursor: result.nextCursor || null,
                rawEventsCount: result.data.length
            };
        } catch (error) {
            logger.error(`Error fetching Mole Saving ${isDeposit ? 'deposit' : 'withdraw'} events:`, error);
            throw error;
        }
    }
} 