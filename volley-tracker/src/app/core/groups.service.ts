import { Injectable } from "@angular/core";
import { StorageService } from "./storage.service";
import { Group } from "./models";

function uid(prefix = 'g'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
    constructor(private storage: StorageService) { }

    async getAll(): Promise<Group[]> {
        const state = await this.storage.load();
        return [...state.groups].sort((a, b) => a.name.localeCompare(b.name));
    }

    async create(name: string): Promise<Group> {
        const trimmed = name.trim();
        if (trimmed.length < 2) throw new Error('Group name is too short.');

        const state = await this.storage.load();

        const exists = state.groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('A group with this name already exists.');

        const group: Group = {
            id: uid('g'),
            name: trimmed,
            createdAt: new Date().toISOString()
        };

        state.groups.push(group);
        await this.storage.save(state);

        return group;
    }

    async rename(id: string, name: string): Promise<Group> {
        const trimmed = name.trim();
        if (trimmed.length < 2) throw new Error('Group name is too short.');

        const state = await this.storage.load();

        const exists = state.groups.some(g => g.id !== id && g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('A group with this name already exists.');

        const g = state.groups.find(x => x.id === id);
        if (!g) throw new Error('Group not found.');

        g.name = trimmed;
        await this.storage.save(state);

        return g;
    }

    async delete(id: string): Promise<void> {
        const state = await this.storage.load();

        state.groups = state.groups.filter(g => g.id !== id);

        // Also remove players associated with this group
        state.players = state.players.filter(p => p.groupId !== id);

        delete state.attendance[id];

        await this.storage.save(state);
    }
}