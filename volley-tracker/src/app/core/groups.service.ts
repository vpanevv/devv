import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CoachService } from './coach.service';
import { Group } from './models';

function groupsKey(coachId: string) {
    return `VT_GROUPS_${coachId}`;
}

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
    constructor(private coachService: CoachService) { }

    private async requireCoachId(): Promise<string> {
        await this.coachService.init();
        const id = this.coachService.activeCoachId;
        if (!id) throw new Error('No active coach selected.');
        return id;
    }

    async getAll(): Promise<Group[]> {
        const coachId = await this.requireCoachId();
        const { value } = await Preferences.get({ key: groupsKey(coachId) });
        return value ? (JSON.parse(value) as Group[]) : [];
    }

    async getById(groupId: string): Promise<Group | null> {
        const groups = await this.getAll();
        return groups.find(g => g.id === groupId) ?? null;
    }

    async create(name: string): Promise<void> {
        const coachId = await this.requireCoachId();
        const trimmed = (name ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const groups = await this.getAll();
        const exists = groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) throw new Error('Group with this name already exists.');

        const g: Group = { id: uid(), name: trimmed, createdAt: new Date().toISOString() };
        groups.unshift(g);

        await Preferences.set({ key: groupsKey(coachId), value: JSON.stringify(groups) });
    }

    async rename(groupId: string, newName: string): Promise<void> {
        const coachId = await this.requireCoachId();
        const trimmed = (newName ?? '').trim();
        if (!trimmed) throw new Error('Group name is required.');

        const groups = await this.getAll();
        const exists = groups.some(
            g => g.id !== groupId && g.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) throw new Error('Group with this name already exists.');

        const idx = groups.findIndex(g => g.id === groupId);
        if (idx < 0) throw new Error('Group not found.');

        groups[idx] = { ...groups[idx], name: trimmed };
        await Preferences.set({ key: groupsKey(coachId), value: JSON.stringify(groups) });
    }

    async delete(groupId: string): Promise<void> {
        const coachId = await this.requireCoachId();
        const groups = await this.getAll();
        const next = groups.filter(g => g.id !== groupId);
        await Preferences.set({ key: groupsKey(coachId), value: JSON.stringify(next) });
    }
}