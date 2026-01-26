import { Injectable } from '@angular/core';
import { DbService } from './db';
import { uid, nowISO } from './helpers';

export interface Coach {
    id: string;
    name: string;
    createdAt: string; // ISO
}

const ACTIVE_COACH_KEY = 'activeCoachId';

@Injectable({ providedIn: 'root' })
export class CoachService {
    constructor(private db: DbService) { }

    // ---------- CRUD ----------

    async getAll(): Promise<Coach[]> {
        return this.db.query<Coach>(
            `SELECT id, name, createdAt
       FROM coaches
       ORDER BY createdAt DESC`
        );
    }

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
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        // uniqueness check (case-insensitive)
        const existing = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt
       FROM coaches
       WHERE LOWER(name) = LOWER(?)`,
            [trimmed]
        );
        if ((existing[0]?.cnt ?? 0) > 0) {
            throw new Error('Coach with this name already exists.');
        }

        const coach: Coach = {
            id: uid('coach'),
            name: trimmed,
            createdAt: nowISO(),
        };

        await this.db.execute(
            `INSERT INTO coaches (id, name, createdAt)
       VALUES (?, ?, ?)`,
            [coach.id, coach.name, coach.createdAt]
        );

        return coach;
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

    async delete(id: string): Promise<void> {
        await this.db.execute(`DELETE FROM coaches WHERE id = ?`, [id]);

        const active = await this.getActiveCoachId();
        if (active === id) {
            await this.setActiveCoachId(null);
        }
    }

    // ---------- Active coach (SQLite: app_settings) ----------

    async getActiveCoachId(): Promise<string | null> {
        const rows = await this.db.query<{ value: string | null }>(
            `SELECT value
       FROM app_settings
       WHERE key = ?
       LIMIT 1`,
            [ACTIVE_COACH_KEY]
        );

        const v = rows[0]?.value ?? null;
        return v && v.trim() ? v : null;
    }

    async setActiveCoachId(coachId: string | null): Promise<void> {
        // Upsert pattern: INSERT or UPDATE
        await this.db.execute(
            `INSERT INTO app_settings (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [ACTIVE_COACH_KEY, coachId]
        );
    }

    async getActiveCoach(): Promise<Coach | null> {
        const id = await this.getActiveCoachId();
        if (!id) return null;
        return this.getById(id);
    }
}