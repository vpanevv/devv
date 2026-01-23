import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
} from '@capacitor-community/sqlite';

const DB_NAME = 'volleytracker';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class DbService {
    private sqlite = new SQLiteConnection(CapacitorSQLite);
    private db: SQLiteDBConnection | null = null;

    // пазим init Promise, за да не се инициализира 2 пъти едновременно
    private initializing: Promise<void> | null = null;

    /**
     * Отваря базата и създава таблиците (ако ги няма).
     * Извиквай го спокойно от всяко място – вътре е "safe" (няма да отвори 2 пъти).
     */
    async init(): Promise<void> {
        if (this.db) return;
        if (this.initializing) return this.initializing;

        this.initializing = (async () => {
            const platform = Capacitor.getPlatform();

            // Ние ще тестваме само в Xcode simulator (ios),
            // така че WEB не ни трябва. Но слагаме guard за яснота:
            if (platform === 'web') {
                throw new Error(
                    'SQLite web support is disabled in this project. Run on iOS simulator/device.'
                );
            }

            this.db = await this.sqlite.createConnection(
                DB_NAME,
                false,            // encrypted
                'no-encryption',
                DB_VERSION,
                false             // readonly
            );

            await this.db.open();
            await this.runMigrations();
        })();

        try {
            await this.initializing;
        } finally {
            this.initializing = null;
        }
    }

    /**
     * Създава/ъпдейтва schema-а. Засега V1.
     */
    private async runMigrations(): Promise<void> {
        if (!this.db) throw new Error('DB not initialized');

        // Foreign keys (важно за ON DELETE CASCADE)
        await this.db.execute(`PRAGMA foreign_keys = ON;`);

        // V1 schema
        await this.db.execute(`
      CREATE TABLE IF NOT EXISTS coaches (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      -- един "settings" ред за active coach (за да не ползваме Preferences)
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );

      -- groups са вързани към coach
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_groups_coachId ON groups(coachId);

      -- players са вързани към group + coach (лесно филтриране)
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        groupId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_players_groupId ON players(groupId);
      CREATE INDEX IF NOT EXISTS idx_players_coachId ON players(coachId);

      -- trainings (по 1 ред на тренировка за група и дата)
      CREATE TABLE IF NOT EXISTS trainings (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        groupId TEXT NOT NULL,
        date TEXT NOT NULL,     -- YYYY-MM-DD
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_trainings_group_date ON trainings(groupId, date);

      -- attendance: 1 запис за (trainingId, playerId)
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        groupId TEXT NOT NULL,
        trainingId TEXT NOT NULL,
        playerId TEXT NOT NULL,
        status TEXT NOT NULL,   -- 'present' | 'absent' | 'excused'
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE,
        FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS ux_attendance_training_player
      ON attendance(trainingId, playerId);
    `);
    }

    // ---------------------------
    // Helpers (за всички services)
    // ---------------------------

    async query<T = any>(statement: string, values: any[] = []): Promise<T[]> {
        await this.init();
        if (!this.db) throw new Error('DB not initialized');
        const res = await this.db.query(statement, values);
        return (res.values ?? []) as T[];
    }

    async execute(statement: string, values: any[] = []): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('DB not initialized');
        await this.db.run(statement, values);
    }

    /**
     * Полезно за бъдещи операции (пример: delete coach -> delete groups -> delete players),
     * за да е всичко атомарно.
     */
    async transaction(fn: () => Promise<void>): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('DB not initialized');
        await this.db.execute('BEGIN;');
        try {
            await fn();
            await this.db.execute('COMMIT;');
        } catch (e) {
            await this.db.execute('ROLLBACK;');
            throw e;
        }
    }

    async close(): Promise<void> {
        if (!this.db) return;
        await this.db.close();
        await this.sqlite.closeConnection(DB_NAME, false); // readonly=false
        this.db = null;
    }
}