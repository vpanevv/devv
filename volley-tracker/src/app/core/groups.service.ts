import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AppStateV1, Group } from './models';

const KEY_CURRENT_COACH = 'vt.currentCoach';
const KEY_STATE_PREFIX = 'vt.state.v1.'; // + encodeURIComponent(coachName)

function emptyState(coachName: string): AppStateV1 {
    return {
        coachName,
        groups: [],
        players: [],
        attendance: {},
    };
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
    // ---- Coach helpers ----
    async getCoachName(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEY_CURRENT_COACH });
        const name = (value ?? '').trim();
        return name.length ? name : null;
    }

    async setCoachName(name: string): Promise<void> {
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        await Preferences.set({ key: KEY_CURRENT_COACH, value: trimmed });

        // ensure state exists for this coach
        const stateKey = this.stateKey(trimmed);
        const existing = await Preferences.get({ key: stateKey });
        if (!existing.value) {
            await Preferences.set({
                key: stateKey,
                value: JSON.stringify(emptyState(trimmed)),
            });
        }
    }

    async clearCoachName(): Promise<void> {
        await Preferences.remove({ key: KEY_CURRENT_COACH });
    }

    // ---- Groups API ----
    async getAll(): Promise<Group[]> {
        const state = await this.readStateOrThrow();
        // stable ordering (by createdAt)
        return [...state.groups].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    async create(name: string): Promise<void> {
        const state = await this.readStateOrThrow();
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const exists = state.groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('A group with this name already exists.');

        const now = new Date().toISOString();
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

        state.groups.push({ id, name: trimmed, createdAt: now });
        await this.writeState(state);
    }

    async rename(id: string, name: string): Promise<void> {
        const state = await this.readStateOrThrow();
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const g = state.groups.find(x => x.id === id);
        if (!g) throw new Error('Group not found.');

        const exists = state.groups.some(
            x => x.id !== id && x.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) throw new Error('A group with this name already exists.');

        g.name = trimmed;
        await this.writeState(state);
    }

    async delete(id: string): Promise<void> {
        const state = await this.readStateOrThrow();

        const group = state.groups.find(x => x.id === id);
        if (!group) return;

        // remove group
        state.groups = state.groups.filter(x => x.id !== id);

        // remove players in that group
        state.players = state.players.filter(p => p.groupId !== id);

        // remove attendance for that group
        delete state.attendance[id];

        await this.writeState(state);
    }

    // ---- Extra helper: players count per group ----
    async getPlayersCount(groupId: string): Promise<number> {
        const state = await this.readStateOrThrow();
        return state.players.filter(p => p.groupId === groupId).length;
    }

    // ---- Storage internals ----
    private stateKey(coachName: string): string {
        return KEY_STATE_PREFIX + encodeURIComponent(coachName);
    }

    private async readStateOrThrow(): Promise<AppStateV1> {
        const coach = await this.getCoachName();
        if (!coach) throw new Error('Coach name not set.');

        const key = this.stateKey(coach);
        const { value } = await Preferences.get({ key });

        if (!value) {
            const st = emptyState(coach);
            await Preferences.set({ key, value: JSON.stringify(st) });
            return st;
        }

        return JSON.parse(value) as AppStateV1;
    }

    private async writeState(state: AppStateV1): Promise<void> {
        const coach = await this.getCoachName();
        if (!coach) throw new Error('Coach name not set.');

        const key = this.stateKey(coach);
        await Preferences.set({ key, value: JSON.stringify(state) });
    }
}