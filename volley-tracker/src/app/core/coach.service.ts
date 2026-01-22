import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { DbService } from './db';
import { Coach } from './models';

const ACTIVE_COACH_KEY = 'VT_ACTIVE_COACH_ID';

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class CoachService {
    private _activeCoachId: string | null = null;
    private _initPromise: Promise<void> | null = null;

    constructor(private db: DbService) { }

    get activeCoachId(): string | null {
        return this._activeCoachId;
    }

    // 1) Init: зарежда active coach id от Preferences и валидира, че този coach съществува
    async init(): Promise<void> {
        if (this._initPromise) return this._initPromise;

        this._initPromise = (async () => {
            await this.db.init();

            const { value } = await Preferences.get({ key: ACTIVE_COACH_KEY });
            this._activeCoachId = value ?? null;

            // ако има запомнен activeCoachId, но coach вече не съществува -> чистим
            if (this._activeCoachId) {
                const exists = await this.getById(this._activeCoachId);
                if (!exists) {
                    this._activeCoachId = null;
                    await Preferences.remove({ key: ACTIVE_COACH_KEY });
                }
            }
        })();

        try {
            await this._initPromise;
        } finally {
            this._initPromise = null;
        }
    }

    // 2) List coaches
    async getAll(): Promise<Coach[]> {
        await this.db.init();
        return await this.db.query<Coach>(`
      SELECT id, name, createdAt
      FROM coaches
      ORDER BY datetime(createdAt) DESC
    `);
    }

    // 3) Get by id
    async getById(id: string): Promise<Coach | null> {
        await this.db.init();
        const rows = await this.db.query<Coach>(
            `SELECT id, name, createdAt FROM coaches WHERE id = ? LIMIT 1`,
            [id]
        );
        return rows[0] ?? null;
    }

    // 4) Create coach (CRUD: Create)
    async create(name: string): Promise<Coach> {
        await this.db.init();

        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const exists = await this.db.query<{ id: string }>(
            `SELECT id FROM coaches WHERE lower(name) = lower(?) LIMIT 1`,
            [trimmed]
        );
        if (exists.length) throw new Error('Coach with this name already exists.');

        const coach: Coach = {
            id: uid(),
            name: trimmed,
            createdAt: new Date().toISOString(),
        };

        await this.db.execute(
            `INSERT INTO coaches (id, name, createdAt) VALUES (?, ?, ?)`,
            [coach.id, coach.name, coach.createdAt]
        );

        // ако няма активен coach -> направи новия активен
        await this.init();
        if (!this._activeCoachId) {
            await this.setActiveCoach(coach.id);
        }

        return coach;
    }

    // 5) Update coach name (CRUD: Update)
    async rename(id: string, newName: string): Promise<void> {
        await this.db.init();

        const trimmed = (newName ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const exists = await this.db.query<{ id: string }>(
            `SELECT id FROM coaches WHERE id = ? LIMIT 1`,
            [id]
        );
        if (!exists.length) throw new Error('Coach not found.');

        const dup = await this.db.query<{ id: string }>(
            `SELECT id FROM coaches WHERE lower(name) = lower(?) AND id != ? LIMIT 1`,
            [trimmed, id]
        );
        if (dup.length) throw new Error('Coach with this name already exists.');

        await this.db.execute(`UPDATE coaches SET name = ? WHERE id = ?`, [trimmed, id]);
    }

    // 6) Delete coach (CRUD: Delete) + ако е активен -> чистим Preferences
    async delete(id: string): Promise<void> {
        await this.db.init();

        await this.db.execute(`DELETE FROM coaches WHERE id = ?`, [id]);

        await this.init();
        if (this._activeCoachId === id) {
            this._activeCoachId = null;
            await Preferences.remove({ key: ACTIVE_COACH_KEY });
        }
    }

    // 7) Set active coach (Active coach)
    async setActiveCoach(id: string): Promise<void> {
        await this.db.init();

        const coach = await this.getById(id);
        if (!coach) throw new Error('Coach not found.');

        this._activeCoachId = id;
        await Preferences.set({ key: ACTIVE_COACH_KEY, value: id });
    }

    // 8) Convenience: активният coach като обект
    async getActiveCoach(): Promise<Coach | null> {
        await this.init();
        if (!this._activeCoachId) return null;
        return await this.getById(this._activeCoachId);
    }
}