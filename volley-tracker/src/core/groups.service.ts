import { Injectable } from '@angular/core';
import { DbService } from './db';
import { uid, nowISO } from './helpers';
import { CoachService } from './coach.service';

export interface Group {
    id: string;
    coachId: string;
    name: string;
    createdAt: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
    constructor(private db: DbService, private coachService: CoachService) { }

    // Helper: взима активния coachId или хвърля грешка
    private async requireActiveCoachId(): Promise<string> {
        const coachId = await this.coachService.getActiveCoachId();
        if (!coachId) throw new Error('No active coach selected.');
        return coachId;
    }

    // Връща всички групи за активния треньор
    async getAllForActiveCoach(): Promise<Group[]> {
        const coachId = await this.requireActiveCoachId();

        return this.db.query<Group>(
            `SELECT id, coachId, name, createdAt
       FROM groups
       WHERE coachId = ?
       ORDER BY createdAt DESC`,
            [coachId]
        );
    }

    // Връща група по id (само ако е на активния треньор)
    async getById(groupId: string): Promise<Group | null> {
        const coachId = await this.requireActiveCoachId();

        const rows = await this.db.query<Group>(
            `SELECT id, coachId, name, createdAt
       FROM groups
       WHERE id = ? AND coachId = ?
       LIMIT 1`,
            [groupId, coachId]
        );

        return rows[0] ?? null;
    }

    // Създава група за активния треньор
    async create(name: string): Promise<Group> {
        const coachId = await this.requireActiveCoachId();

        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        // уникалност на име per coach (case-insensitive)
        const exists = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt
       FROM groups
       WHERE coachId = ?
         AND LOWER(name) = LOWER(?)`,
            [coachId, trimmed]
        );

        if ((exists[0]?.cnt ?? 0) > 0) {
            throw new Error('Group with this name already exists.');
        }

        const g: Group = {
            id: uid('group'),
            coachId,
            name: trimmed,
            createdAt: nowISO(),
        };

        await this.db.execute(
            `INSERT INTO groups (id, coachId, name, createdAt)
       VALUES (?, ?, ?, ?)`,
            [g.id, g.coachId, g.name, g.createdAt]
        );

        return g;
    }

    // Rename (само за активния треньор)
    async rename(groupId: string, newName: string): Promise<void> {
        const coachId = await this.requireActiveCoachId();

        const trimmed = (newName ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        // unique per coach
        const exists = await this.db.query<{ cnt: number }>(
            `SELECT COUNT(1) as cnt
       FROM groups
       WHERE coachId = ?
         AND id <> ?
         AND LOWER(name) = LOWER(?)`,
            [coachId, groupId, trimmed]
        );

        if ((exists[0]?.cnt ?? 0) > 0) {
            throw new Error('Group with this name already exists.');
        }

        await this.db.execute(
            `UPDATE groups
       SET name = ?
       WHERE id = ? AND coachId = ?`,
            [trimmed, groupId, coachId]
        );
    }

    // Delete (само за активния треньор)
    async delete(groupId: string): Promise<void> {
        const coachId = await this.requireActiveCoachId();

        await this.db.execute(
            `DELETE FROM groups
       WHERE id = ? AND coachId = ?`,
            [groupId, coachId]
        );
    }
}