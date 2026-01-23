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
    async getActiveCoachId(): Promise<string | null> {
        // ensure meta row exists
        await this.ensureMetaRow();

        const rows = await this.db.query<{ activeCoachId: string | null }>(
            `SELECT activeCoachId FROM app_meta WHERE id = 1 LIMIT 1`
        );

        const v = rows[0]?.activeCoachId ?? null;
        return v && v.trim() ? v : null;
    }

    async setActiveCoachId(coachId: string | null): Promise<void> {
        await this.ensureMetaRow();
        await this.db.execute(
            `UPDATE app_meta
       SET activeCoachId = ?
       WHERE id = 1`,
            [coachId]
        );
    }

    async getActiveCoach(): Promise<Coach | null> {
        const id = await this.getActiveCoachId();
        if (!id) return null;
        return this.getById(id);
    }

    // ---------- internal ----------

    private async ensureMetaRow(): Promise<void> {
        // Create the table if not exists (safe), then ensure row id=1 exists.
        // NOTE: If you already created app_meta in migrations, this is still safe.
        await this.db.execute(`
      CREATE TABLE IF NOT EXISTS app_meta (
        id INTEGER PRIMARY KEY NOT NULL,
        activeCoachId TEXT NULL
      );
    `);

        const rows = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt FROM app_meta WHERE id = 1`
        );

        if ((rows[0]?.cnt ?? 0) === 0) {
            await this.db.execute(
                `INSERT INTO app_meta (id, activeCoachId)
         VALUES (1, NULL)`
            );
        }
    }
}