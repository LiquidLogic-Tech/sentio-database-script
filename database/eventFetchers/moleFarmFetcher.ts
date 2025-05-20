import type { EventId } from "@mysten/sui/client";
import { BaseEventFetcher } from "./base";
import { logger } from "../../database/logger";
import { ADDRESS_TOKEN_INFO_MAPPING } from "../const";
import { getTokenDecimals } from "../utils";

interface PoolConfig {
    coinTypeA: string;
    coinTypeB: string;
    packageId: string;
}

export class MoleFarmFetcher extends BaseEventFetcher {
    private readonly POOL_CONFIGS: Record<string, PoolConfig> = {
        "0x4c50ba9d1e60d229800293a4222851c9c3f797aa5ba8a8d32cc67ec7e79fec60": {
            coinTypeA: "USDC",
            coinTypeB: "BUCK",
            packageId: "0x0d661e0f5ae04a6efac1289846171b23edb545b1f0157b71bea2acd22fdeda45"
        },
        "0x59cf0d333464ad29443d92bfd2ddfd1f794c5830141a5ee4a815d1ef3395bf6c": {
            coinTypeA: "BUCK",
            coinTypeB: "SUI",
            packageId: "0xbc54cfd6822831b3687585ab7d5cb03795437c5500caef5e138f6cb7a8f65b78"
        }
    };

    private collectedCount = 0;

    async fetchEvents(isDeposit: boolean, cursor: EventId | null = null, pool?: string) {
        logger.info(`Tracking pool: ${pool}`);
        try {
            if (!pool) {
                throw new Error("Pool address is required");
            }

            const poolConfig = this.POOL_CONFIGS[pool];
            if (!poolConfig) {
                throw new Error(`Unsupported pool address: ${pool}`);
            }

            const result = await this.retry(() => this.queryEvents({
                MoveModule: {
                    package: poolConfig.packageId,
                    module: "cetus_clmm_worker",
                }
            }, cursor));

            if (result.data.length === 0) {
                return {
                    events: [],
                    nextCursor: null,
                    rawEventsCount: 0
                };
            }

            const events = [];
            for (const event of result.data) {
                const isAddLiquidity = event.type === "0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb::pool::AddLiquidityEvent";
                const isRemoveLiquidity = event.type === "0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb::pool::RemoveLiquidityEvent";

                if ((isDeposit && !isAddLiquidity) || (!isDeposit && !isRemoveLiquidity)) {
                    continue;
                }

                if (event.parsedJson) {
                    const parsedJson = JSON.parse(JSON.stringify(event.parsedJson));
                    const eventPool = parsedJson.pool;
                    if (eventPool !== pool) {
                        continue;
                    }
                    if (poolConfig && parsedJson.amount_a && parsedJson.amount_b) {
                        const decimalsA = getTokenDecimals(poolConfig.coinTypeA);
                        const decimalsB = getTokenDecimals(poolConfig.coinTypeB);
                        const amountA = BigInt(parsedJson.amount_a);
                        const amountB = BigInt(parsedJson.amount_b);
                        const adjustedAmountA = Number(amountA) / (10 ** decimalsA);
                        const adjustedAmountB = Number(amountB) / (10 ** decimalsB);
                        const parsedEvent = {
                            event_id: `${event.id.txDigest}${event.id.eventSeq}`,
                            timestamp: Number(event.timestampMs),
                            sender: event.sender,
                            transaction_hash: event.id.txDigest,
                            asset_a: poolConfig.coinTypeA,
                            asset_b: poolConfig.coinTypeB,
                            asset_change_a: adjustedAmountA.toString(),
                            asset_change_b: adjustedAmountB.toString()
                        };
                        events.push(parsedEvent);
                    }
                }
            }

            this.collectedCount += events.length;
            logger.info(`Total collected events: ${this.collectedCount}`);

            return {
                events,
                nextCursor: result.nextCursor || null,
                rawEventsCount: result.data.length
            };
        } catch (error) {
            logger.error(`Error fetching Mole Farm ${isDeposit ? 'deposit' : 'withdraw'} events:`, error);
            throw error;
        }
    }
} 