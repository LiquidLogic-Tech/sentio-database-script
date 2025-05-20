import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { getTokenDecimals } from "../utils";
import { NAVISDKClient } from "navi-sdk";

interface PoolInfo {
    total_supply: number,
    total_borrow: number,
    pool_amount: number,
}

export class NaviPoolFetcher {
    private client: NAVISDKClient;

    constructor() {
        this.client = new NAVISDKClient();
    }
    async getPoolInfo(address: string, symbol: string, decimal: number): Promise<PoolInfo> {
        const poolInfo = await this.client.getPoolInfo({
            symbol,
            address,
            decimal
        });

        return {
            total_supply: Number(poolInfo.total_supply),
            total_borrow: Number(poolInfo.total_borrow),
            pool_amount: Number(poolInfo.total_supply) - Number(poolInfo.total_borrow)
        }
    }
}

const fetcher = new NaviPoolFetcher();
fetcher.getPoolInfo("0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2", "BUCK", 9);