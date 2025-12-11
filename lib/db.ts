import Dexie, { Table } from 'dexie';


export interface FoodItem {
    id?: number;
    name: string;
    usage_count: number;
}

export interface Log {
    id?: number;
    mood?: number; // 1-5
    work?: number; // hours
    sleep?: number; // hours
    sleep_start?: string; // HH:mm
    sleep_end?: string; // HH:mm
    water?: number; // liters
    food?: string; // description (legacy)
    meal?: {
        type: string; // 'desayuno', 'almuerzo', etc.
        items: string[];
        time: string; // 'HH:mm'
    };
    journal?: string; // long-form text
    custom?: { name: string; value: number; unit: string }[];
    date: Date;
}

// Sync queue for offline operations
export interface SyncQueueItem {
    id?: number;
    operationType: 'create' | 'update' | 'delete';
    tableName: string;
    data: Record<string, unknown>;
    createdAt: Date;
    retryCount: number;
    lastError?: string;
}

export class PersonalTrackerDB extends Dexie {
    logs!: Table<Log>;
    foodItems!: Table<FoodItem>;
    syncQueue!: Table<SyncQueueItem>;

    constructor() {
        super('PersonalTrackerDB');
        this.version(9).stores({
            logs: '++id, mood, work, sleep, sleep_start, sleep_end, water, food, journal, date',
            foodItems: '++id, &name, usage_count',
            syncQueue: '++id, operationType, tableName, createdAt'
        });
    }
}

export const db = new PersonalTrackerDB();
