import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AppStateV1, Group } from './models';

const STATE_KEY = 'vt.state.v1';

function createEmptyState(): AppStateV1 {
    return {
        coachName: null,
        groups: [],
        players: [],
        attendance: {},
    };
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
    async getState(): Promise<AppStateV1> {
        const { value } = await Preferences.get({ key: STATE_KEY });
        if (!value) return createEmptyState();

        try {
            const parsed = JSON.parse(value);
            // merge с defaults, за да не крашва ако липсва поле
            return { ...createEmptyState(), ...parsed };
        } catch {
            // ако има corrupted JSON — ресет
            const empty = createEmptyState();
            await Preferences.set({ key: STATE_KEY, value: JSON.stringify(empty) });
            return empty;
        }
    }

    async setState(next: AppStateV1): Promise<void> {
        await Preferences.set({ key: STATE_KEY, value: JSON.stringify(next) });
    }

    async getCoachName(): Promise<string | null> {
        const s = await this.getState();
        return s.coachName;
    }

    async setCoachName(name: string): Promise<void> {
        const trimmed = (name || '').trim();
        if (!trimmed) throw new Error('Coach name is required.');

        const s = await this.getState();
        s.coachName = trimmed;
        await this.setState(s);
    }

    async clearCoachName(): Promise<void> {
        const s = await this.getState();
        s.coachName = null;
        await this.setState(s);
    }

    async getAll(): Promise<Group[]> {
        const s = await this.getState();
        return s.groups ?? [];
    }

    async create(name: string): Promise<Group> {
        const trimmed = (name || '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const s = await this.getState();

        const exists = (s.groups ?? []).some(g => g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('A group with this name already exists.');

        const now = new Date().toISOString();
        const g: Group = {
            id: crypto.randomUUID(),
            name: trimmed,
            createdAt: now,
        };

        s.groups = [...(s.groups ?? []), g];
        await this.setState(s);
        return g;
    }

    async rename(id: string, newName: string): Promise<void> {
        const trimmed = (newName || '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const s = await this.getState();

        const exists = (s.groups ?? []).some(g => g.id !== id && g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('A group with this name already exists.');

        s.groups = (s.groups ?? []).map(g => (g.id === id ? { ...g, name: trimmed } : g));
        await this.setState(s);
    }

    async delete(id: string): Promise<void> {
        const s = await this.getState();
        s.groups = (s.groups ?? []).filter(g => g.id !== id);

        // (по желание) чистим players + attendance за групата
        s.players = (s.players ?? []).filter(p => p.groupId !== id);
        if (s.attendance && s.attendance[id]) {
            delete s.attendance[id];
        }

        await this.setState(s);
    }
}