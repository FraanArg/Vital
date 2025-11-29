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

export class PersonalTrackerDB extends Dexie {
    logs!: Table<Log>;
    foodItems!: Table<FoodItem>;

    constructor() {
        super('PersonalTrackerDB');
        this.version(8).stores({
            logs: '++id, mood, work, sleep, sleep_start, sleep_end, water, food, journal, date',
            foodItems: '++id, &name, usage_count'
        });
    }
}

export const db = new PersonalTrackerDB();
