import { pool } from "../commands";
import { EVENT_TABLES } from "../const.js";
import { toMysqlTimestamp } from "../utils";
// import { logger } from "../logger.js";

export interface NaviEvent {
    event_id: string;
    timestamp: number;
    sender: string;
    transaction_hash: string;
    asset: string;
    asset_change: string;
    accumulation: string;
}

export class NaviDbHandler {
    static async insertEvent(event: NaviEvent, isDeposit: boolean): Promise<void> {
        const tableName = isDeposit ? EVENT_TABLES.NAVI.DEPOSIT : EVENT_TABLES.NAVI.WITHDRAW;
        try {
            await pool.query(
                `INSERT IGNORE INTO ${tableName} 
                (event_id, timestamp, sender, transaction_hash, asset, asset_change, accumulation) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    event.event_id,
                    toMysqlTimestamp(event.timestamp),
                    event.sender,
                    event.transaction_hash,
                    event.asset,
                    event.asset_change,
                    event.accumulation
                ]
            );
        } catch (error) {
            // logger.error(`Error inserting Navi event:`, error);
            throw error;
        }
    }

    static async getLatestEvent(isDeposit: boolean): Promise<NaviEvent[] | undefined> {
        const tableName = isDeposit ? EVENT_TABLES.NAVI.DEPOSIT : EVENT_TABLES.NAVI.WITHDRAW;
        try {
            const [rows] = await pool.query(`
                SELECT * FROM ${tableName} 
                ORDER BY timestamp DESC 
                LIMIT 1
            `);
            return rows as NaviEvent[];
        } catch (error) {
            // logger.error(`Error getting latest Navi event:`, error);
            return undefined;
        }
    }

    static async getEventsByTimeRange(startTime: number, endTime: number, isDeposit: boolean): Promise<NaviEvent[]> {
        const tableName = isDeposit ? EVENT_TABLES.NAVI.DEPOSIT : EVENT_TABLES.NAVI.WITHDRAW;
        try {
            const [rows] = await pool.query(
                `SELECT * FROM ${tableName} WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC`,
                [startTime, endTime]
            );
            return rows as NaviEvent[];
        } catch (error) {
            // logger.error(`Error getting Navi events by time range:`, error);
            throw error;
        }
    }
} 