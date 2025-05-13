import { pool } from "../commands";
import { NaviPoolFetcher } from "../objectFetchers/navi-pool-fetcher";
import type { RowDataPacket } from "mysql2";

interface NaviPoolData extends RowDataPacket {
    id: number;
    timestamp: Date;
    balance: string;
    asset: string;
    supply_amount: number;
    borrow_amount: number;
}

export class NaviPoolHandler {
    private fetcher: NaviPoolFetcher;
    private readonly BUCK_ADDRESS = "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2";
    private readonly BUCK_DECIMAL = 9;

    constructor() {
        this.fetcher = new NaviPoolFetcher();
    }

    async insertPoolData(): Promise<void> {
        try {
            const poolData = await this.fetcher.getPoolInfo(
                this.BUCK_ADDRESS,
                'BUCK',
                this.BUCK_DECIMAL
            );
            const query = `
                INSERT INTO Navi_Pool (balance, asset, supply_amount, borrow_amount)
                VALUES (?, ?, ?, ?)
            `;
            await pool.execute(query, [
                poolData.balance,
                'BUCK',
                poolData.total_supply,
                poolData.total_borrow
            ]);
        } catch (error) {
            console.error("Failed to insert navi pool data:", error);
            throw error;
        }
    }

    async getLatestPoolData(): Promise<NaviPoolData | undefined> {
        try {
            const query = `
                SELECT * FROM Navi_Pool 
                ORDER BY timestamp DESC 
                LIMIT 1
            `;
            const [rows] = await pool.execute<NaviPoolData[]>(query);
            return rows[0];
        } catch (error) {
            console.error("Failed to get latest navi pool data:", error);
            throw error;
        }
    }

    async getPoolDataByTimeRange(startTime: string, endTime: string): Promise<NaviPoolData[]> {
        try {
            const query = `
                SELECT * FROM Navi_Pool 
                WHERE timestamp BETWEEN ? AND ?
                ORDER BY timestamp ASC
            `;
            const [rows] = await pool.execute<NaviPoolData[]>(query, [startTime, endTime]);
            return rows;
        } catch (error) {
            console.error("Failed to get navi pool data by time range:", error);
            throw error;
        }
    }
} 