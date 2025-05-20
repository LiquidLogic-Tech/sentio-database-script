import { pool } from "../commands";
import { EVENT_TABLES } from "../const.js";
import { toMysqlTimestamp } from "../utils";
// import { logger } from "../logger.js";

export interface MoleEvent {
    event_id: string;
    timestamp: number;
    sender: string;
    transaction_hash: string;
    asset: string;
    asset_change: string;
    accumulation: string;
}

export interface MoleFarmEvent {
    event_id: string;
    timestamp: number;
    sender: string;
    transaction_hash: string;
    accumulation_a: string;
    accumulation_b: string;
    asset_a: string;
    asset_b: string;
    asset_change_a: string;
    asset_change_b: string;
}

export class MoleDbHandler {
    static async insertEvent(event: MoleEvent, isDeposit: boolean): Promise<void> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_SAVING.DEPOSIT : EVENT_TABLES.MOLE_SAVING.WITHDRAW;
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
            // logger.error(`Error inserting Mole Saving event:`, error);
            throw error;
        }
    }

    static async insertFarmEvent(event: MoleFarmEvent, isDeposit: boolean): Promise<void> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_FARM.DEPOSIT : EVENT_TABLES.MOLE_FARM.WITHDRAW;
        try {
            await pool.query(
                `INSERT IGNORE INTO ${tableName} 
                (event_id, timestamp, sender, transaction_hash, accumulation_a, accumulation_b, 
                asset_a, asset_b, asset_change_a, asset_change_b) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    event.event_id,
                    toMysqlTimestamp(event.timestamp),
                    event.sender,
                    event.transaction_hash,
                    event.accumulation_a,
                    event.accumulation_b,
                    event.asset_a,
                    event.asset_b,
                    event.asset_change_a,
                    event.asset_change_b
                ]
            );
        } catch (error) {
            // logger.error(`Error inserting Mole Farm event:`, error);
            throw error;
        }
    }

    static async getLatestEvent(isDeposit: boolean): Promise<MoleEvent[] | undefined> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_SAVING.DEPOSIT : EVENT_TABLES.MOLE_SAVING.WITHDRAW;
        try {
            const [rows] = await pool.query(`
                SELECT * FROM ${tableName} 
                ORDER BY timestamp DESC 
                LIMIT 1
            `);
            return rows as MoleEvent[];
        } catch (error) {
            // logger.error(`Error getting latest Mole Saving event:`, error);
            return undefined;
        }
    }

    static async getLatestFarmEvent(isDeposit: boolean): Promise<MoleFarmEvent[] | undefined> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_FARM.DEPOSIT : EVENT_TABLES.MOLE_FARM.WITHDRAW;
        try {
            const [rows] = await pool.query(`
                SELECT * FROM ${tableName} 
                ORDER BY timestamp DESC 
                LIMIT 1
            `);
            return rows as MoleFarmEvent[];
        } catch (error) {
            // logger.error(`Error getting latest Mole Farm event:`, error);
            return undefined;
        }
    }

    static async getEventsByTimeRange(startTime: number, endTime: number, isDeposit: boolean): Promise<MoleEvent[]> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_SAVING.DEPOSIT : EVENT_TABLES.MOLE_SAVING.WITHDRAW;
        try {
            const [rows] = await pool.query(
                `SELECT * FROM ${tableName} WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC`,
                [startTime, endTime]
            );
            return rows as MoleEvent[];
        } catch (error) {
            // logger.error(`Error getting Mole Saving events by time range:`, error);
            throw error;
        }
    }

    static async getFarmEventsByTimeRange(startTime: number, endTime: number, isDeposit: boolean): Promise<MoleFarmEvent[]> {
        const tableName = isDeposit ? EVENT_TABLES.MOLE_FARM.DEPOSIT : EVENT_TABLES.MOLE_FARM.WITHDRAW;
        try {
            const [rows] = await pool.query(
                `SELECT * FROM ${tableName} WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp ASC`,
                [startTime, endTime]
            );
            return rows as MoleFarmEvent[];
        } catch (error) {
            // logger.error(`Error getting Mole Farm events by time range:`, error);
            throw error;
        }
    }
} 