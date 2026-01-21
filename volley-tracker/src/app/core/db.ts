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
  private initializing: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initializing) return this.initializing;

    this.initializing = (async () => {
      const platform = Capacitor.getPlatform();

      // ✅ IMPORTANT for WEB (ionic serve) – initialize jeep-sqlite bridge
      if (platform === 'web') {
        // This is provided by jeep-sqlite (see main.ts + index.html below)
        // @ts-ignore
        await customElements.whenDefined('jeep-sqlite');
        // @ts-ignore
        const jeepEl = document.querySelector('jeep-sqlite');
        if (!jeepEl) throw new Error('jeep-sqlite element not found in index.html');

        await this.sqlite.initWebStore();
      }

      this.db = await this.sqlite.createConnection(
        DB_NAME,
        false,              // encrypted
        'no-encryption',
        DB_VERSION,
        false               // readonly
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

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('DB not initialized');

    // Enable foreign keys
    await this.db.execute(`PRAGMA foreign_keys = ON;`);

    // Schema (V1)
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS coaches (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_groups_coachId ON groups(coachId);

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

      CREATE TABLE IF NOT EXISTS trainings (
        id TEXT PRIMARY KEY NOT NULL,
        coachId TEXT NOT NULL,
        groupId TEXT NOT NULL,
        date TEXT NOT NULL,     -- ISO date: YYYY-MM-DD
        createdAt TEXT NOT NULL,
        FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_trainings_group_date ON trainings(groupId, date);

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

  // Helper: SELECT
  async query<T = any>(statement: string, values: any[] = []): Promise<T[]> {
    await this.init();
    if (!this.db) throw new Error('DB not initialized');
    const res = await this.db.query(statement, values);
    return (res.values ?? []) as T[];
  }

  // Helper: INSERT/UPDATE/DELETE
  async execute(statement: string, values: any[] = []): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('DB not initialized');
    await this.db.run(statement, values);
  }

  // Optional helper: close db
  async close(): Promise<void> {
    if (!this.db) return;

    await this.db.close();
    await this.sqlite.closeConnection(DB_NAME, false); // 👈 вторият аргумент е readonly
    this.db = null;
  }
}


// Ролята на dbService:
// Това ще е единственото място, което говори със SQLite:
// 	•	open database
// 	•	migrations (таблици)
// 	•	queries
// 	•	transactions

// Всички други services ще го ползват:
// 	•	CoachService
// 	•	GroupsService
// 	•	PlayersService
// 	•	TrainingsService
// 	•	AttendanceService