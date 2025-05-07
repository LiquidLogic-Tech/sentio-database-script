import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { getTokenDecimals } from "../utils";

interface PoolData {
    balance: string;
}

export class NaviPoolFetcher {
    private client: SuiClient;
    private readonly NAVI_BUCK_POOL = "0x98953e1c8af4af0cd8f59a52f9df6e60c9790b8143f556751f10949b40c76c50";

    constructor() {
        this.client = new SuiClient({
            url: getFullnodeUrl('mainnet'),
        });
    }

    async getPoolBalance(): Promise<PoolData> {
        const pool = await this.client.getObject({
            id: this.NAVI_BUCK_POOL,
            options: {
                showContent: true,
                showType: true
            }
        });
        
        const content = pool.data?.content as unknown as { fields: { balance: string, treasury_balance: string } };
        if (content?.fields) {
            const decimals = getTokenDecimals('BUCK');
            const balance = BigInt(content.fields.balance);
            const adjustedBalance = Number(balance) / (10 ** decimals);
            return {
                balance: adjustedBalance.toString()
            };
        } else {
            throw new Error("Failed to get pool balance");
        }
    }
}