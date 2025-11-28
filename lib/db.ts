import Dexie, { Table } from 'dexie';

export interface Log {
    id?: number;
    mood?: number; // 1-5
    sleep?: number; // hours
    water?: number; // glasses
    food?: string; // description
    date: Date;
}

export class PersonalTrackerDB extends Dexie {
    logs!: Table<Log>;

    constructor() {
        super('PersonalTrackerDB');
        this.version(1).stores({
            logs: '++id, mood, sleep, water, food, date'
        });
    }
}

export const db = new PersonalTrackerDB();
