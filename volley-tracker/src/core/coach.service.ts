import { Injectable } from '@angular/core';
import { DbService } from './db';
import { uid, nowISO } from './helpers';

export interface Coach {
    id: string;
    name: string;
    createdAt: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class CoachService {
    constructor(private db: DbService) { } // inject the DbService

    // ---------- CRUD ----------

    // return all coaches and sort them by createdAt descending -> the most recently created first
    async getAll(): Promise<Coach[]> { // връща масив от редове, които типизираме като Coach
        return this.db.query<Coach>(
            `SELECT id, name, createdAt
       FROM coaches
       ORDER BY createdAt DESC`
        );
    }

    // ? е placeholder (за да избегнеш SQL injection + да е чисто)
    // ако няма такъв треньор, връща null
    async getById(id: string): Promise<Coach | null> {
        const rows = await this.db.query<Coach>(
            `SELECT id, name, createdAt
       FROM coaches
       WHERE id = ?
       LIMIT 1`,
            [id]
        );
        return rows[0] ?? null;
    }

    async create(name: string): Promise<Coach> {
        const trimmed = (name ?? '').trim(); // check for empty or whitespace-only names
        if (!trimmed) throw new Error('Coach name is required.'); // if empty, throw error and the UX will show it

        // uniqueness check (case-insensitive)
        const existing = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt
       FROM coaches
       WHERE LOWER(name) = LOWER(?)`, // case-insensitive check Vladi === vladi
            [trimmed]
        );
        if ((existing[0]?.cnt ?? 0) > 0) {
            throw new Error('Coach with this name already exists.');
        }

        const coach: Coach = {
            id: uid('coach'), // generate unique id with prefix 'coach'
            name: trimmed,
            createdAt: nowISO(),
        };

        // insert the new coach into the database
        await this.db.execute(
            `INSERT INTO coaches (id, name, createdAt)
       VALUES (?, ?, ?)`,
            [coach.id, coach.name, coach.createdAt]
        );

        return coach; // return the created coach
    }

    async rename(id: string, newName: string): Promise<void> {
        const trimmed = (newName ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const exists = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt
       FROM coaches
       WHERE id <> ?
         AND LOWER(name) = LOWER(?)`,
            [id, trimmed]
        );
        if ((exists[0]?.cnt ?? 0) > 0) {
            throw new Error('Coach with this name already exists.');
        }

        await this.db.execute(
            `UPDATE coaches
       SET name = ?
       WHERE id = ?`,
            [trimmed, id]
        );
    }

    // In DB we have FOREIGN KEY (coachId) REFERENCES coaches(id) ON DELETE CASCADE
    // That means if we delete a coach here, all their groups, players, trainings and attendance records
    // will be automatically deleted by SQLite.
    async delete(id: string): Promise<void> {
        // ON DELETE CASCADE in schema will delete groups/players/trainings/attendance for that coach
        await this.db.execute(`DELETE FROM coaches WHERE id = ?`, [id]);

        // if deleted coach was active -> clear active coach
        const active = await this.getActiveCoachId();
        if (active === id) {
            await this.setActiveCoachId(null);
        }
    }

    // ---------- Active coach (SQLite table) ----------

    /**
     * We keep active coach in SQLite, so everything is consistent & offline.
     * This is a "single-row config" table pattern.
     */
    private readonly ACTIVE_KEY = 'ACTIVE_COACH_ID';

    async getActiveCoachId(): Promise<string | null> {
        const rows = await this.db.query<{ value: string | null }>(
            `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
            [this.ACTIVE_KEY]
        );

        const v = rows[0]?.value ?? null;
        return v && v.trim() ? v : null;
    }

    async setActiveCoachId(coachId: string | null): Promise<void> {
        // UPSERT pattern
        await this.db.execute(
            `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [this.ACTIVE_KEY, coachId]
        );
    }

    async getActiveCoach(): Promise<Coach | null> {
        const id = await this.getActiveCoachId();
        if (!id) return null;
        return this.getById(id);
    }
}