import Dexie, { Table } from 'dexie';

export interface Log {
    id?: number;
    mood?: number; // 1-5
    work?: number; // hours
    sleep?: number; // hours
    water?: number; // glasses
    food?: string; // description
    journal?: string; // long-form text
    custom?: { name: string; value: number; unit: string }[];
    date: Date;
}

export class PersonalTrackerDB extends Dexie {
    logs!: Table<Log>;

    constructor() {
        super('PersonalTrackerDB');
        this.version(6).stores({
            logs: '++id, mood, work, sleep, water, food, journal, date'
        });
    }
}

export const db = new PersonalTrackerDB();
